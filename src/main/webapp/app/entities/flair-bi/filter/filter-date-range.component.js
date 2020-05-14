(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('filterDateRange', {
            templateUrl: 'app/entities/flair-bi/filter/filter-date-range.component.html',
            controller: FilterDateRangeController,
            controllerAs: 'vm',
            bindings: {
                dimension: '<',
                reload: '<',
                onDateChange: '&',
            }
        });

    FilterDateRangeController.$inject = ['$scope','filterParametersService','DYNAMIC_DATE_RANGE_CONFIG'];

    function FilterDateRangeController($scope,filterParametersService,DYNAMIC_DATE_RANGE_CONFIG) {
        var TAB_DAY = 0;
        var TAB_RANGE = 1;
        var TAB_DYNAMIC = 2;
        setDateRangeSubscription();
        var vm = this;
        vm.$onInit = onInit;
        vm.$onChanges = $onChanges;
        vm.onDateRangeClick = onDateRangeClick;
        vm.onInputChange = onInputChange;
        vm.onDynamicDateRangeChanged = onDynamicDateRangeChanged;
        vm.onCustomDynamicDateRangeChange = onCustomDynamicDateRangeChange;
        vm.dynamicDateRangeConfig = DYNAMIC_DATE_RANGE_CONFIG;
        reset();

        ////////////////

        function onInit() {
        }

        function reset() {
            if(!vm.dimension.metadata){
                vm.dimension.metadata = {};
                vm.dimension.metadata.dateRangeTab = 0;
                vm.dimension.metadata.currentDynamicDateRangeConfig = null;
                vm.dimension.metadata.customDynamicDateRange = 0;
                vm.dimension.selected = resetTimezone(strToDate(null));
                vm.dimension.selected2 = resetTimezone(strToDate(null))
            }
        }

        function onDateRangeClick(tabIndex) {
            vm.dimension.metadata.dateRangeTab = tabIndex;
        }

        function onCustomDynamicDateRangeChange() {
            onInputChange();
        }

        function getStartDateRangeInterval() {
            var config = vm.dimension.metadata.currentDynamicDateRangeConfig;
            if (config.toDate || config.isCustom) {
                return null;
            } else if (config.period.days) {
                return config.period.days + ' days';
            } else if (config.period.months) {
                return config.period.months + ' months';
            }
            return null;
        }

        function getStartDateRange() {
            var date = new Date();
            var config = vm.dimension.metadata.currentDynamicDateRangeConfig;
            if (config.isCustom) {
                date.setDate(date.getDate() - vm.dimension.metadata.customDynamicDateRange);
                return date;
            } else if (config.toDate) {
                date = moment(date).startOf(config.toDate).toDate();
                return date;
            }
            return null;
        }

        function onDynamicDateRangeChanged(config) {
            vm.dimension.metadata.currentDynamicDateRangeConfig = config;
            onInputChange();
        }

        function onInputChange() {
            if (vm.dimension.metadata.dateRangeTab === TAB_DAY) {
                var startDate = formatDate(resetTimezone(strToDate(vm.dimension.selected)));
                var endDate = formatDate(resetTimezone(endOfDay(strToDate(vm.dimension.selected))));
                console.log('filter-date-range-component: input change day', typeof startDate, startDate,
                    typeof endDate, endDate);
                vm.onDateChange({
                    startDate: startDate,
                    endDate: endDate,
                    metadata: {
                        dateRangeTab: vm.dimension.metadata.dateRangeTab,
                        currentDynamicDateRangeConfig : null,
                        customDynamicDateRange : 0
                    }
                });
            } else if (vm.dimension.metadata.dateRangeTab === TAB_RANGE) {
                var startDate = formatDate(resetTimezone(strToDate(vm.dimension.selected)));
                var endDate = formatDate(resetTimezone(strToDate(vm.dimension.selected2)));
                console.log('filter-date-range-component: input change range', typeof startDate, startDate,
                    typeof endDate, endDate);
                vm.onDateChange({
                    startDate: startDate,
                    endDate: endDate,
                    metadata: {
                        dateRangeTab: vm.dimension.metadata.dateRangeTab,
                        currentDynamicDateRangeConfig : null,
                        customDynamicDateRange : 0
                    }
                });
            } else if (vm.dimension.metadata.dateRangeTab === TAB_DYNAMIC) {
                var startDateRange = getStartDateRange();
                var startDate;
                if (startDateRange) {
                    startDate = formatDate(resetTimezone(startOfDay(strToDate(startDateRange))));
                } else {
                    var startDateRangeInterval = getStartDateRangeInterval();
                    startDate = "__FLAIR_INTERVAL_OPERATION(NOW(), '-', '" + startDateRangeInterval + "')";
                }
                var endDate = '__FLAIR_NOW()';
                console.log('filter-date-range-component: input change dynamic', typeof startDate, startDate,
                    typeof endDate, endDate);
                vm.onDateChange({
                    startDate: startDate,
                    endDate: endDate,
                    metadata: {
                        dateRangeTab: vm.dimension.metadata.dateRangeTab,
                        currentDynamicDateRangeConfig : vm.dimension.metadata.currentDynamicDateRangeConfig,
                        customDynamicDateRange : vm.dimension.metadata.customDynamicDateRange
                    }
                });
                filterParametersService.saveDynamicDateRangeToolTip(getDynamicDateRangeToolTip(vm.dimension.name,vm.dimension.metadata.currentDynamicDateRangeConfig,vm.dimension.metadata.customDynamicDateRange));
            }
        }

        function getDynamicDateRangeToolTip(dimensionName,currentDynamicDateRangeConfig,customDynamicDateRange){
            var dynamicDateRangeToolTip = {name:'',text:''};
                dynamicDateRangeToolTip.name = filterParametersService.buildDateRangeFilterName(dimensionName);
            if(currentDynamicDateRangeConfig.isCustom){
                dynamicDateRangeToolTip.text = 'Last '+customDynamicDateRange; 
            }else{
                dynamicDateRangeToolTip.text = currentDynamicDateRangeConfig.title;
            }
            return dynamicDateRangeToolTip;
        }

        function setDateRangeSubscription() {
            var unsubscribe = $scope.$on('flairbiApp:filter-set-date-ranges', function (event, dateRange) {
                console.log('filter-date-range: event filter-set-date-ranges before', dateRange.startDate, 'timezone', new Date(dateRange.startDate).getTimezoneOffset());
                vm.dimension.selected = strToDate(dateRange.startDate);
                vm.dimension.selected2 = strToDate(dateRange.endDate);
                console.log('filter-date-range: event filter-set-date-ranges after', vm.dimension.selected);
            });

            $scope.$on('$destroy', unsubscribe);
        }

        function onDimensionChange(dimension) {
            console.log('date component: on changes before', dimension);
            vm.dimension.selected = resetTimezone(strToDate(dimension.selected));
            vm.dimension.selected2 = resetTimezone(strToDate(dimension.selected2));
            console.log('date component: on changes after-', vm.dimension.selected);
        }

        function onReloadChange() {
            onDimensionChange({selected: null, selected2: null});
            reset();
        }

        function $onChanges(changesObj) {
            if (changesObj.dimension) {
                onDimensionChange(vm.dimension);
            } else if (changesObj.reload) {
                onReloadChange();
            }
        }

        function resetTimezone(date) {
            if (!date) {
                return null;
            }
            date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
            return date;
        }

        function strToDate(date) {
            if (!date) {
                return null;
            }
            // console.log('str to date', date, typeof date);
            return Date.parse(date) ? new Date(date) : null;
        }

        function endOfDay(date) {
            if (!date) {
                return null;
            }
            date.setHours(23, 59, 59);
            return date;
        }

        function startOfDay(date) {
            if (!date) {
                return null;
            }
            date.setHours(0, 0, 0);
            return date;
        }

        function formatDate(date) {
            if (!date) {
                return null;
            }
            return moment(date).utc().format('YYYY-MM-DD HH:mm:ss.SSS000');
        }

    }
})();

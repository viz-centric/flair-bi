(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('filterDateRangeConstraints', {
            templateUrl: 'app/entities/flair-bi/modal/modal-tabs/condition/filter-date-range-constraints.component.html',
            controller: FilterDateRangeConstraintsController,
            controllerAs: 'vm',
            bindings: {
                dimension: '<',
                reload: '<',
                onDateChange: '&',
                condition: '<',
            }
        });

    FilterDateRangeConstraintsController.$inject = ['$scope','DYNAMIC_DATE_RANGE_CONFIG'];

    function FilterDateRangeConstraintsController($scope,DYNAMIC_DATE_RANGE_CONFIG) {
        var TAB_DAY = 0;
        var TAB_RANGE = 1;
        var TAB_DYNAMIC = 2;
        var vm = this;

        vm.$onInit = onInit;
        vm.$onChanges = $onChanges;
        vm.customDynamicDateRange = 0;
        vm.currentDimension = {};
        vm.onDateRangeClick = onDateRangeClick;
        vm.onInputChange = onInputChange;
        vm.onCustomDynamicDateRangeChange = onCustomDynamicDateRangeChange;
        vm.dateRangeTab = 0;
        vm.currentDynamicDateRangeConfig = null;
        vm.dynamicDateRangeConfig = DYNAMIC_DATE_RANGE_CONFIG;

        ////////////////

        function onInit() {
            setDateRangeSubscription();
        }

        function reset() {
            vm.dateRangeTab = 0;
            vm.currentDynamicDateRangeConfig = null;
            vm.customDynamicDateRange = 0;
        }

        function onDateRangeClick(tabIndex) {
            vm.dateRangeTab = tabIndex;
            onInputChange();
        }

        function onCustomDynamicDateRangeChange() {
            onInputChange();
        }

        function getStartDateRangeInterval() {
            var config = vm.currentDynamicDateRangeConfig;
            if (!config) {
                return null;
            }
            if (config.toDate || config.isCustom) {
                return null;
            } else if (config.period.days) {
                return config.period.days + ' days';
            } else if (config.period.months) {
                return config.period.months + ' months';
            }
            return null;
        }

        function adjustStartDateRangeInterval() {
            var config = vm.currentDynamicDateRangeConfig;
            if (!config) {
                return null;
            }
            if (config.toDate || config.isCustom) {
                return null;
            } else if (config.period.days || config.period.months) {
                var toDate = moment(new Date())
                    .subtract(config.period.days, 'days')
                    .subtract(config.period.months, 'months')
                    .toDate();
                console.log('to date', toDate);
                return toDate;
            }
            return null;
        }

        function getStartDateRange() {
            var date = new Date();
            var config = vm.currentDynamicDateRangeConfig;
            if (!config) {
                return null;
            }
            if (config.isCustom) {
                date.setDate(date.getDate() - vm.customDynamicDateRange);
                return date;
            } else if (config.toDate) {
                date = moment(date).startOf(config.toDate).toDate();
                return date;
            }
            return null;
        }

        function onInputChange() {
            console.log('filter-date-range-constraints: input change', vm.dateRangeTab);
            var startDate;
            var endDate;
            var startDateFormatted = "";
            var endDateFormatted = "";
            if (vm.dateRangeTab === TAB_DAY) {
                startDateFormatted = startDate = formatDate(resetTimezone(startOfDay(strToDate(vm.currentDimension.selected))));
                endDateFormatted = endDate = formatDate(resetTimezone(endOfDay(strToDate(vm.currentDimension.selected))));
                console.log('filter-date-range-component: input change day', typeof startDate, startDate,
                    typeof endDate, endDate);
            } else if (vm.dateRangeTab === TAB_RANGE) {
                startDateFormatted = startDate = formatDate(resetTimezone(startOfDay(strToDate(vm.currentDimension.selected))));
                endDateFormatted = endDate = formatDate(resetTimezone(endOfDay(strToDate(vm.currentDimension.selected2))));
                console.log('filter-date-range-component: input change range', typeof startDate, startDate,
                    typeof endDate, endDate);
            } else if (vm.dateRangeTab === TAB_DYNAMIC) {
                var startDateRange = getStartDateRange();
                if (startDateRange) {
                    startDate = formatDate(resetTimezone(startOfDay(strToDate(startDateRange))));
                    startDateFormatted = startDate;
                } else {
                    var startDateRangeInterval = getStartDateRangeInterval();
                    if (!startDateRangeInterval) {
                        return;
                    }
                    startDate = "__FLAIR_INTERVAL_OPERATION(NOW(), '-', '" + startDateRangeInterval + "')";
                    var adjustedDate = adjustStartDateRangeInterval();
                    startDateFormatted = formatDate(resetTimezone(startOfDay(adjustedDate)));
                }
                endDateFormatted = formatDate(resetTimezone(endOfDay(strToDate(new Date()))));
                endDate = '__FLAIR_NOW()';
                console.log('filter-date-range-component: input change dynamic', typeof startDate, startDate,
                    typeof endDate, endDate);
            }
            vm.onDateChange({
                startDate: startDate,
                endDate: endDate,
                metadata: {
                    startDateFormatted: startDateFormatted,
                    endDateFormatted: endDateFormatted,
                    tab: vm.dateRangeTab,
                    currentDynamicDateRangeConfig : vm.currentDynamicDateRangeConfig,
                    customDynamicDateRange : vm.customDynamicDateRange
                }
            });
        }

        function setDateRangeSubscription() {
        }

        function onDimensionChange(condition) {
            console.log('date component: on changes before', condition);
            var selected;
            var selected2;
            var tab = vm.dateRangeTab;
            if (!condition.metadata || !condition.metadata.startDateFormatted) {
                selected = formatDate(resetTimezone(strToDate(new Date())));
                selected2 = formatDate(resetTimezone(strToDate(new Date())));
            } else {
                selected = formatDate(resetTimezone(strToDate(condition.metadata.startDateFormatted)));
                selected2 = formatDate(resetTimezone(strToDate(condition.metadata.endDateFormatted)));
                tab = condition.metadata.tab;
            }
            vm.currentDimension = {selected: selected, selected2: selected2};
            vm.dateRangeTab = tab;
            vm.currentDynamicDateRangeConfig = condition.metadata.currentDynamicDateRangeConfig;
            vm.customDynamicDateRange = condition.metadata.customDynamicDateRange;
            console.log('date component: on changes after', vm.currentDimension.selected, vm.currentDimension.selected2);
            onInputChange();
        }

        function onReloadChange() {
            onDimensionChange({selected: null, selected2: null});
            reset();
        }

        function $onChanges(changesObj) {
            if (changesObj.condition) {
                console.log('changesObj.condition', changesObj.condition);
                onDimensionChange(changesObj.condition.currentValue);
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
            return new Date(date);
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
            return moment(date).utc().format('YYYY-MM-DD HH:mm:ss.SSS');
        }

    }
})();

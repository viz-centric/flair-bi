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
                onRefreshDay: '&',
                onRefreshRange: '&',
                onRefreshDynamic: '&'
            }
        });

    FilterDateRangeController.$inject = ['$scope'];

    function FilterDateRangeController($scope) {
        var TAB_DAY = 0;
        var TAB_RANGE = 1;
        var TAB_DYNAMIC = 2;
        setDateRangeSubscription();

        var DYNAMIC_DATE_RANGE_CONFIG = [
            {
                title: 'Week to date',
                period: {
                    months: 0,
                    days: 7
                }
            },
            {
                title: 'Month to date',
                period: {
                    months: 1,
                    days: 0
                }
            },
            {
                title: 'Quarter to date',
                period: {
                    months: 3,
                    days: 0
                }
            },
            {
                title: 'Year to date',
                period: {
                    months: 12,
                    days: 0
                }
            },
            {
                title: 'Custom X days',
                isCustom: true
            }
        ];

        var vm = this;

        vm.$onInit = onInit;
        vm.$onChanges = $onChanges;
        vm.currentDimension = {customDynamicDateRange: 1 };
        vm.onDateRangeClick = onDateRangeClick;
        vm.onInputChange = onInputChange;
        vm.onDynamicDateRangeChanged = onDynamicDateRangeChanged;
        vm.onCustomDynamicDateRangeChange = onCustomDynamicDateRangeChange;
        vm.dateRangeTab = 0;
        // vm.dimension.customDynamicDateRange = 1;
        vm.currentDynamicDateRangeConfig = null;
        vm.dynamicDateRangeConfig = DYNAMIC_DATE_RANGE_CONFIG;
        // vm.dimension.selected='';
        // vm.dimension.selected2='';
        vm.datePickerOptions = {
            timezone: '+0000'
            // timezone: '+0' + new Date().getTimezoneOffset()/60 + '00' ,
        };

        ////////////////

        function onInit() {
        }

        function onDateRangeClick(tabIndex) {
            vm.dateRangeTab = tabIndex;
        }

        function onCustomDynamicDateRangeChange() {
            onInputChange();
        }

        function getStartDateRange() {
            var date = new Date();
            var config = vm.currentDynamicDateRangeConfig;
            if (config.isCustom) {
                date.setDate(date.getDate() - vm.currentDimension.customDynamicDateRange);
            } else {
                date.setDate(date.getDate() - config.period.days);
                date.setMonth(date.getMonth() - config.period.months);
            }
            return date;
        }

        function onDynamicDateRangeChanged(config) {
            vm.currentDynamicDateRangeConfig = config;
            onInputChange();
        }

        function onInputChange() {
            if (vm.dateRangeTab === TAB_DAY) {
                vm.onRefreshDay({dimension: vm.currentDimension});
            } else if (vm.dateRangeTab === TAB_RANGE) {
                vm.onRefreshRange({dimension: vm.currentDimension});
            } else if (vm.dateRangeTab === TAB_DYNAMIC) {
                vm.onRefreshDynamic({startDate: getStartDateRange(), dimension: vm.currentDimension});
            }
        }

        function setDateRangeSubscription() {
            var unsubscribe = $scope.$on('flairbiApp:filter-set-date-ranges', function (event, dateRange) {
                console.log('event fired range', dateRange);
                vm.currentDimension.selected=dateRange.startDate;
                vm.currentDimension.selected2=dateRange.endDate;
            });

            $scope.$on('$destroy', unsubscribe);
        }

        function $onChanges(changesObj) {
            console.log('on changes', changesObj);
            if (changesObj.dimension) {
                vm.currentDimension = {
                    customDynamicDateRange: vm.dimension.customDynamicDateRange,
                    selected: vm.dimension.selected,
                    selected2: vm.dimension.selected2,
                };
            }
        }

    }
})();

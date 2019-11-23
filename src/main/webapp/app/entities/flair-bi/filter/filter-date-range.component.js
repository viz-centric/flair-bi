(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('filterDateRange', {
            templateUrl: 'app/entities/flair-bi/filter/filter-date-range.component.html',
            controller: FilterDateRangeController,
            controllerAs: 'vm',
            bindings: {
                dimension: '=',
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
        vm.datePickerOpenStatus = {};
        vm.toggleCalendar = toggleCalendar;
        vm.onDateRangeClick = onDateRangeClick;
        vm.onInputChange = onInputChange;
        vm.onDynamicDateRangeChanged = onDynamicDateRangeChanged;
        vm.onCustomDynamicDateRangeChange = onCustomDynamicDateRangeChange;
        vm.dateRangeTab = 0;
        vm.customDynamicDateRange = 1;
        vm.currentDynamicDateRangeConfig = null;
        vm.dynamicDateRangeConfig = DYNAMIC_DATE_RANGE_CONFIG;

        ////////////////

        function onInit() {
        }

        function toggleCalendar(e, date) {
            e.preventDefault();
            e.stopPropagation();
            vm.datePickerOpenStatus[date] = !vm.datePickerOpenStatus[date];
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
                date.setDate(date.getDate() - vm.customDynamicDateRange);
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
                vm.onRefreshDay();
            } else if (vm.dateRangeTab === TAB_RANGE) {
                vm.onRefreshRange();
            } else if (vm.dateRangeTab === TAB_DYNAMIC) {
                vm.onRefreshDynamic({startDate: getStartDateRange()});
            }
        }

    }
})();

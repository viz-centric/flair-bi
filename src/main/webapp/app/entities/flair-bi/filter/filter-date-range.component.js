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
                onDateChange: '&',
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
                title: 'Last 7 days',
                period: {
                    months: 0,
                    days: 7
                }
            },
            {
                title: 'Last 30 days',
                period: {
                    months: 1,
                    days: 0
                }
            },
            {
                title: 'Last 90 days',
                period: {
                    months: 3,
                    days: 0
                }
            },
            {
                title: 'Last 365 days',
                period: {
                    months: 12,
                    days: 0
                }
            },
            {
                title: 'Week to date',
                period: {
                    months: 0,
                },
                toDate: 'isoWeek'
            },
            {
                title: 'Month to date',
                period: {
                    months: 0,
                },
                toDate: 'month'
            },
            {
                title: 'Quarter to date',
                period: {
                    months: 1,
                },
                toDate: 'quarter'
            },
            {
                title: 'Year to date',
                period: {
                    months: 0,
                },
                toDate: 'year'
            },
            {
                title: 'Custom X days',
                isCustom: true
            }
        ];

        var vm = this;

        vm.$onInit = onInit;
        vm.$onChanges = $onChanges;
        vm.customDynamicDateRange = 0;
        vm.currentDimension = {};
        vm.onDateRangeClick = onDateRangeClick;
        vm.onInputChange = onInputChange;
        vm.onDynamicDateRangeChanged = onDynamicDateRangeChanged;
        vm.onCustomDynamicDateRangeChange = onCustomDynamicDateRangeChange;
        vm.dateRangeTab = 0;
        vm.currentDynamicDateRangeConfig = null;
        vm.dynamicDateRangeConfig = DYNAMIC_DATE_RANGE_CONFIG;

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
                date.setDate(date.getDate() - vm.customDynamicDateRange);
            } else if (config.toDate) {
                date = moment(date).startOf(config.toDate).toDate();
                date.setMonth(date.getMonth() - config.period.months);
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
                var startDate = resetTimezone(vm.currentDimension.selected.toISOString());
                var endDate = resetTimezone(endOfDay(vm.currentDimension.selected.toISOString()));
                console.log('filter-date-range-component: input change day', typeof startDate, startDate,
                    typeof endDate, endDate);
                vm.onDateChange({
                    startDate: startDate,
                    endDate: endDate
                });
            } else if (vm.dateRangeTab === TAB_RANGE) {
                var startDate = resetTimezone(vm.currentDimension.selected);
                var endDate = resetTimezone(vm.currentDimension.selected2);
                console.log('filter-date-range-component: input change range', typeof startDate, startDate,
                    typeof endDate, endDate);
                vm.onDateChange({
                    startDate: startDate,
                    endDate: endDate,
                });
            } else if (vm.dateRangeTab === TAB_DYNAMIC) {
                var startDate = resetTimezone(startOfDay(getStartDateRange().toISOString()));
                var endDate = resetTimezone(endOfDay(new Date().toISOString()));
                console.log('filter-date-range-component: input change dynamic', typeof startDate, startDate,
                    typeof endDate, endDate);
                vm.onDateChange({
                    startDate: startDate,
                    endDate: endDate
                });
            }
        }

        function setDateRangeSubscription() {
            var unsubscribe = $scope.$on('flairbiApp:filter-set-date-ranges', function (event, dateRange) {
                console.log('filter-date-range: event filter-set-date-ranges before', dateRange.startDate, 'timezone', new Date(dateRange.startDate).getTimezoneOffset());
                vm.currentDimension.selected = dateRange.startDate;
                vm.currentDimension.selected2 = dateRange.endDate;
                console.log('filter-date-range: event filter-set-date-ranges after', vm.currentDimension.selected);
            });

            $scope.$on('$destroy', unsubscribe);
        }

        function $onChanges(changesObj) {
            if (changesObj.dimension) {
                console.log('date component: on changes before', vm.dimension);
                vm.currentDimension = {
                    selected: resetTimezone(vm.dimension.selected),
                    selected2: resetTimezone(vm.dimension.selected2),
                };
                console.log('date component: on changes after-', vm.currentDimension.selected);
            }
        }

        function resetTimezone(startDate) {
            if (!startDate) {
                return '';
            }
            var date = new Date(startDate);
            date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
            return date.toISOString();
        }

        function addTimezone(startDate) {
            if (!startDate) {
                return '';
            }
            var date = new Date(startDate);
            date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
            return date.toISOString();
        }

        function endOfDay(startDate) {
            if (!startDate) {
                return '';
            }
            var date = new Date(startDate);
            date.setHours(23, 59, 59);
            return date.toISOString();
        }

        function startOfDay(startDate) {
            if (!startDate) {
                return '';
            }
            var date = new Date(startDate);
            date.setHours(0, 0, 0);
            return date.toISOString();
        }

    }
})();

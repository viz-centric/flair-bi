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

        var vm = this;

        vm.$onInit = onInit;
        vm.datePickerOpenStatus = {};
        vm.toggleCalendar = toggleCalendar;
        vm.onDateRangeClick = onDateRangeClick;
        vm.onInputChange = onInputChange;
        vm.dateRangeTab = 0;

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

        function onInputChange() {
            if (vm.dateRangeTab === TAB_DAY) {
                vm.onRefreshDay();
            } else if (vm.dateRangeTab === TAB_RANGE) {
                vm.onRefreshRange();
            } else if (vm.dateRangeTab === TAB_DYNAMIC) {
                vm.onRefreshDynamic();
            }
        }

    }
})();

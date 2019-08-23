(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('AuditsController', AuditsController);

    AuditsController.$inject = ['$filter', 'AuditsService', 'ParseLinks'];

    function AuditsController($filter, AuditsService, ParseLinks) {
        var vm = this;

        vm.audits = null;
        vm.fromDate = null;
        vm.links = null;
        vm.loadPage = loadPage;
        vm.onChangeDate = onChangeDate;
        vm.page = 1;
        vm.previousMonth = previousMonth;
        vm.dateFormat='yyyy-MM-dd';
        vm.toDate = new Date();
        vm.fromDate = new Date();
        vm.today = today;
        vm.totalItems = null;
        vm.today();
        vm.previousMonth();
        vm.onChangeDate();
        vm.openCalendar=openCalendar;
        vm.datePickerOpenStatus={};
        vm.datePickerOpenStatus.fromDate = false;
        vm.datePickerOpenStatus.toDate = false;

        function onChangeDate() {
            var fromDate = $filter('date')(vm.fromDate, vm.dateFormat);
            var toDate = $filter('date')(vm.toDate, vm.dateFormat);

            AuditsService.query({
                page: vm.page - 1,
                size: 20,
                fromDate: fromDate,
                toDate: toDate
            }, function (result, headers) {
                vm.audits = result;
                vm.links = ParseLinks.parse(headers('link'));
                vm.totalItems = headers('X-Total-Count');
            });
        }

        // Date picker configuration
        function today() {
            // Today + 1 day - needed if the current day must be included
            var today = new Date();
            //vm.toDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
            vm.toDate.setDate(today.getDate()+1);
        }

        function previousMonth() {
            var fromDate = new Date();
            if (fromDate.getMonth() === 0) {
                fromDate = new Date(fromDate.getFullYear() - 1, 11, fromDate.getDate());
            } else {
                fromDate = new Date(fromDate.getFullYear(), fromDate.getMonth() - 1, fromDate.getDate());
            }

            vm.fromDate = fromDate;
        }

        function loadPage(page) {
            vm.page = page;
            vm.onChangeDate();
        }

        function openCalendar (date) {
            vm.datePickerOpenStatus[date] = true;
        }

    }
})();

(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('AuditsController', AuditsController);

    AuditsController.$inject = ['$filter', 'AuditsService', 'ParseLinks','ComponentDataService','AuditsUtilsService'];

    function AuditsController($filter, AuditsService, ParseLinks,ComponentDataService,AuditsUtilsService) {
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
        vm.search=search;
        vm.user=null;

        function onChangeDate() {
            AuditsService.query(
            {   page: vm.page - 1,size:20,
                fromDate:$filter('date')(vm.fromDate, vm.dateFormat),
                toDate:$filter('date')(vm.toDate, vm.dateFormat)
            },function(result,headers){
                setAuditsData(result,headers);
            });
        }

        function setAuditsData(result,headers){
            vm.audits = result;
            vm.links = ParseLinks.parse(headers('link'));
            vm.totalItems = headers('X-Total-Count');             
        }

        // Date picker configuration
        function today() {
            vm.toDate=AuditsUtilsService.today();
        }

        function previousMonth() {
            vm.fromDate=AuditsUtilsService.previousMonth();
        }

        function loadPage(page) {
            vm.page = page;
            vm.onChangeDate();
        }

        function openCalendar (date) {
            vm.datePickerOpenStatus[date] = true;
        }

        function search(){
            AuditsService.query(
            {   page: vm.page - 1,
                size:20,fromDate:$filter('date')(vm.fromDate, vm.dateFormat),
                toDate:$filter('date')(vm.toDate, vm.dateFormat),
                principal:ComponentDataService.getUser()?ComponentDataService.getUser().login:null
            },function(result,headers){
                setAuditsData(result,headers);
            });
        }


    }
})();

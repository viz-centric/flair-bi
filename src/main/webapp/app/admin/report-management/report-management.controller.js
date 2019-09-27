(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('ReportManagementController', ReportManagementController);

    ReportManagementController.$inject = ['User','schedulerService',
        'AlertService','pagingParams','paginationConstants','$rootScope','$state',
        'AccountDispatch','ReportManagementUtilsService','ComponentDataService'
    ];

    function ReportManagementController(User,schedulerService,
        AlertService,pagingParams,paginationConstants,$rootScope,$state,AccountDispatch,ReportManagementUtilsService,ComponentDataService) {
       
       var vm = this;

        vm.reports = [];
        
        vm.page = 1;
        vm.totalItems = 0;
        vm.links = null;
        vm.loadPage = loadPage;
        vm.predicate = pagingParams.predicate;
        vm.reverse = pagingParams.ascending;
        vm.itemsPerPage = 5;
        vm.transition = transition;
        
        
        vm.parseCron=parseCron;
        vm.executeNow=executeNow;
        vm.goToBuildPage=goToBuildPage;
        vm.deleteReport=deleteReport;
        vm.updateReport=updateReport;
        vm.searchReports=searchReports;
        vm.openCalendar=openCalendar;
        vm.datePickerOpenStatus={};
        vm.datePickerOpenStatus.fromDate = false;
        vm.datePickerOpenStatus.toDate = false;
        vm.dateFormat='yyyy-MM-dd';
        vm.user=null;

        activate();
        ///////////////////////////////////////

        function activate() {
            getAccount(); 
            getScheduledReports(vm.account.login,"","",""); 
            var cronstrue = window.cronstrue; 
             
        }
        
        function getAccount() {
            vm.account = AccountDispatch.getAccount();
            vm.isAdmin =  AccountDispatch.isAdmin();
        }

        function getScheduledReports(userName,reportName,startDate,endDate){
            schedulerService.filterScheduledReports(userName,reportName,startDate,endDate,vm.itemsPerPage,pagingParams.page - 1).then(
              function(response) {
                    vm.reports=response.data.reports;
                    vm.totalItems = response.data.totalRecords;
                    vm.queryCount = vm.totalItems;
                    vm.page = pagingParams.page;
              },
              function(error) {
                var info = {
                    text: error.statusText,
                    title: "Error"
                }
                $rootScope.showErrorSingleToast(info);
              });
        }

        function parseCron(cronExp){
            return cronstrue.toString(cronExp);
        }
        function executeNow(vizID){
            ReportManagementUtilsService.executeNow(vizID);
        }

        function goToBuildPage(build_url){
            ReportManagementUtilsService.goToBuildPage(build_url);
        }

        function deleteReport(id){
            schedulerService.cancelScheduleReport(id).then(function (success) {
                var info = {
                    text: success.data.message,
                    title: "Cancelled"
                }
                $rootScope.showSuccessToast(info);
                getScheduledReports(vm.account.login,"","","");
            }).catch(function (error) {
                var info = {
                    text: error.data.message,
                    title: "Error"
                }
                $rootScope.showErrorSingleToast(info);
            });
        }

        function loadPage(page) {
            vm.page = page;
            vm.transition();
        }

        function transition() {
            $state.transitionTo($state.$current, {
                page: vm.page,
                sort: vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc'),
            });
        }

        function searchReports(){
            var user = ComponentDataService.getUser()?ComponentDataService.getUser().login:"";
            vm.reportName = vm.reportName ? vm.reportName : "" ;
            vm.fromDate = vm.fromDate ? vm.fromDate : "" ;
            vm.toDate = vm.toDate ? vm.toDate : "" ;
            
            getScheduledReports(user,vm.reportName,vm.fromDate,vm.toDate);
        }

        function updateReport(visualizationid){
            ReportManagementUtilsService.updateReport(visualizationid);
        }

        function openCalendar (date) {
            vm.datePickerOpenStatus[date] = true;
        }

    }
})();

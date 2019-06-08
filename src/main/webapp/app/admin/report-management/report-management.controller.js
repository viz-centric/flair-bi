(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('ReportManagementController', ReportManagementController);

    ReportManagementController.$inject = ['User','schedulerService',
        'AlertService','pagingParams','paginationConstants','$location','$rootScope'
    ];

    function ReportManagementController(User,schedulerService,
        AlertService,pagingParams,paginationConstants,$location,$rootScope) {
       
       var vm = this;

        vm.reports = [];
        vm.page = 1;
        vm.totalItems = null;
        vm.itemsPerPage = paginationConstants.itemsPerPage;
        
        
        vm.parseCron=parseCron;
        vm.executeNow=executeNow;
        vm.goToBuildPage=goToBuildPage;
        vm.deleteReport=deleteReport;

        activate();
        ///////////////////////////////////////

        function activate() {
            getScheduledReports(); 
            var cronstrue = window.cronstrue;   
        }

        function getScheduledReports(){
            schedulerService.getSchedulerReports(vm.itemsPerPage,pagingParams.page - 1).then(
              function(response) {
                vm.reports=response.data;
                vm.queryCount = vm.reports.length;
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
            schedulerService.executeNow(vizID).then(
              function(response) {
                console.log(response)
              },
              function(error) {
                console.log(error);
              });

        }

        function goToBuildPage(build_url){
            var buildPage=build_url.split("#")[1];
            $location.path(buildPage);
        }

        function deleteReport(vizID){
            schedulerService.cancelScheduleReport(vizID).then(
              function(response) {
                console.log(response)
              },
              function(error) {
                var info = {
                    text: error.statusText,
                    title: "Error"
                }
                $rootScope.showErrorSingleToast(info);
              });
        }



    }
})();

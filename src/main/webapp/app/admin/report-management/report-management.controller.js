(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('ReportManagementController', ReportManagementController);

    ReportManagementController.$inject = ['User','schedulerService',
        'AlertService','pagingParams','paginationConstants','$location','$rootScope','$state'
    ];

    function ReportManagementController(User,schedulerService,
        AlertService,pagingParams,paginationConstants,$location,$rootScope,$state) {
       
       var vm = this;

        vm.reports = [];
        
        vm.page = 1;
        vm.totalItems = null;
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

        activate();
        ///////////////////////////////////////

        function activate() {
            getTotalScheduledReports(); 
            getScheduledReports(); 
            var cronstrue = window.cronstrue;   
        }

        function getTotalScheduledReports(){
            schedulerService.getScheduledReportsCount().then(
              function(response) { 
                vm.totalItems = response.data;
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

        function getScheduledReports(){
            schedulerService.getSchedulerReports(vm.itemsPerPage,pagingParams.page - 1).then(
              function(response) {
                vm.reports=response.data;
                
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

    }
})();

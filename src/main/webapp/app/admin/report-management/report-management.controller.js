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
        
        vm.pageSize = 5;
        vm.setPage = setPage;
        vm.nextPage = nextPage;
        vm.prevPage = prevPage;
        vm.range = range;
        vm.noOfPages = 1;
        vm.currentPage = 0;
        
        
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
                vm.noOfPages = Math.ceil(response.data / vm.pageSize);     
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
            schedulerService.getSchedulerReports(vm.pageSize,vm.currentPage).then(
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

        function setPage(n) {
            vm.currentPage = n;
            getScheduledReports();
        };


        function range(start, end) {
            var ret = [];
            if (!end) {
                end = start;
                start = 0;
            }
            for (var i = start; i < end; i++) {
                ret.push(i);
            }
            return ret;
        };

        function prevPage() {
            if (vm.currentPage > 0) {
                vm.currentPage--;
                getScheduledReports();
            }
        };

        function nextPage() {
            if (vm.currentPage < vm.noOfPages - 1) {
                vm.currentPage++;
                getScheduledReports();
            }
        };





    }
})();

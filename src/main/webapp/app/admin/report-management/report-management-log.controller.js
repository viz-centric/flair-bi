(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('ReportManagementLogsController', ReportManagementLogsController);

    ReportManagementLogsController.$inject = ['User','schedulerService',
        'AlertService','$stateParams','pagingParams','$state','$rootScope'
    ];

    function ReportManagementLogsController(User,schedulerService,
        AlertService,$stateParams,pagingParams,$state,$rootScope) {
       
       var vm = this;


        vm.logs=[]

        
        vm.visualizationid= $stateParams.visualizationid;


        vm.page = 1;
        vm.totalItems = null;
        vm.links = null;
        vm.loadPage = loadPage;
        vm.predicate = pagingParams.predicate;
        vm.reverse = pagingParams.ascending;
        vm.itemsPerPage = 10;
        vm.transition = transition;

        activate();
        ///////////////////////////////////////

        function activate() {
            getScheduledReportsLogs(vm.visualizationid);    
        }

        function getScheduledReportsLogs(visualizationid){
            schedulerService.getScheduleReportLogs(visualizationid,vm.itemsPerPage,pagingParams.page - 1).then(
              function(response) {
                vm.logs=response.data.SchedulerLogs;
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

        function sort() {
            var result = [vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc')];
            if (vm.predicate !== 'id') {
                result.push('id');
            }
            return result;
        }

        function loadPage(page) {
            vm.page = page;
            vm.transition();
        }

        function transition() {
            $state.transitionTo($state.$current, {
                page: vm.page,
                sort: vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc'),
                visualizationid:vm.visualizationid
            });
        }

    }
})();

(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('ReportManagementLogsController', ReportManagementLogsController);

    ReportManagementLogsController.$inject = ['User','schedulerService',
        'AlertService','$stateParams','pagingParams'
    ];

    function ReportManagementLogsController(User,schedulerService,
        AlertService,$stateParams,pagingParams) {
       
       var vm = this;
       var visualizationid= $stateParams.visualizationid;

        vm.page = 1;

        vm.logs=[]

        activate();
        ///////////////////////////////////////

        function activate() {
            getScheduledReportsLogs(visualizationid);    
        }

        function getScheduledReportsLogs(visualizationid){
            schedulerService.getScheduleReportLogs(visualizationid).then(
              function(response) {
                vm.logs=response.data.SchedulerLogs;
              },
              function(error) {
                console.log(error);
              });
        }

    }
})();

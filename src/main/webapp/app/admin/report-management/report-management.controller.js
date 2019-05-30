(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('ReportManagementController', ReportManagementController);

    ReportManagementController.$inject = ['User','schedulerService',
        'AlertService',
    ];

    function ReportManagementController(User,schedulerService,
        AlertService) {
       
       var vm = this;

        vm.reports = [];
        vm.pageSize=10;
        vm.page=0;

        activate();
        ///////////////////////////////////////

        function activate() {
            getScheduledReports();    
        }

        function getScheduledReports(){
            var promise = schedulerService.getScheduleReports(5,0);
            promise.then(
              function(sucess) {
                console.log(sucess)
              },
              function(error) {
                console.log(error)
              });
        }


    }
})();

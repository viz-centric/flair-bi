(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('ReportManagementController', ReportManagementController);

    ReportManagementController.$inject = ['$stateParams'
    ];

    function ReportManagementController( $stateParams) {

        var vm = this;

        vm.reportManagementTabClick = reportManagementTabClick;
        vm.alertTab = $stateParams.id;

        activate();
        ///////////////////////////////////////

        function activate() {

        }

        function reportManagementTabClick(tabName) {
            vm.alertTab = tabName;
        }
    }
})();

(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('ReportManagementController', ReportManagementController);

    ReportManagementController.$inject = ['$stateParams', 'AccountDispatch'];

    function ReportManagementController($stateParams,AccountDispatch) {

        var vm = this;

        vm.reportManagementTabClick = reportManagementTabClick;
        vm.alertTab = $stateParams.id;
        activate();
        ///////////////////////////////////////

        function activate() {
            getAccount();
        }

        function reportManagementTabClick(tabName) {
            vm.alertTab = tabName;
        }
        function getAccount() {
            vm.account = AccountDispatch.getAccount();
            vm.isAdmin = AccountDispatch.isAdmin();
        }
    }
})();

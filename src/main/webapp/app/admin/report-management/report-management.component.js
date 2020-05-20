(function () {
    'use strict';


    angular
        .module('flairbiApp')
        .component('reportManagementComponent', {
            templateUrl: 'app/admin/report-management/report-management.component.html',
            controller: ReportManagementController,
            controllerAs: 'vm',
            bindings: {
                pagingParams: '<'
            }
        });


    ReportManagementController.$inject = ['$stateParams', 'AccountDispatch'];

    function ReportManagementController($stateParams, AccountDispatch) {

        var vm = this;

        vm.reportManagementTabClick = reportManagementTabClick;
        vm.alertTab = $stateParams.id;
        vm.showConfiguration = false;
        vm.$onInit = activate;
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
            if (!vm.isAdmin) {
                if (vm.account.userGroups.indexOf("ROLE_DEVELOPMENT") !== -1) {
                    vm.showConfiguration = true;
                }
            }
            else{
                vm.showConfiguration = true;
            }
        }
    }
})();

(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('userManagementDetailComponent', {
            templateUrl: 'app/admin/user-management/user-management-detail.component.html',
            controller: UserManagementDetailController,
            controllerAs: 'vm',
            bindings: {
                previousState: '<'
            }
        })
        .component('userManagementDetailContentHeaderComponent', {
            templateUrl: 'app/admin/user-management/user-management-properties-content-header.component.html',
            controller: UserManagementDetailController,
            controllerAs: 'vm',
            bindings: {
                previousState: '<'
            }
        });

    UserManagementDetailController.$inject = ['$stateParams', 'User', 'DatasourceConstraint'];

    function UserManagementDetailController($stateParams, User, DatasourceConstraint) {
        var vm = this;

        vm.$onInit = activate;

        vm.load = load;


        function activate() {
            vm.user = {};
            //getting the previous state. if no state found, then it navigates to home page - Start
            vm.prevRoute = vm.previousState.URL;
            //getting the previous state - End

            vm.load($stateParams.login);
            
            DatasourceConstraint.query({
                'user.login': $stateParams.login
            }, function (result) {
                vm.datasourceConstraints = result;
            }, function () {

            });
        }

        function load(login) {
            User.get({
                login: login
            }, function (result) {
                vm.user = result;
            });
        }
    }
})();

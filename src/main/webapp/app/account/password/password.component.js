(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('passwordComponent', {
            templateUrl: 'app/account/password/password.component.html',
            controller: PasswordController,
            controllerAs: 'vm',
        });

    PasswordController.$inject = ['Auth', 'Principal'];
    function PasswordController(Auth, Principal) {
        var vm = this;

        vm.changePassword = changePassword;
        vm.doNotMatch = null;
        vm.error = null;
        vm.success = null;
        ////////////////

        vm.$onInit = function () {
            Principal.identity().then(function (account) {
                vm.account = account;
            });
        };


        function changePassword() {
            if (vm.password !== vm.confirmPassword) {
                vm.error = null;
                vm.success = null;
                vm.doNotMatch = 'ERROR';
            } else {
                vm.doNotMatch = null;
                Auth.changePassword(vm.password).then(function () {
                    vm.error = null;
                    vm.success = 'OK';
                }).catch(function () {
                    vm.success = null;
                    vm.error = 'ERROR';
                });
            }
        }
    }
})();


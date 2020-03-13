(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('resetFinishComponent', {
            templateUrl: 'app/account/reset/finish/reset.finish.component.html',
            controller: ResetFinishController,
            controllerAs: 'vm'
        });

    ResetFinishController.$inject = ['$stateParams', '$timeout', 'Auth', 'LoginService'];

    function ResetFinishController($stateParams, $timeout, Auth, LoginService) {
        var vm = this;

        vm.keyMissing = angular.isUndefined($stateParams.key);
        vm.confirmPassword = null;
        vm.doNotMatch = null;
        vm.error = null;
        vm.finishReset = finishReset;
        vm.login = LoginService.open;
        vm.resetAccount = {};
        vm.success = null;

        function finishReset() {
            vm.doNotMatch = null;
            vm.error = null;
            if (vm.resetAccount.password !== vm.confirmPassword) {
                vm.doNotMatch = 'ERROR';
            } else {
                Auth.resetPasswordFinish({
                    key: $stateParams.key,
                    newPassword: vm.resetAccount.password
                }).then(function () {
                    vm.success = 'OK';
                }).catch(function () {
                    vm.success = null;
                    vm.error = 'ERROR';
                });
            }
        }
    }
})();

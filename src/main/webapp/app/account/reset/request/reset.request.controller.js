(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('RequestResetController', RequestResetController);

    RequestResetController.$inject = ['$timeout', 'Auth'];

    function RequestResetController($timeout, Auth) {
        var vm = this;

        vm.error = null;
        vm.errorEmailNotExists = null;
        vm.errorExternalUser = null;
        vm.requestReset = requestReset;
        vm.resetAccount = {};
        vm.success = null;

        $timeout(function () {
            angular.element('#email').focus();
        });

        function requestReset() {

            vm.error = null;
            vm.errorEmailNotExists = null;

            Auth.resetPasswordInit(vm.resetAccount.email).then(function () {
                vm.success = 'OK';
            }).catch(function (response) {
                vm.success = null;
                if (response.status === 400 && response.data === 'e-mail address not registered') {
                    vm.errorEmailNotExists = 'ERROR';
                } else if (response.status === 400 && response.data === 'e-mail address is linked to external login') {
                    vm.errorExternalUser = 'ERROR';
                } else {
                    vm.error = 'ERROR';
                }
            });
        }
    }
})();

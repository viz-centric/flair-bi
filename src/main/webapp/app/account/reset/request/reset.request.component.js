(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('resetRequestComponent', {
            templateUrl: 'app/account/reset/request/reset.request.component.html',
            controller: RequestResetController,
            controllerAs: 'vm'
        });

    RequestResetController.$inject = ['Auth'];

    function RequestResetController(Auth) {
        //TODO fix not showing when logged in.
        var vm = this;

        vm.error = null;
        vm.errorEmailNotExists = null;
        vm.errorExternalUser = null;
        vm.requestReset = requestReset;
        vm.resetAccount = {};
        vm.success = null;

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



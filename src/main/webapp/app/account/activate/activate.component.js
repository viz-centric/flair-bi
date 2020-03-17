(function() {
    'use strict';

    angular
        .module('flairbiApp')
        .component('activateComponent', {
            templateUrl: 'app/account/activate/activate.component.html',
            controller: ActivateController,
            controllerAs: 'vm'
        });

    ActivateController.$inject = ['$stateParams', 'Auth', 'LoginService'];
    function ActivateController($stateParams, Auth, LoginService) {
        var vm = this;

        ////////////////

        vm.$onInit = function() { 
            Auth.activateAccount({key: $stateParams.key}).then(function () {
                vm.error = null;
                vm.success = 'OK';
            }).catch(function () {
                vm.success = null;
                vm.error = 'ERROR';
            });
    
            vm.login = LoginService.open;
        };
    }
})();

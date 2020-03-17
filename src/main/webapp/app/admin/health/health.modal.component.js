(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('healthModalComponent', {
            templateUrl: 'app/admin/health/health.modal.component.html',
            controller: HealthModalController,
            controllerAs: 'vm',
            bindings: {
                resolve: '<',
                close: '&',
                dismiss: '&'
            }
        });


    HealthModalController.$inject = [];

    function HealthModalController() {
        var vm = this;

        vm.cancel = vm.dismiss;
        vm.currentHealth = vm.resolve.currentHealth;
        vm.baseName = vm.resolve.baseName;
        vm.subSystemName = vm.resolve.subSystemName;
    }
})();

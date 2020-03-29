(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('jhConfigurationComponent', {
            templateUrl: 'app/admin/configuration/configuration.component.html',
            controller: JhiConfigurationController,
            controllerAs: 'vm'
        }).component('jhConfigurationContentHeaderComponent', {
            templateUrl: 'app/admin/configuration/configuration-content-header.html',
            controller: JhiConfigurationController,
            controllerAs: 'vm'
        });

    JhiConfigurationController.$inject = ['JhiConfigurationService'];

    function JhiConfigurationController(JhiConfigurationService) {
        var vm = this;

        vm.allConfiguration = null;
        vm.configuration = null;

        vm.$onInit = function () {
            JhiConfigurationService.get().then(function (configuration) {
                vm.configuration = configuration;
            });
            JhiConfigurationService.getEnv().then(function (configuration) {
                vm.allConfiguration = configuration;
            });
        }
    }
})();

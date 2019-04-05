(function() {
    "use strict";

    angular.module("flairbiApp").component("cacheWizardStep", {
        templateUrl:
            "app/entities/service/wizard-dialog/cache-wizard-step.component.html",
        controller: CacheWizardStepController,
        controllerAs: "vm",
        bindings: {
            connectionParameters: "=",
        }
    });

    CacheWizardStepController.$inject = ["$scope","$rootScope"];
    function CacheWizardStepController($scope,$rootScope) {
        var vm = this;
        vm.nextStep=nextStep;
        vm.previousStep=previousStep;
        vm.$onInit = function() {};
        vm.$onChanges = function(changesObj) {};
        vm.$onDestroy = function() {};

        function nextStep(){
            $rootScope.$broadcast('flairbiApp:data-connection:next-page');
        }

        function previousStep(){
            $rootScope.$broadcast('flairbiApp:data-connection:previous-page');
        }
    }
})();

(function() {
    "use strict";

    angular.module("flairbiApp").component("connectionWizardStep", {
        templateUrl:
            "app/entities/service/wizard-dialog/connection-wizard-step.component.html",
        controller: ConnectionWizardStepController,
        controllerAs: "vm",
        bindings: {
            connection: "=",
            selectedConnection: "=",
            connections: "=",
            connectionType: "="
        }
    });

    ConnectionWizardStepController.$inject = ["$scope","$rootScope"];
    function ConnectionWizardStepController($scope,$rootScope) {
        var vm = this;
        vm.nextStep=nextStep;
        vm.previousStep=previousStep;

        vm.connectionSelected = connectionSelected;
        ////////////////

        vm.$onInit = function() {};
        vm.$onChanges = function(changesObj) {};
        vm.$onDestroy = function() {};

        function connectionSelected(item, model) {
            if (item) {
                vm.selectedConnection = true;
            } else {
                vm.selectedConnection = false;
            }
        }

        function nextStep(){
            $rootScope.$broadcast('flairbiApp:data-connection:next-page');
        }

        function previousStep(){
            $rootScope.$broadcast('flairbiApp:data-connection:previous-page');
        }
    }
})();

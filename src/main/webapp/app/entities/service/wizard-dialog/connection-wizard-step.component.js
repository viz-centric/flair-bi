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

    ConnectionWizardStepController.$inject = ["$scope","$rootScope", "Query"];
    function ConnectionWizardStepController($scope,$rootScope, Query) {
        var vm = this;
        vm.nextStep=nextStep;
        vm.previousStep=previousStep;
        vm.testConnection = testConnection;

        vm.testResult = '';
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
            vm.testResult = null;
            $rootScope.$broadcast('flairbiApp:data-connection:previous-page');
        }

        function prepareConnection() {
            var conn = vm.connection;
            conn.connectionType = vm.connectionType.name;
            conn.connectionTypeId = vm.connectionType.id;
            conn.connectionParameters = vm.connection.connectionParameters;
            conn.details["@type"] = vm.connectionType.connectionPropertiesSchema.connectionDetailsType;
            return conn;
        }

        function testConnection() {
            vm.testResult = "loading";
            var body = {};

            body.connection = prepareConnection();

            Query.testConnection(
                body,
                function(data) {
                    if (data.success) {
                        vm.testResult = "success";
                    } else {
                        vm.testResult = "error";
                    }
                },
                function() {
                    vm.testResult = "error";
                }
            );
        }
    }
})();

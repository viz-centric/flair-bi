import * as angular from 'angular';
import wizardDialogHtml from './wizard-dialog.html';

"use strict";

angular
    .module("flairbiApp")
    .controller("ServiceDetailController", ServiceDetailController);

ServiceDetailController.$inject = [
    "$scope",
    "$rootScope",
    "$stateParams",
    "previousState",
    "entity",
    "Service",
    "Datasources",
    "$state",
    "ConnectionTypes",
    "$uibModal",
    "$translate"
];

function ServiceDetailController(
    $scope,
    $rootScope,
    $stateParams,
    previousState,
    entity,
    Service,
    Datasources,
    $state,
    ConnectionTypes,
    $uibModal,
    $translate
) {
    var vm = this;

    vm.service = entity;
    vm.previousState = previousState.name;
    vm.openWizard = openWizard;
    vm.connectionTypes = [];

    init();

    function init() {
        vm.connectionTypes = ConnectionTypes.query();

        vm.connectionTypes
            .$promise
            .catch(function (data) {
                $rootScope.showErrorSingleToast({
                    text: $translate.instant('flairbiApp.service.error.connection_types.all')
                })
            });

        var unsubscribe = $rootScope.$on("flairbiApp:serviceUpdate", function (
            event,
            result
        ) {
            vm.service = result;
        });
        $scope.$on("$destroy", unsubscribe);
    }

    function openWizard(ct) {
        $uibModal
            .open({
                template: wizardDialogHtml,
                controller: "WizardDialogController",
                controllerAs: "vm",
                backdrop: "static",
                size: "lg",
                resolve: {
                    connectionType: function () {
                        return ct;
                    },
                    service: function () {
                        return vm.service;
                    }
                }
            })
            .result.then(
            function () {
                $state.reload();
            },
            function () {
            }
        );
    }
}

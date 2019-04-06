import * as angular from 'angular';
"use strict";

angular
    .module("flairbiApp")
    .controller(
        "VisualizationsDialogController",
        VisualizationsDialogController
    );

VisualizationsDialogController.$inject = [
    "$timeout",
    "$scope",
    "$stateParams",
    "$uibModalInstance",
    "entity",
    "Visualizations"
];

function VisualizationsDialogController(
    $timeout,
    $scope,
    $stateParams,
    $uibModalInstance,
    entity,
    Visualizations
) {
    var vm = this;

    vm.visualizations = entity;
    vm.clear = clear;
    vm.save = save;

    $timeout(function () {
        angular.element(".form-group:eq(1)>input").focus();
    });

    function clear() {
        $uibModalInstance.dismiss("cancel");
    }

    function save() {
        vm.isSaving = true;
        if (vm.visualizations.id !== null) {
            Visualizations.update(
                vm.visualizations,
                onSaveSuccess,
                onSaveError
            );
        } else {
            Visualizations.save(
                vm.visualizations,
                onSaveSuccess,
                onSaveError
            );
        }
    }

    function onSaveSuccess(result) {
        $scope.$emit("flairbiApp:visualizationsUpdate", result);
        $uibModalInstance.close(result);
        vm.isSaving = false;
    }

    function onSaveError() {
        vm.isSaving = false;
    }
}
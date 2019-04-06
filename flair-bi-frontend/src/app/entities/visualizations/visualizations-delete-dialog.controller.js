import * as angular from 'angular';
"use strict";

angular
    .module("flairbiApp")
    .controller(
        "VisualizationsDeleteController",
        VisualizationsDeleteController
    );

VisualizationsDeleteController.$inject = [
    "$uibModalInstance",
    "entity",
    "Visualizations"
];

function VisualizationsDeleteController(
    $uibModalInstance,
    entity,
    Visualizations
) {
    var vm = this;

    vm.visualizations = entity;
    vm.clear = clear;
    vm.confirmDelete = confirmDelete;

    function clear() {
        $uibModalInstance.dismiss("cancel");
    }

    function confirmDelete(id) {
        Visualizations.delete({ id: id }, function () {
            $uibModalInstance.close(true);
        });
    }
}
import * as angular from 'angular';
"use strict";

angular
    .module("flairbiApp")
    .controller(
        "PropertyTypeDeleteDialogController",
        PropertyTypeDeleteDialogController
    );

PropertyTypeDeleteDialogController.$inject = [
    "$scope",
    "entity",
    "PropertyTypes",
    "$uibModalInstance"
];

function PropertyTypeDeleteDialogController(
    $scope,
    entity,
    PropertyTypes,
    $uibModalInstance
) {
    var vm = this;

    vm.propertyType = entity;
    vm.clear = clear;
    vm.confirmDelete = confirmDelete;

    ////////////////
    function clear() {
        $uibModalInstance.dismiss("cancel");
    }

    function confirmDelete(id) {
        PropertyTypes.delete(
            {
                id: id
            },
            function () {
                $uibModalInstance.close(true);
            }
        );
    }
}
import * as angular from 'angular';
"use strict";

angular
    .module("flairbiApp")
    .controller("DatasourcesDeleteController", DatasourcesDeleteController);

DatasourcesDeleteController.$inject = [
    "$uibModalInstance",
    "entity",
    "Datasources",
    "deleteInfo"
];

function DatasourcesDeleteController(
    $uibModalInstance,
    entity,
    Datasources,
    deleteInfo
) {
    var vm = this;

    vm.datasources = entity;
    vm.clear = clear;
    vm.confirmDelete = confirmDelete;
    vm.deleteInfo = deleteInfo;

    function clear() {
        $uibModalInstance.dismiss("cancel");
    }

    function confirmDelete(id) {
        Datasources.delete({ id: id }, function () {
            $uibModalInstance.close(true);
        });
    }
}
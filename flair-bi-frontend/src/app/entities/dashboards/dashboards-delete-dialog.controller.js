import * as angular from 'angular';
"use strict";

angular
    .module("flairbiApp")
    .controller("DashboardsDeleteController", DashboardsDeleteController);

DashboardsDeleteController.$inject = [
    "$uibModalInstance",
    "entity",
    "Dashboards"
];

function DashboardsDeleteController($uibModalInstance, entity, Dashboards) {
    var vm = this;

    vm.dashboards = entity;
    vm.clear = clear;
    vm.confirmDelete = confirmDelete;

    function clear() {
        $uibModalInstance.dismiss("cancel");
    }

    function confirmDelete(id) {
        Dashboards.delete({ id: id }, function () {
            $uibModalInstance.close(true);
        });
    }
}
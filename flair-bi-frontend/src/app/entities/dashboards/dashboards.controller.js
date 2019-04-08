import angular from 'angular';
"use strict";

angular
    .module("flairbiApp")
    .controller("DashboardsController", DashboardsController);

DashboardsController.$inject = [
    "$scope",
    "$state",
    "DataUtils",
    "Dashboards",
    "PERMISSIONS",
    "Principal"
];

function DashboardsController(
    $scope,
    $state,
    DataUtils,
    Dashboards,
    PERMISSIONS,
    Principal
) {
    var vm = this;

    vm.dashboards = [];
    vm.openFile = DataUtils.openFile;
    vm.byteSize = DataUtils.byteSize;
    vm.fSearchQuery = "Sales";
    vm.permissions = PERMISSIONS;
    vm.showWaterMark = true;

    loadAll();

    function loadAll() {
        Dashboards.query(function (result) {
            vm.dashboards = result;
            vm.showWaterMark = vm.dashboards.length > 0;
            vm.searchQuery = null;
        });
    }
}
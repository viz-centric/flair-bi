import * as angular from 'angular';
"use strict";

angular
    .module("flairbiApp")
    .controller("DashboardsDetailController", DashboardsDetailController);

DashboardsDetailController.$inject = [
    "$scope",
    "$rootScope",
    "$state",
    "$stateParams",
    "previousState",
    "DataUtils",
    "entity",
    "Dashboards",
    "Views",
    "$window",
    "Principal"
];

function DashboardsDetailController(
    $scope,
    $rootScope,
    $state,
    $stateParams,
    previousState,
    DataUtils,
    entity,
    Dashboards,
    Views,
    $window,
    Principal
) {
    var vm = this;

    vm.dashboards = entity;
    vm.previousState = previousState.name;
    vm.byteSize = DataUtils.byteSize;
    vm.openFile = DataUtils.openFile;
    vm.dashboardId = $stateParams.id;

    var unsubscribe = $rootScope.$on(
        "flairbiApp:dashboardsUpdate",
        function (event, result) {
            vm.dashboards = result;
        }
    );
    $scope.$on("$destroy", unsubscribe);
    $scope.moveToOverview = function (info) {
        $window.history.back();
    };

    Principal.hasAuthority(
        "WRITE_" + vm.dashboardId + "_DASHBOARD"
    ).then(function (obj) {
        vm.canEdit = obj;
    });
}
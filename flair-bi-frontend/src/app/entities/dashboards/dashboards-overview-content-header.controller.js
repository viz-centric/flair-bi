import * as angular from 'angular';
"use strict";

angular
    .module("flairbiApp")
    .controller("DashboardOverviewContentHeaderController", DashboardOverviewContentHeaderController);

DashboardOverviewContentHeaderController.$inject = [
    "$scope",
    "entity",
    "AccountDispatch"
];

function DashboardOverviewContentHeaderController(
    $scope,
    entity,
    AccountDispatch
) {
    var vm = this;

    vm.selectedDashboard = entity;

    activate();

    function activate() {

        vm.canWriteViews = AccountDispatch.hasAuthority(
            "WRITE_" + vm.selectedDashboard.id + "_DASHBOARD"
        );

    }
}
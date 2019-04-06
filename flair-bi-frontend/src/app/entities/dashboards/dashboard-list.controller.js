import * as angular from 'angular';
"use strict";

angular
    .module("flairbiApp")
    .controller("DashboardListController", DashboardListController);

DashboardListController.$inject = [
    "$scope",
    "dashboardFilter",
    "Dashboards",
    "$stateParams"
];
function DashboardListController($scope, dashboardFilter, Dashboards, $stateParams) {
    var vm = this;
    vm.serviceId = $stateParams.id;
    vm.connectionId = $stateParams.connectionLinkId;

    activate();

    ////////////////

    function activate() {
        var filter = {};
        if (dashboardFilter) {
            filter = dashboardFilter;
        }
        vm.dashboards = Dashboards.query(filter);
    }
}
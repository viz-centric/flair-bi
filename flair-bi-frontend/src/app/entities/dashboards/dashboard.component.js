import * as angular from 'angular';
import dashboardComponentHtml from './dashboard.component.html';

"use strict";

angular.module("flairbiApp").component("dashboardComponent", {
    template: dashboardComponentHtml,
    controller: dashboardController,
    controllerAs: "vm",
    bindings: {
        dashboard: "="
    }
});

dashboardController.$inject = ["$scope", "Principal"];

function dashboardController($scope, Principal) {
    var vm = this;

    vm.$onInit = activate;

    ////////////////

    function activate() {
    }

    //Issue Fix - hasAuthority returns promise object - Below is the way to get the value from promise - Start
    Principal.hasAuthority(
        "DELETE_" + vm.dashboard.id + "_DASHBOARD"
    ).then(function (obj) {
        vm.canDeleteDashboard = obj;
    });

    Principal.hasAuthority(
        "REQUEST-PUBLISH_" + vm.dashboard.id + "_DASHBOARD"
    ).then(function (obj) {
        vm.canRequestDashboardRelease = obj;
    });
}

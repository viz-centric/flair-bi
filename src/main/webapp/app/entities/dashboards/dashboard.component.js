(function () {
    "use strict";

    angular.module("flairbiApp").component("dashboardComponent", {
        templateUrl: "app/entities/dashboards/dashboard.component.html",
        controller: dashboardController,
        controllerAs: "vm",
        bindings: {
            dashboard: "="
        }
    });

    dashboardController.$inject = ["Principal"];

    function dashboardController(Principal) {
        var vm = this;

        vm.$onInit = activate;

        ////////////////

        function activate() {
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
    }
})();

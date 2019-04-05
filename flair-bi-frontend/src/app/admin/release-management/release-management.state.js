(function() {
    "use strict";

    angular.module("flairbiApp").config(stateConfig);

    stateConfig.$inject = ["$stateProvider"];

    function stateConfig($stateProvider) {
        $stateProvider.state("release-management", {
            parent: "admin",
            url: "/release-management",
            data: {
                displayName: "Release Management"
            },
            views: {
                "content-header@": {
                    templateUrl: "app/admin/release-management/release-management-content-header.html"
                },
                "content@": {
                    templateUrl: "app/admin/release-management/release-management.html",
                    controller: "ReleaseManagementController",
                    controllerAs: "vm"
                }
            }
        });
    }
})();

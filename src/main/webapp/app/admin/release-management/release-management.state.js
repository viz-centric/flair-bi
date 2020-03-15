(function () {
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
                    component: 'releaseManagementComponent'
                }
            },
            resolve: {
                translatePartialLoader: [
                    "$translate",
                    "$translatePartialLoader",
                    function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart("releaseRequests");
                        return $translate.refresh();
                    }
                ]
            }
        });
    }
})();

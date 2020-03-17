(function() {
    "use strict";

    angular.module("flairbiApp").config(stateConfig);

    stateConfig.$inject = [
        "$stateProvider",
        "$locationProvider"
    ];

    function stateConfig($stateProvider, $locationProvider) {
        $stateProvider.state("app", {
            abstract: true,
            views: {
                "navbar@": {
                    templateUrl: "app/layouts/navbar/navbar.html",
                    controller: "NavbarController",
                    controllerAs: "vm"
                },
                "explorationNav@": {
                    templateUrl:
                        "app/layouts/explorationNav/explorationNav.html",
                    controller: "ExplorationNavController",
                    controllerAs: "vm"
                },
                "footer@": {
                    templateUrl: "app/layouts/footer/footer.html",
                    controller: "FooterController",
                    controllerAs: "vm"
                },
                "topnavbar@": {
                    templateUrl: "app/layouts/topnavbar/topnavbar.html",
                    controller: "TopNavBarController",
                    controllerAs: "vm"
                }
            },
            resolve: {
                translatePartialLoader: [
                    "$translate",
                    "$translatePartialLoader",
                    function($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart("global");
                        return $translate.refresh();
                    }
                ]
            }
        });
    }
})();

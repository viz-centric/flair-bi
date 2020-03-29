(function () {
    "use strict";

    angular.module("flairbiApp").config(stateConfig);

    stateConfig.$inject = [
        "$stateProvider",
        "$locationProvider"
    ];

    function stateConfig($stateProvider) {
        $stateProvider.state("app", {
            abstract: true,
            views: {
                "navbar@": {
                    component: 'navbarComponent'
                },
                "explorationNav@": {
                    templateUrl:
                        "app/layouts/explorationNav/explorationNav.html",
                    controller: "ExplorationNavController",
                    controllerAs: "vm"
                },
                "footer@": {
                    component: 'footerComponent'
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
                    function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart("global");
                        return $translate.refresh();
                    }
                ]
            }
        });
    }
})();

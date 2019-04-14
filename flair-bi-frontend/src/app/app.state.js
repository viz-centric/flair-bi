import angular from 'angular';

import navbar from './layouts/navbar/navbar.html';
import explorationNav from './layouts/explorationNav/explorationNav.html';
import footer from './layouts/footer/footer.html';
import topNavbar from './layouts/topnavbar/topnavbar.html';

"use strict";

angular.module('flairbiApp')
    .config(stateConfig);

stateConfig.$inject = [
    "$stateProvider"
];

function stateConfig($stateProvider) {
    $stateProvider.state("app", {
        abstract: true,
        views: {
            "navbar@": {
                template: navbar,
                controller: "NavbarController",
                controllerAs: "vm"
            },
            "explorationNav@": {
                template: explorationNav,
                controller: "ExplorationNavController",
                controllerAs: "vm"
            },
            "footer@": {
                template: footer,
                controller: "FooterController",
                controllerAs: "vm"
            },
            "topnavbar@": {
                template: topNavbar,
                controller: "TopNavBarController",
                controllerAs: "vm"
            }
        },
        resolve: {
            authorize: [
                "Auth",
                function (Auth) {
                    return Auth.authorize();
                }
            ],
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

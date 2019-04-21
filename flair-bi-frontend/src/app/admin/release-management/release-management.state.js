import * as angular from 'angular';
import releaseManagementContentHeaderHtml from './release-management-content-header.html';
import releaseManagementHtml from './release-management.html';

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
                template: releaseManagementContentHeaderHtml
            },
            "content@": {
                template: releaseManagementHtml,
                controller: "ReleaseManagementController",
                controllerAs: "vm"
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

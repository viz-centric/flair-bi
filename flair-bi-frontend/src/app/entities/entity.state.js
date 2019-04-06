import * as angular from 'angular';
"use strict";

angular.module("flairbiApp").config(stateConfig);

stateConfig.$inject = ["$stateProvider"];

function stateConfig($stateProvider) {
    $stateProvider.state("entity", {
        abstract: true,
        parent: "app"
    });
}
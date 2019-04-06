import * as angular from 'angular';
"use strict";

angular
    .module("flairbiApp")
    .controller("FlairBiFooterController", FlairBiFooterController);

FlairBiFooterController.$inject = ["$rootScope"];

function FlairBiFooterController($rootScope) {
    var vm = this;

    vm.onAction = onAction;
    vm.offAction = offAction;

    activate();

    ////////////////

    function activate() { }

    function onAction() {
        $rootScope.$broadcast("FlairBi:button-toggle", true);
    }

    function offAction() {
        $rootScope.$broadcast("FlairBi:button-toggle", false);
    }
}
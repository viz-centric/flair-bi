import * as angular from 'angular';
"use strict";

angular
    .module("flairbiApp")
    .controller("PropertyTypeController", PropertyTypeController);

PropertyTypeController.$inject = ["PropertyTypes"];

function PropertyTypeController(PropertyTypes) {
    var vm = this;

    activate();

    ////////////////

    function activate() {
        loadAll();
    }

    function loadAll() {
        vm.propertyTypes = PropertyTypes.query();
    }
}
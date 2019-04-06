import * as angular from 'angular';
"use strict";

angular
    .module("flairbiApp")
    .controller(
        "VisualmetadataDetailController",
        VisualmetadataDetailController
    );

VisualmetadataDetailController.$inject = [
    "$scope",
    "$rootScope",
    "$stateParams",
    "previousState",
    "entity",
    "Visualmetadata",
    "Visualizations"
];

function VisualmetadataDetailController(
    $scope,
    $rootScope,
    $stateParams,
    previousState,
    entity,
    Visualmetadata,
    Visualizations
) {
    var vm = this;

    vm.visualmetadata = entity;
    vm.previousState = previousState.name;

    var unsubscribe = $rootScope.$on(
        "flairbiApp:visualmetadataUpdate",
        function (event, result) {
            vm.visualmetadata = result;
        }
    );
    $scope.$on("$destroy", unsubscribe);
}
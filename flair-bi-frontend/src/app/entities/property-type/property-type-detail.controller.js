import * as angular from 'angular';
"use strict";

angular
    .module("flairbiApp")
    .controller(
        "PropertyTypeDetailController",
        PropertyTypeDetailController
    );

PropertyTypeDetailController.$inject = [
    "previousState",
    "entity",
    "$rootScope",
    "$scope"
];

function PropertyTypeDetailController(
    previousState,
    entity,
    $rootScope,
    $scope
) {
    var vm = this;

    activate();

    ////////////////

    function activate() {
        vm.previousState = previousState.name;
        if (!angular.equals(previousState.params, {})) {
            vm.previousState +=
                "(" + JSON.stringify(previousState.params) + ")";
        }
        preprocessEntity(entity);
    }

    function preprocessEntity(result) {
        vm.propertyType = result;

        if (vm.propertyType.possibleValues) {
            vm.propertyType.values = vm.propertyType.possibleValues.map(
                function (item) {
                    return {
                        text: item.value
                    };
                }
            );
        }
    }
}
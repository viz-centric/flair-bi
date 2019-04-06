import * as angular from 'angular';
"use strict";

angular
    .module("flairbiApp")
    .controller(
        "DatasourceConstraintDetailController",
        DatasourceConstraintDetailController
    );

DatasourceConstraintDetailController.$inject = [
    "$scope",
    "$rootScope",
    "$stateParams",
    "previousState",
    "entity",
    "DatasourceConstraint",
    "User",
    "Datasources"
];

function DatasourceConstraintDetailController(
    $scope,
    $rootScope,
    $stateParams,
    previousState,
    entity,
    DatasourceConstraint,
    User,
    Datasources
) {
    var vm = this;

    vm.datasourceConstraint = entity;
    vm.previousState = previousState.name;

    var unsubscribe = $rootScope.$on(
        "flairbiApp:datasourceConstraintUpdate",
        function (event, result) {
            vm.datasourceConstraint = result;
        }
    );
    $scope.$on("$destroy", unsubscribe);
}

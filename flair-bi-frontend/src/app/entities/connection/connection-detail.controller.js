import * as angular from 'angular';
"use strict";

angular
    .module("flairbiApp")
    .controller("ConnectionDetailController", ConnectionDetailController);

ConnectionDetailController.$inject = ["$scope", "entity", "previousState", "$stateParams"];
function ConnectionDetailController($scope, entity, previousState, $stateParams) {
    var vm = this;
    vm.connection = entity[0];
    vm.previousState = previousState;
    vm.serviceId = $stateParams.id;

    activate();

    ////////////////

    function activate() { }
}


import * as angular from 'angular';
"use strict";

angular.module("flairbiApp").component("connectionPropertyComponent", {
    templateUrl:
        "app/entities/connection-types/connection-property.component.html",
    controller: connectionPropertyController,
    controllerAs: "vm",
    bindings: {
        cProperty: "=",
        form: "=",
        disabled: "=",
        connection: "="
    }
});

connectionPropertyController.$inject = ["$scope"];

function connectionPropertyController($scope) {
    var vm = this;

    vm.property = property;
    vm.$onInit = activate;

    ////////////////

    function activate() {
        vm.fieldName = vm.cProperty.fieldName;
    }

    function property(propName) {
        return vm.connection.details[propName];
    }
}


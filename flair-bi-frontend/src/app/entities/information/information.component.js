import * as angular from 'angular';
"use strict";

angular.module("flairbiApp").component("informationComponent", {
    templateUrl: "app/entities/information/information.component.html",
    controller: informationController,
    controllerAs: "vm",
    bindings: {
        information: "="
    }
});

informationController.$inject = ["HttpService", "screenDetectService"];

function informationController(HttpService, screenDetectService) {
    var vm = this;
    vm.isDesktop = isDesktop;

    vm.$onInit = activate;
    ////////////////

    function activate() {
        HttpService.call(
            {
                method: "GET",
                url: vm.information.endPoint
            },
            onCallSuccess,
            onCallError
        );
    }

    function onCallSuccess(result) {
        vm.value = result.data;
    }

    function onCallError() { }

    function isDesktop() {
        return screenDetectService.isDesktop();
    }
}
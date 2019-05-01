import * as angular from 'angular';
import cacheWizardStepComponentHtml from './cache-wizard-step.component.html';
"use strict";

angular.module("flairbiApp").component("cacheWizardStep", {
    template: cacheWizardStepComponentHtml,
    controller: CacheWizardStepController,
    controllerAs: "vm",
    bindings: {
        connectionParameters: "=",
    }
});

CacheWizardStepController.$inject = ["$scope", "$rootScope"];
function CacheWizardStepController($scope, $rootScope) {
    var vm = this;
    vm.nextStep = nextStep;
    vm.previousStep = previousStep;
    vm.$onInit = function () { };
    vm.$onChanges = function (changesObj) { };
    vm.$onDestroy = function () { };

    function nextStep() {
        $rootScope.$broadcast('flairbiApp:data-connection:next-page');
    }

    function previousStep() {
        $rootScope.$broadcast('flairbiApp:data-connection:previous-page');
    }
}

import * as angular from 'angular';
"use strict";

angular
    .module("flairbiApp")
    .controller(
        "FullScreenSettingsDialogController",
        FullScreenSettingsDialogController
    );

FullScreenSettingsDialogController.$inject = [
    "$scope",
    "$stateParams",
    "$uibModalInstance",
    "settings",
    "VisualDispatchService"
];

function FullScreenSettingsDialogController(
    $scope,
    $stateParams,
    $uibModalInstance,
    settings,
    VisualDispatchService
) {
    var vm = this;
    vm.settings = settings;
    vm.clear = clear;
    vm.save = save;


    function clear() {
        $uibModalInstance.dismiss("cancel");
    }

    function save() {
        //vm.isSaving = true;
        if (vm.settings.headerColor != undefined)
            $('.flairbi-content-header-fullscreen').css('background-color', vm.settings.headerColor);
        if (vm.settings.containerColor != undefined)
            $('.page-wrapper-full-screen').css('background-color', vm.settings.containerColor)
        VisualDispatchService.setSettings(vm.settings);
        clear();
    }

}
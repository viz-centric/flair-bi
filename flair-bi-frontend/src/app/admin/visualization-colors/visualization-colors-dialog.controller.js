import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .controller('VisualizationColorsDialogController', VisualizationColorsDialogController);

VisualizationColorsDialogController.$inject = ['$timeout', '$scope', '$stateParams', '$uibModalInstance', 'entity', 'VisualizationColors'];

function VisualizationColorsDialogController($timeout, $scope, $stateParams, $uibModalInstance, entity, VisualizationColors) {
    var vm = this;

    vm.visualizationColors = entity;
    vm.clear = clear;
    vm.save = save;

    $timeout(function () {
        angular.element('.form-group:eq(1)>input').focus();
    });

    function clear() {
        $uibModalInstance.dismiss('cancel');
    }

    function save() {
        vm.isSaving = true;
        if (vm.visualizationColors.id !== null) {
            VisualizationColors.update(vm.visualizationColors, onSaveSuccess, onSaveError);
        } else {
            VisualizationColors.save(vm.visualizationColors, onSaveSuccess, onSaveError);
        }
    }

    function onSaveSuccess(result) {
        $scope.$emit('flairbiApp:visualizationColorsUpdate', result);
        $uibModalInstance.close(result);
        vm.isSaving = false;
    }

    function onSaveError() {
        vm.isSaving = false;
    }


}
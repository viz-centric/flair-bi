import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .controller('VisualizationColorsDeleteController', VisualizationColorsDeleteController);

VisualizationColorsDeleteController.$inject = ['$uibModalInstance', 'entity', 'VisualizationColors'];

function VisualizationColorsDeleteController($uibModalInstance, entity, VisualizationColors) {
    var vm = this;

    vm.visualizationColors = entity;
    vm.clear = clear;
    vm.confirmDelete = confirmDelete;

    function clear() {
        $uibModalInstance.dismiss('cancel');
    }

    function confirmDelete(id) {
        VisualizationColors.delete({ id: id },
            function () {
                $uibModalInstance.close(true);
            });
    }
}
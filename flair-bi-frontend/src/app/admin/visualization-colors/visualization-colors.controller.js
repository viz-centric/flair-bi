import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .controller('VisualizationColorsController', VisualizationColorsController);

VisualizationColorsController.$inject = ['$scope', '$state', 'VisualizationColors'];

function VisualizationColorsController($scope, $state, VisualizationColors) {
    var vm = this;

    vm.visualizationColors = [];

    loadAll();

    function loadAll() {
        VisualizationColors.query(function (result) {
            vm.visualizationColors = result;
            vm.searchQuery = null;
        });
    }
}
(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('visualizationColorsComponent', {
            templateUrl: 'app/admin/visualization-colors/visualization-colors.component.html',
            controller: VisualizationColorsController,
            controllerAs: 'vm'
        }).component('visualizationColorsContentHeaderComponent', {
            templateUrl: 'app/admin/visualization-colors/visualization-colors-content-header.component.html',
            controller: VisualizationColorsController,
            controllerAs: 'vm'
        });


    VisualizationColorsController.$inject = ['VisualizationColors'];

    function VisualizationColorsController(VisualizationColors) {
        var vm = this;

        vm.visualizationColors = [];

        vm.$onInit = loadAll;

        function loadAll() {
            VisualizationColors.query(function (result) {
                vm.visualizationColors = result;
                vm.searchQuery = null;
            });
        }
    }
})();

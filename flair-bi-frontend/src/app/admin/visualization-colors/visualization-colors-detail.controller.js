(function() {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('VisualizationColorsDetailController', VisualizationColorsDetailController);

    VisualizationColorsDetailController.$inject = ['$scope', '$rootScope', '$stateParams', 'previousState', 'entity', 'VisualizationColors'];

    function VisualizationColorsDetailController($scope, $rootScope, $stateParams, previousState, entity, VisualizationColors) {
        var vm = this;

        vm.visualizationColors = entity;
        vm.previousState = previousState.name;

        var unsubscribe = $rootScope.$on('flairbiApp:visualizationColorsUpdate', function(event, result) {
            vm.visualizationColors = result;
        });
        $scope.$on('$destroy', unsubscribe);
    }
})();

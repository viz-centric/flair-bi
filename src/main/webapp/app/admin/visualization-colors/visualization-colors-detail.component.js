(function () {
    'use strict';


    angular
        .module('flairbiApp')
        .component('visualizationColorsDetailComponent', {
            templateUrl: 'app/admin/visualization-colors/visualization-colors-detail.component.html',
            controller: VisualizationColorsDetailController,
            controllerAs: 'vm',
            bindings: {
                entity: '<',
                previousState: '<'
            }
        });

    VisualizationColorsDetailController.$inject = ['$scope', '$rootScope'];

    function VisualizationColorsDetailController($scope, $rootScope) {
        var vm = this;

        vm.$onInit = function () {
            vm.visualizationColors = vm.entity;
            vm.previousState = vm.previousState.name;
        }

        var unsubscribe = $rootScope.$on('flairbiApp:visualizationColorsUpdate', function (_, result) {
            vm.visualizationColors = result;
        });
        $scope.$on('$destroy', unsubscribe);
    }
})();

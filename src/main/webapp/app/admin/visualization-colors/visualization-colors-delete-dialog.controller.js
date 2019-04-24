(function() {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('VisualizationColorsDeleteController',VisualizationColorsDeleteController);

    VisualizationColorsDeleteController.$inject = ['$uibModalInstance', 'entity', 'VisualizationColors','$translate','$rootScope'];

    function VisualizationColorsDeleteController($uibModalInstance, entity, VisualizationColors,$translate,$rootScope) {
        var vm = this;

        vm.visualizationColors = entity;
        vm.clear = clear;
        vm.confirmDelete = confirmDelete;

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }

        function confirmDelete (id) {
            VisualizationColors.delete({id: id},
                function () {
                    $uibModalInstance.close(true);
                    var info = {text:$translate.instant('flairbiApp.visualizationColors.deleted',{param:id}),title: "Deleted"}
                    $rootScope.showSuccessToast(info);
                },function(){
                    $rootScope.showErrorSingleToast({
                        text: $translate.instant('flairbiApp.visualizationColors.errorDeleting')
                    });
                });
        }
    }
})();

(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('visualizationColorsDeleteComponent', {
            templateUrl: 'app/admin/visualization-colors/visualization-colors-delete-dialog.component.html',
            controller: VisualizationColorsDeleteController,
            controllerAs: 'vm',
            bindings: {
                resolve: '<',
                dismiss: '&',
                close: '&'
            }
        });

    VisualizationColorsDeleteController.$inject = ['VisualizationColors', '$translate', '$rootScope'];

    function VisualizationColorsDeleteController(VisualizationColors, $translate, $rootScope) {
        var vm = this;

        vm.$onInit = function () {
            vm.visualizationColors = vm.entity;
        }

        vm.clear = clear;
        vm.confirmDelete = confirmDelete;

        function clear() {
            vm.dismiss();
        }

        function confirmDelete(id) {
            VisualizationColors.delete({ id: id },
                function () {
                    vm.close(true);
                    var info = { text: $translate.instant('flairbiApp.visualizationColors.deleted', { param: id }), title: "Deleted" }
                    $rootScope.showSuccessToast(info);
                }, function () {
                    $rootScope.showErrorSingleToast({
                        text: $translate.instant('flairbiApp.visualizationColors.errorDeleting')
                    });
                });
        }
    }
})();

(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('visualizationColorsDialogComponent', {
            templateUrl: 'app/admin/visualization-colors/visualization-colors-dialog.component.html',
            controller: VisualizationColorsDialogController,
            controllerAs: 'vm',
            bindings: {
                resolve: '<',
                dismiss: '&',
                close: '&'
            }
        });

    VisualizationColorsDialogController.$inject = ['$scope', 'VisualizationColors', '$translate', '$rootScope'];

    function VisualizationColorsDialogController($scope, VisualizationColors, $translate, $rootScope) {
        var vm = this;


        vm.clear = clear;
        vm.save = save;

        vm.$onInit = function () {
            vm.visualizationColors = vm.resolve.entity;
        }

        function clear() {
            vm.dismiss();
        }

        function save() {
            vm.isSaving = true;
            if (vm.visualizationColors.id !== null) {
                VisualizationColors.update(vm.visualizationColors, onUpdateSuccess, onSaveError);
            } else {
                VisualizationColors.save(vm.visualizationColors, onSaveSuccess, onSaveError);
            }
        }

        function onSaveSuccess(result) {
            onSave(result);
            var info = { text: $translate.instant('flairbiApp.visualizationColors.created', { param: result.id }), title: "Saved" }
            $rootScope.showSuccessToast(info);
        }

        function onUpdateSuccess(result) {
            onSave(result);
            var info = { text: $translate.instant('flairbiApp.visualizationColors.updated', { param: result.id }), title: "Updated" }
            $rootScope.showSuccessToast(info);
        }

        function onSave(result) {
            $scope.$emit('flairbiApp:visualizationColorsUpdate', result);
            vm.close(result);
            vm.isSaving = false;
        }

        function onSaveError() {
            vm.isSaving = false;
            $rootScope.showErrorSingleToast({
                text: $translate.instant('flairbiApp.visualizationColors.errorSaving')
            });
        }


    }
})();

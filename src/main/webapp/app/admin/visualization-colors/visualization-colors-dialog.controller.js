(function() {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('VisualizationColorsDialogController', VisualizationColorsDialogController);

    VisualizationColorsDialogController.$inject = ['$timeout', '$scope', '$stateParams', '$uibModalInstance', 'entity', 'VisualizationColors','$translate','$rootScope'];

    function VisualizationColorsDialogController ($timeout, $scope, $stateParams, $uibModalInstance, entity, VisualizationColors,$translate,$rootScope) {
        var vm = this;

        vm.visualizationColors = entity;
        vm.clear = clear;
        vm.save = save;

        $timeout(function (){
            angular.element('.form-group:eq(1)>input').focus();
        });

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }

        function save () {
            vm.isSaving = true;
            if (vm.visualizationColors.id !== null) {
                VisualizationColors.update(vm.visualizationColors, onUpdateSuccess, onSaveError);
            } else {
                VisualizationColors.save(vm.visualizationColors, onSaveSuccess, onSaveError);
            }
        }

        function onSaveSuccess (result) {
            onSave(result);
            var info = {text:$translate.instant('flairbiApp.visualizationColors.created',{param:result.id}),title: "Saved"}
            $rootScope.showSuccessToast(info);
        }

        function onUpdateSuccess (result) {
            onSave(result);
            var info = {text:$translate.instant('flairbiApp.visualizationColors.updated',{param:result.id}),title: "Updated"}
            $rootScope.showSuccessToast(info);
        }

        function onSave(result){
            $scope.$emit('flairbiApp:visualizationColorsUpdate', result);
            $uibModalInstance.close(result);
            vm.isSaving = false;            
        }

        function onSaveError () {
            vm.isSaving = false;
            $rootScope.showErrorSingleToast({
                text: $translate.instant('flairbiApp.visualizationColors.errorSaving')
            });
        }


    }
})();

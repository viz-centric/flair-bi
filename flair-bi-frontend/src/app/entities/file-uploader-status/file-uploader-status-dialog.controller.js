(function() {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('FileUploaderStatusDialogController', FileUploaderStatusDialogController);

    FileUploaderStatusDialogController.$inject = ['$timeout', '$scope', '$stateParams', '$uibModalInstance', 'entity', 'FileUploaderStatus'];

    function FileUploaderStatusDialogController ($timeout, $scope, $stateParams, $uibModalInstance, entity, FileUploaderStatus) {
        var vm = this;

        vm.fileUploaderStatus = entity;
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
            if (vm.fileUploaderStatus.id !== null) {
                FileUploaderStatus.update(vm.fileUploaderStatus, onSaveSuccess, onSaveError);
            } else {
                FileUploaderStatus.save(vm.fileUploaderStatus, onSaveSuccess, onSaveError);
            }
        }

        function onSaveSuccess (result) {
            $scope.$emit('flairbiApp:fileUploaderStatusUpdate', result);
            $uibModalInstance.close(result);
            vm.isSaving = false;
        }

        function onSaveError () {
            vm.isSaving = false;
        }


    }
})();

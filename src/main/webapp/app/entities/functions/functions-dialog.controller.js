(function() {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('FunctionsDialogController', FunctionsDialogController);

    FunctionsDialogController.$inject = ['$timeout', '$scope', '$stateParams', '$uibModalInstance', 'entity', 'Functions'];

    function FunctionsDialogController ($timeout, $scope, $stateParams, $uibModalInstance, entity, Functions) {
        var vm = this;

        vm.functions = entity;
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
            if (vm.functions.id !== null) {
                Functions.update(vm.functions, onSaveSuccess, onSaveError);
            } else {
                Functions.save(vm.functions, onSaveSuccess, onSaveError);
            }
        }

        function onSaveSuccess (result) {
            $scope.$emit('flairbiApp:functionsUpdate', result);
            $uibModalInstance.close(result);
            vm.isSaving = false;
        }

        function onSaveError () {
            vm.isSaving = false;
        }


    }
})();

(function() {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('RealmDialogController', RealmDialogController);

    RealmDialogController.$inject = ['$timeout', '$scope', '$stateParams', '$uibModalInstance', 'entity', 'Realm'];

    function RealmDialogController ($timeout, $scope, $stateParams, $uibModalInstance, entity, Realm) {
        var vm = this;

        vm.realm = entity;
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
            if (vm.realm.id !== null) {
                Realm.update(vm.realm, onSaveSuccess, onSaveError);
            } else {
                Realm.save(vm.realm, onSaveSuccess, onSaveError);
            }
        }

        function onSaveSuccess (result) {
            $scope.$emit('flairbiApp:realmUpdate', result);
            $uibModalInstance.close(result);
            vm.isSaving = false;
        }

        function onSaveError () {
            vm.isSaving = false;
        }


    }
})();

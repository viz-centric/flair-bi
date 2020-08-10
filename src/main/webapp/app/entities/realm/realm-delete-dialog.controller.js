(function() {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('RealmDeleteController',RealmDeleteController);

    RealmDeleteController.$inject = ['$uibModalInstance', 'entity', 'Realm'];

    function RealmDeleteController($uibModalInstance, entity, Realm) {
        var vm = this;

        vm.realm = entity;
        vm.clear = clear;
        vm.confirmDelete = confirmDelete;

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }

        function confirmDelete (id) {
            Realm.delete({id: id},
                function () {
                    $uibModalInstance.close(true);
                });
        }
    }
})();

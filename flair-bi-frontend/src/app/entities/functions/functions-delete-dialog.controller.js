(function() {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('FunctionsDeleteController',FunctionsDeleteController);

    FunctionsDeleteController.$inject = ['$uibModalInstance', 'entity', 'Functions'];

    function FunctionsDeleteController($uibModalInstance, entity, Functions) {
        var vm = this;

        vm.functions = entity;
        vm.clear = clear;
        vm.confirmDelete = confirmDelete;

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }

        function confirmDelete (id) {
            Functions.delete({id: id},
                function () {
                    $uibModalInstance.close(true);
                });
        }
    }
})();

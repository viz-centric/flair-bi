(function() {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('FileUploaderStatusDeleteController',FileUploaderStatusDeleteController);

    FileUploaderStatusDeleteController.$inject = ['$uibModalInstance', 'entity', 'FileUploaderStatus'];

    function FileUploaderStatusDeleteController($uibModalInstance, entity, FileUploaderStatus) {
        var vm = this;

        vm.fileUploaderStatus = entity;
        vm.clear = clear;
        vm.confirmDelete = confirmDelete;

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }

        function confirmDelete (id) {
            FileUploaderStatus.delete({id: id},
                function () {
                    $uibModalInstance.close(true);
                });
        }
    }
})();

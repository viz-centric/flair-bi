(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('TableDialogController', TableDialogController);

    TableDialogController.$inject = ['$uibModalInstance', 'data','fileName', 'ExportService'];

    function TableDialogController($uibModalInstance, data, fileName, ExportService) {
        var vm = this;
        vm.clear = clear;
        vm.exportExcel = exportExcel;
        vm.fifileName = fileName;
        activate();

        ////////////////

        function activate() {
            vm.data = data;
        }

        function clear() {
            $uibModalInstance.dismiss('cancel');
        }

        function exportExcel() {
            ExportService.exportCSV( vm.fifileName , vm.data);
        }
    }
})();

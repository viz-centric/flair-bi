import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .controller('TableDialogController', TableDialogController);

TableDialogController.$inject = ['$uibModalInstance', 'data', 'ExportService'];

function TableDialogController($uibModalInstance, data, ExportService) {
    var vm = this;
    vm.clear = clear;
    vm.exportExcel = exportExcel;
    activate();

    ////////////////

    function activate() {
        vm.data = data;
    }

    function clear() {
        $uibModalInstance.dismiss('cancel');
    }

    function exportExcel() {
        ExportService.exportCSV('export.csv', vm.data);
    }
}

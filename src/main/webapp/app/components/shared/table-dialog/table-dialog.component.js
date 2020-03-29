(function () {
    'use strict';
    angular
        .module('flairbiApp')
        .component('tableDialogComponent', {
            templateUrl: 'app/components/shared/table-dialog/table-dialog.component.html',
            controller: TableDialogController,
            controllerAs: 'vm',
            bindings: {
                resolve: '<',
                close: '&',
                dismiss: '&'
            }
        });

    TableDialogController.$inject = ['ExportService'];

    function TableDialogController(ExportService) {
        var vm = this;
        vm.clear = clear;
        vm.exportExcel = exportExcel;

        vm.$onInit = function () {
            vm.data = vm.resolve.data;
            vm.fileName = vm.resolve.fileName;
        }

        ////////////////

        function clear() {
            vm.dismiss();
        }

        function exportExcel() {
            ExportService.exportCSV(vm.fileName, vm.data);
        }
    }
})();

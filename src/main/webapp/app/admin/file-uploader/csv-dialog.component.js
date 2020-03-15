(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('csvDialogComponent', {
            templateUrl: 'app/admin/file-uploader/csv-dialog.component.html',
            controller: CSVDialogController,
            controllerAs: 'vm',
            bindings: {
                resolve: '<',
                close: '&',
                dismiss: '&'
            }
        });

    CSVDialogController.$inject = ['dataTypesList', 'csvParserService'];

    function CSVDialogController(dataTypesList, csvParserService) {
        var vm = this;
        vm.csvData = [];
        vm.dataTypesList = dataTypesList;
        vm.clear = clear;
        vm.save = save;
        vm.changeDatatype = changeDatatype;

        vm.$onInit = function () {
            vm.csvData = vm.resolve.csvData;
        };

        function clear() {
            vm.dismiss();
        }

        function save() {
            csvParserService.getCSVData()[0] = vm.csvData[0];
            vm.close();
        }

        function changeDatatype(col, index) {
            vm.csvData[0][index] = col;
        }

    }
})();




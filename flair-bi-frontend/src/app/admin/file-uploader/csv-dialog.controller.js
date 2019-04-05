(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('CSVDialogController', CSVDialogController);

    CSVDialogController.$inject = ['$uibModalInstance','$scope','csvData','dataTypesList','$rootScope','csvParserService'];

    function CSVDialogController($uibModalInstance,$scope,csvData,dataTypesList,$rootScope,csvParserService) {
        var vm = this;
        vm.csvData=csvData;
        vm.dataTypesList=dataTypesList;
        vm.clear=clear;
        vm.save=save;
        vm.changeDatatype=changeDatatype;

        function clear() {
            $uibModalInstance.dismiss('cancel');
        }
        
        function save() {
            csvParserService.getCSVData()[0] = vm.csvData[0];
            $uibModalInstance.dismiss('cancel');
        }

        function changeDatatype(col,index){
            vm.csvData[0][index]=col;
        }
    
    }
})();




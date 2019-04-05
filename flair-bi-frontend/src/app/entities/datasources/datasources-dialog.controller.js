(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller("DatasourcesDialogController", DatasourcesDialogController);

    DatasourcesDialogController.$inject = [
        "$timeout",
        "$scope",
        "$uibModalInstance",
        "entity",
        "Datasources"
    ];

    function DatasourcesDialogController(
        $timeout,
        $scope,
        $uibModalInstance,
        entity,
        Datasources
    ) {
        var vm = this;

        vm.datasources = entity;
        vm.clear = clear;
        vm.datePickerOpenStatus = {};
        vm.openCalendar = openCalendar;
        vm.save = save;

        $timeout(function() {
            angular.element(".form-group:eq(1)>input").focus();
        });

        function clear() {
            $uibModalInstance.dismiss("cancel");
        }

        function save() {
            vm.isSaving = true;
            if (vm.datasources.id !== null) {
                Datasources.update(vm.datasources, onSaveSuccess, onSaveError);
            } else {
                Datasources.save(vm.datasources, onSaveSuccess, onSaveError);
            }
        }

        function onSaveSuccess(result) {
            $scope.$emit("flairbiApp:datasourcesUpdate", result);
            $uibModalInstance.close(result);
            vm.isSaving = false;
        }

        function onSaveError() {
            vm.isSaving = false;
        }

        vm.datePickerOpenStatus.lastUpdated = false;

        function openCalendar(date) {
            vm.datePickerOpenStatus[date] = true;
        }
    }
})();

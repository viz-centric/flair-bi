(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller("ServiceDialogController", ServiceDialogController);

    ServiceDialogController.$inject = [
        "$timeout",
        "$scope",
        "$stateParams",
        "$uibModalInstance",
        "entity",
        "Service",
        "Datasources"
    ];

    function ServiceDialogController(
        $timeout,
        $scope,
        $stateParams,
        $uibModalInstance,
        entity,
        Service,
        Datasources
    ) {
        var vm = this;

        vm.service = entity;
        vm.clear = clear;
        vm.save = save;
        vm.datasources = Datasources.query();

        $timeout(function() {
            angular.element(".form-group:eq(1)>input").focus();
        });

        function clear() {
            $uibModalInstance.dismiss("cancel");
        }

        function save() {
            vm.isSaving = true;
            if (vm.service.id !== null) {
                Service.update(vm.service, onSaveSuccess, onSaveError);
            } else {
                Service.save(vm.service, onSaveSuccess, onSaveError);
            }
        }

        function onSaveSuccess(result) {
            $scope.$emit("flairbiApp:serviceUpdate", result);
            $uibModalInstance.close(result);
            vm.isSaving = false;
        }

        function onSaveError() {
            vm.isSaving = false;
        }
    }
})();

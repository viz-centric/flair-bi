(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller(
            "VisualmetadataDialogController",
            VisualmetadataDialogController
        );

    VisualmetadataDialogController.$inject = [
        "$timeout",
        "$scope",
        "$stateParams",
        "$uibModalInstance",
        "entity",
        "Visualmetadata",
        "Visualizations",
        "Views"
    ];

    function VisualmetadataDialogController(
        $timeout,
        $scope,
        $stateParams,
        $uibModalInstance,
        entity,
        Visualmetadata,
        Visualizations,
        Views
    ) {
        var vm = this;

        vm.visualmetadata = entity;
        vm.clear = clear;
        vm.save = save;
        vm.visualizations = Visualizations.query();
        vm.views = Views.query();

        $timeout(function() {
            angular.element(".form-group:eq(1)>input").focus();
        });

        function clear() {
            $uibModalInstance.dismiss("cancel");
        }

        function save() {
            vm.isSaving = true;
            if (vm.visualmetadata.id !== null) {
                Visualmetadata.update(
                    vm.visualmetadata,
                    onSaveSuccess,
                    onSaveError
                );
            } else {
                Visualmetadata.save(
                    vm.visualmetadata,
                    onSaveSuccess,
                    onSaveError
                );
            }
        }

        function onSaveSuccess(result) {
            $scope.$emit("flairbiApp:visualmetadataUpdate", result);
            $uibModalInstance.close(result);
            vm.isSaving = false;
        }

        function onSaveError() {
            vm.isSaving = false;
        }
    }
})();

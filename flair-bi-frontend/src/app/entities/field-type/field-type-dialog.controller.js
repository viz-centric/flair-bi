(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller("FieldTypeDialogController", FieldTypeDialogController);

    FieldTypeDialogController.$inject = [
        "$scope",
        "fieldTypeEntity",
        "Constraints",
        "FeatureTypes",
        "$uibModalInstance",
        "$stateParams",
        "Visualizations"
    ];

    function FieldTypeDialogController(
        $scope,
        fieldTypeEntity,
        Constraints,
        FeatureTypes,
        $uibModalInstance,
        $stateParams,
        Visualizations
    ) {
        var vm = this;

        vm.clear = clear;
        vm.save = save;
        activate();

        ////////////////

        function activate() {
            vm.fieldType = fieldTypeEntity;
            Constraints.query({}, function(result) {
                vm.constraints = result;
                if (!vm.fieldType.constraint) {
                    vm.fieldType.constraint = vm.constraints[0];
                }
            });
            FeatureTypes.query({}, function(result) {
                vm.featureTypes = result;
                if (!vm.fieldType.featureType) {
                    vm.fieldType.featureType = vm.featureTypes[0];
                }
            });
        }

        function clear() {
            $uibModalInstance.dismiss("cancel");
        }

        function onSaveSuccess(result) {
            $uibModalInstance.close(result);
            vm.isSaving = false;
        }

        function onSaveError() {
            vm.isSaving = false;
        }

        function save() {
            vm.isSaving = true;
            Visualizations.saveFieldType(
                {
                    id: $stateParams.id
                },
                vm.fieldType,
                onSaveSuccess,
                onSaveError
            );
        }
    }
})();

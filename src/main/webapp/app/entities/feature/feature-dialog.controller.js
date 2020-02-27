(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller("FeatureDialogController", FeatureDialogController);

    FeatureDialogController.$inject = [
        "$scope",
        "entity",
        "$uibModalInstance",
        "Features",
        "FeatureTypes",
        "Functions"
    ];

    function FeatureDialogController(
        $scope,
        entity,
        $uibModalInstance,
        Features,
        FeatureTypes,
        Functions
    ) {
        var vm = this;

        activate();

        vm.feature = entity;
        vm.save = save;
        vm.clear = clear;
        vm.featureTypes = FeatureTypes.query();
        vm.functions= Functions.query();
        vm.copyFunctions=copyFunctions;
        ////////////////

        function activate() {}

        function clear() {
            $uibModalInstance.dismiss("cancel");
        }

        function save() {
            vm.isSaving = true;
            if (vm.feature.id) {
                Features.update(vm.feature, onSaveSuccess, onSaveError);
            } else {
                Features.save(vm.feature, onSaveSuccess, onSaveError);
            }
        }

        function onSaveSuccess(result) {
            $scope.$emit("flairbiApp:featureUpdate", result);
            $uibModalInstance.close(result);
            vm.isSaving = false;
        }

        function onSaveError(data) {
            vm.isSaving = false;
        }

        function copyFunctions(func){
            vm.feature.definition = func.value;
            vm.feature.functionId = func.id;
        }
    }
})();

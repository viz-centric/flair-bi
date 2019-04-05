(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller(
            "FieldTypeDeleteDialogController",
            FieldTypeDeleteDialogController
        );

    FieldTypeDeleteDialogController.$inject = [
        "$scope",
        "Visualizations",
        "$stateParams",
        "$uibModalInstance"
    ];

    function FieldTypeDeleteDialogController(
        $scope,
        Visualizations,
        $stateParams,
        $uibModalInstance
    ) {
        var vm = this;

        vm.fieldType = {};
        vm.clear = clear;
        vm.confirmDelete = confirmDelete;
        activate();
        ////////////////

        function activate() {
            return Visualizations.getFieldType(
                {
                    id: $stateParams.id,
                    fieldTypeId: $stateParams.fieldTypeId
                },
                function(result) {
                    vm.fieldType = result;
                }
            );
        }

        function clear() {
            $uibModalInstance.dismiss("cancel");
        }

        function confirmDelete(id) {
            Visualizations.deleteFieldType(
                {
                    id: $stateParams.id,
                    fieldTypeId: id
                },
                function() {
                    $uibModalInstance.close(true);
                }
            );
        }
    }
})();

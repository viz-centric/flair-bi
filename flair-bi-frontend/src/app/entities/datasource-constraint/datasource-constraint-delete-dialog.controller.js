(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller(
            "DatasourceConstraintDeleteController",
            DatasourceConstraintDeleteController
        );

    DatasourceConstraintDeleteController.$inject = [
        "$uibModalInstance",
        "entity",
        "DatasourceConstraint"
    ];

    function DatasourceConstraintDeleteController(
        $uibModalInstance,
        entity,
        DatasourceConstraint
    ) {
        var vm = this;

        vm.datasourceConstraint = entity;
        vm.clear = clear;
        vm.confirmDelete = confirmDelete;

        function clear() {
            $uibModalInstance.dismiss("cancel");
        }

        function confirmDelete(id) {
            DatasourceConstraint.delete({ id: id }, function() {
                $uibModalInstance.close(true);
            });
        }
    }
})();

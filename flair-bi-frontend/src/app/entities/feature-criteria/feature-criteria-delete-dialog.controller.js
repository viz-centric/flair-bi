(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller(
            "FeatureCriteriaDeleteController",
            FeatureCriteriaDeleteController
        );

    FeatureCriteriaDeleteController.$inject = [
        "$uibModalInstance",
        "entity",
        "FeatureCriteria"
    ];

    function FeatureCriteriaDeleteController(
        $uibModalInstance,
        entity,
        FeatureCriteria
    ) {
        var vm = this;

        vm.featureCriteria = entity;
        vm.clear = clear;
        vm.confirmDelete = confirmDelete;

        function clear() {
            $uibModalInstance.dismiss("cancel");
        }

        function confirmDelete(id) {
            FeatureCriteria.delete({ id: id }, function() {
                $uibModalInstance.close(true);
            });
        }
    }
})();

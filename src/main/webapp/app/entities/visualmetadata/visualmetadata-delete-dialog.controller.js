(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller(
            "VisualmetadataDeleteController",
            VisualmetadataDeleteController
        );

    VisualmetadataDeleteController.$inject = [
        "$uibModalInstance",
        "entity",
        "Visualmetadata"
    ];

    function VisualmetadataDeleteController(
        $uibModalInstance,
        entity,
        Visualmetadata
    ) {
        var vm = this;

        vm.visualmetadata = entity;
        vm.clear = clear;
        vm.confirmDelete = confirmDelete;

        function clear() {
            $uibModalInstance.dismiss("cancel");
        }

        function confirmDelete(id) {
            Visualmetadata.delete({ id: id }, function() {
                $uibModalInstance.close(true);
            });
        }
    }
})();

(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller(
            "FeatureBookmarkDeleteController",
            FeatureBookmarkDeleteController
        );

    FeatureBookmarkDeleteController.$inject = [
        "$uibModalInstance",
        "entity",
        "FeatureBookmark"
    ];

    function FeatureBookmarkDeleteController(
        $uibModalInstance,
        entity,
        FeatureBookmark
    ) {
        var vm = this;

        vm.featureBookmark = entity;
        vm.clear = clear;
        vm.confirmDelete = confirmDelete;

        function clear() {
            $uibModalInstance.dismiss("cancel");
        }

        function confirmDelete(id) {
            FeatureBookmark.delete({ id: id }, function() {
                $uibModalInstance.close(true);
            });
        }
    }
})();

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
        "FeatureBookmark",
        "$translate",
        "$rootScope"
    ];

    function FeatureBookmarkDeleteController(
        $uibModalInstance,
        entity,
        FeatureBookmark,
        $translate,
        $rootScope
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
                $uibModalInstance.close(true);
                var info = {text:$translate.instant('flairbiApp.featureBookmark.deleted',{param:id}),title: "Deleted"}
                $rootScope.showSuccessToast(info);
            },function(){
                $rootScope.showErrorSingleToast({
                    text: $translate.instant('flairbiApp.featureBookmark.errorDeleting')
                });
            });
        }
    }
})();

(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller(
            "FeatureBookmarkDialogController",
            FeatureBookmarkDialogController
        );

    FeatureBookmarkDialogController.$inject = [
        "$timeout",
        "$scope",
        "$stateParams",
        "$uibModalInstance",
        "entity",
        "FeatureBookmark",
        "FeatureCriteria",
        "User",
        "Datasources"
    ];

    function FeatureBookmarkDialogController(
        $timeout,
        $scope,
        $stateParams,
        $uibModalInstance,
        entity,
        FeatureBookmark,
        FeatureCriteria,
        User,
        Datasources
    ) {
        var vm = this;

        vm.featureBookmark = entity;
        vm.clear = clear;
        vm.save = save;
        //vm.featurecriteria = FeatureCriteria.query();
        //vm.users = User.query();
        //vm.datasources = Datasources.query();

        $timeout(function() {
            angular.element(".form-group:eq(1)>input").focus();
        });

        function clear() {
            $uibModalInstance.dismiss("cancel");
        }

        function save() {
            vm.isSaving = true;
            if (vm.featureBookmark.id !== null) {
                FeatureBookmark.update(
                    vm.featureBookmark,
                    onSaveSuccess,
                    onSaveError
                );
            } else {
                FeatureBookmark.save(
                    vm.featureBookmark,
                    onSaveSuccess,
                    onSaveError
                );
            }
        }

        function onSaveSuccess(result) {
            $scope.$emit("flairbiApp:featureBookmarkUpdate", result);
            $uibModalInstance.close(result);
            vm.isSaving = false;
        }

        function onSaveError() {
            vm.isSaving = false;
        }
    }
})();

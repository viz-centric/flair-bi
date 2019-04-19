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
        "Datasources",
        "$translate",
        "$rootScope"
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
        Datasources,
        $translate,
        $rootScope
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
                    onUpdateSuccess,
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
            onSave(result);
            var info = {text:$translate.instant('flairbiApp.featureBookmark.created',{param:result.id}),title: "Saved"}
            $rootScope.showSuccessToast(info);
        }

        function onUpdateSuccess(result) {
            onSave(result);
            var info = {text:$translate.instant('flairbiApp.featureBookmark.updated',{param:result.id}),title: "Updated"}
            $rootScope.showSuccessToast(info);
        }

        function onSave(result){
            $scope.$emit("flairbiApp:featureBookmarkUpdate", result);
            $uibModalInstance.close(result);
            vm.isSaving = false;
        }

        function onSaveError() {
            vm.isSaving = false;
            $rootScope.showErrorSingleToast({
                text: $translate.instant('flairbiApp.featureBookmark.errorSaving')
            });
        }
    }
})();

(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller("ViewsDialogController", ViewsDialogController);

    ViewsDialogController.$inject = [
        "$timeout",
        "$scope",
        "$stateParams",
        "$uibModalInstance",
        "$state",
        "DataUtils",
        "entity",
        "Views",
        "Dashboards",
        "$window",
        "viewReleases",
        "Principal",
        "$translate",
        "$rootScope"
    ];

    function ViewsDialogController(
        $timeout,
        $scope,
        $stateParams,
        $uibModalInstance,
        $state,
        DataUtils,
        entity,
        Views,
        Dashboards,
        $window,
        viewReleases,
        Principal,
        $translate,
        $rootScope
    ) {
        var vm = this;

        vm.views = entity;
        vm.clear = clear;
        vm.byteSize = DataUtils.byteSize;
        vm.openFile = DataUtils.openFile;
        vm.save = save;
        vm.dashboards = Dashboards.query();
        vm.releases = viewReleases;

        // TODO plz pass this through the resolve instead of like this
        // When you do it like this code depends on the URL
        vm.dialogMode =
            $state.current.url.includes("edit") == true
                ? "Edit View"
                : "Create View";

        $timeout(function() {
            angular.element(".form-group:eq(1)>input").focus();
        });

        function clear() {
            $uibModalInstance.dismiss("cancel");
            $window.history.back();
        }

        function save() {
            vm.isSaving = true;
            if (vm.views.id !== null) {
                Views.update(vm.views, onUpdateSuccess, onSaveError);
            } else {
                Views.save(vm.views, onSaveSuccess, onSaveError);
            }
        }

        function onSaveSuccess(result) {
            onSave(result);
            var info = {text:$translate.instant('flairbiApp.views.created',{param:result.id}),title: "Saved"}
            $rootScope.showSuccessToast(info);
        }

        function onUpdateSuccess(result) {
            onSave(result);
            var info = {text:$translate.instant('flairbiApp.views.updated',{param:result.id}),title: "Updated"}
            $rootScope.showSuccessToast(info);
        }

        function onSave(result){
            $scope.$emit("flairbiApp:viewsUpdate", result);
            $uibModalInstance.close(result);
            vm.isSaving = false;
            Principal.identity(true);    
        }

        function onSaveError() {
            vm.isSaving = false;
            $rootScope.showErrorSingleToast({
                text: $translate.instant('flairbiApp.views.errorSaving')
            });
        }

        $scope.moveToOverview = function(info) {
            $window.history.back();
        };

        vm.setImage = function($file, views) {
            if ($file && $file.$error === "pattern") {
                return;
            }
            if ($file) {
                DataUtils.toBase64($file, function(base64Data) {
                    $scope.$apply(function() {
                        views.image = base64Data;
                        views.imageLocation = null;
                        views.imageContentType = $file.type.substring($file.type.lastIndexOf("/") + 1, $file.type.length);
                        //views.imageContentType = $file.type;
                    });
                });
            }
        };
    }
})();

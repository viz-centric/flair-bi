import * as angular from 'angular';
"use strict";

angular
    .module("flairbiApp")
    .controller("UserGroupDialogController", UserGroupDialogController);

UserGroupDialogController.$inject = [
    "$scope",
    "entity",
    "$uibModalInstance",
    "UserGroup",
    "$translate",
    "$rootScope"
];

function UserGroupDialogController(
    $scope,
    entity,
    $uibModalInstance,
    UserGroup,
    $translate,
    $rootScope
) {
    var vm = this;

    vm.userGroup = entity;
    vm.save = save;
    vm.clear = clear;

    activate();

    ////////////////

    function activate() {}

    function save() {
        vm.isSaving = true;
        UserGroup.save(vm.userGroup, onSaveSuccess, onSaveError);
    }

    function clear() {
        $uibModalInstance.dismiss("cancel");
    }

    function onSaveSuccess(result) {
        $scope.$emit("flairbiApp:userGroupUpdate", result);
        $uibModalInstance.close(result);
        vm.isSaving = false;
        var info = {text:$translate.instant('userGroups.created',{param:result.name}),title: "Created"}
        $rootScope.showSuccessToast(info);
    }

    function onSaveError() {
        vm.isSaving = false;
        $rootScope.showErrorSingleToast({
            text: $translate.instant('userGroups.errorSaving')
        });
    }
}

(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller("UserGroupDialogController", UserGroupDialogController);

    UserGroupDialogController.$inject = [
        "$scope",
        "entity",
        "$uibModalInstance",
        "UserGroup"
    ];

    function UserGroupDialogController(
        $scope,
        entity,
        $uibModalInstance,
        UserGroup
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
        }

        function onSaveError() {
            vm.isSaving = false;
        }
    }
})();

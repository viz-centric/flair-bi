(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller("UserGroupDeleteController", UserGroupDeleteController);

    UserGroupDeleteController.$inject = [
        "$uibModalInstance",
        "entity",
        "UserGroup",
        "$scope",
        "$localStorage",
        "$translate",
        "$rootScope"
    ];

    function UserGroupDeleteController(
        $uibModalInstance,
        entity,
        UserGroup,
        $scope,
        $localStorage,
        $translate,
        $rootScope
    ) {
        var vm = this;

        vm.userGroup = entity;
        vm.clear = clear;
        vm.confirmDelete = confirmDelete;

        function clear() {
            $uibModalInstance.dismiss("cancel");
        }

        function reset() {
            // when using delete user group o permission management view we need to delete currently selected user/usergroup
            delete $localStorage.selectedEntity;
            $localStorage.areUsersToggled = true;
            $localStorage.areUserGroupsToggled = true;
            delete $localStorage.selected;
        }

        function confirmDelete(name) {
            UserGroup.delete({ name: name }, function() {
                reset();
                $scope.$broadcast("flairbiApp:userGroupDeleted");
                $uibModalInstance.close(true);
                var info = {text:$translate.instant('userGroups.deleted',{param:name}),title: "Deleted"}
                $rootScope.showSuccessToast(info);
            },
            function(){
                $rootScope.showErrorSingleToast({
                    text: $translate.instant('userGroups.errorDeleting')
                });
            });
        }
    }
})();

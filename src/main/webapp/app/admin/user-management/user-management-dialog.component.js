(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('userManagementDialogComponent', {
            templateUrl: 'app/admin/user-management/user-management-dialog.component.html',
            controller: UserManagementDialogController,
            controllerAs: 'vm',
            bindings: {
                resolve: '<',
                close: '&',
                dismiss: '&'
            }
        });

    UserManagementDialogController.$inject = ['User', 'JhiLanguageService', 'UserGroup', '$translate', '$rootScope'
    ];

    function UserManagementDialogController(User, JhiLanguageService, UserGroup, $translate, $rootScope) {
        var vm = this;

        vm.userGroups = [];

        vm.languages = null;
        vm.save = save;

        vm.setActive = setActive;

        vm.$onInit = function () {
            vm.clear = vm.dismiss;
            vm.user = vm.resolve.entity;
            vm.user.activated = vm.user.id ? true : vm.user.activated;
            JhiLanguageService.getAll().then(function (languages) {
                vm.languages = languages;
            });
            UserGroup.getAllUserGroups({}, onUserGroupSuccess);
        }

        function onUserGroupSuccess(data, _) {
            vm.userGroups = data;
        }

        function onSaveSuccess(result) {
            vm.isSaving = false;
            vm.close(result);
            var info = { text: $translate.instant('userManagement.created', { param: vm.user.login }), title: "Saved" }
            $rootScope.showSuccessToast(info);
        }

        function onUpdateSuccess(result) {
            vm.isSaving = false;
            vm.close(result);
            var info = { text: $translate.instant('userManagement.updated', { param: vm.user.id }), title: "Updated" }
            $rootScope.showSuccessToast(info);
        }

        function onSaveError() {
            vm.isSaving = false;
            $rootScope.showErrorSingleToast({
                text: $translate.instant('userManagement.errorSaving')
            });
        }

        function save() {
            vm.isSaving = true;
            if (vm.user.id !== null) {
                User.update(vm.user, onUpdateSuccess, onSaveError);
            } else {
                User.save(vm.user, onSaveSuccess, onSaveError);
            }
        }

        function setActive(isActivated) {
            vm.user.activated = isActivated;
        }
    }
})();

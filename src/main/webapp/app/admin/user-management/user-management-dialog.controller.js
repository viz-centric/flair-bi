(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('UserManagementDialogController', UserManagementDialogController);

    UserManagementDialogController.$inject = ['$stateParams', '$uibModalInstance',
        'entity', 'User', 'JhiLanguageService', 'UserGroup','$translate','$rootScope'
    ];

    function UserManagementDialogController($stateParams, $uibModalInstance,
        entity, User, JhiLanguageService, UserGroup,$translate,$rootScope) {
        var vm = this;

        vm.userGroups = [];
        vm.clear = clear;
        vm.languages = null;
        vm.save = save;
        vm.user = entity;
        vm.user.activated=vm.user.id === null?true:vm.user.activated;
        vm.setActive=setActive;

        JhiLanguageService.getAll().then(function (languages) {
            vm.languages = languages;
        });
        UserGroup.getAllUserGroups({}, onUserGroupSuccess);

        function onUserGroupSuccess(data, headers) {
            vm.userGroups = data;
        }

        function clear() {
            $uibModalInstance.dismiss('cancel');
        }

        function onSaveSuccess(result) {
            vm.isSaving = false;
            $uibModalInstance.close(result);
            var info = {text:$translate.instant('userManagement.created',{param:vm.user.login}),title: "Saved"}
            $rootScope.showSuccessToast(info);
        }

        function onUpdateSuccess(result) {
            vm.isSaving = false;
            $uibModalInstance.close(result);
            var info = {text:$translate.instant('userManagement.updated',{param:vm.user.login}),title: "Updated"}
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

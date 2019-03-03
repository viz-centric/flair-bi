(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('UserManagementDialogController', UserManagementDialogController);

    UserManagementDialogController.$inject = ['$stateParams', '$uibModalInstance',
        'entity', 'User', 'JhiLanguageService', 'UserGroup'
    ];

    function UserManagementDialogController($stateParams, $uibModalInstance,
        entity, User, JhiLanguageService, UserGroup) {
        var vm = this;

        vm.userGroups = [];
        vm.clear = clear;
        vm.languages = null;
        vm.save = save;
        vm.user = entity;

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
        }

        function onSaveError() {
            vm.isSaving = false;
        }

        function save() {
            vm.isSaving = true;
            if (vm.user.id !== null) {
                User.update(vm.user, onSaveSuccess, onSaveError);
            } else {
                User.save(vm.user, onSaveSuccess, onSaveError);
            }
        }
    }
})();

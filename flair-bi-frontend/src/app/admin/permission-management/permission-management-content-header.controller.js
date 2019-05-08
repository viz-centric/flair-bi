import * as angular from 'angular';
import userGroupDialogHtml from './../../entities/user-group/user-group-dialog.html';

'use strict';

angular
    .module('flairbiApp')
    .controller('PermissionManagementContentHeaderController', PermissionManagementContentHeaderController);

PermissionManagementContentHeaderController.$inject = [
    '$rootScope',
    '$uibModal'
];

function PermissionManagementContentHeaderController(
    $rootScope,
    $uibModal
) {
    var vm = this;

    vm.save = save;
    vm.reset = reset;
    vm.newUserGroup = newUserGroup;

    activate();

    ////////////////

    function activate() {
    }

    function save() {
        $rootScope.$broadcast('flairbiApp:savePermissions');
    }

    function reset() {
        $rootScope.$broadcast('flairbiApp:resetPermissionChanges');
    }

    function reloadUserGroups() {
        $rootScope.$broadcast('flairbiApp:reloadUserGroups');
    }

    function newUserGroup() {
        $uibModal.open({
            animation: true,
            template: userGroupDialogHtml,
            size: 'md',
            controller: 'UserGroupDialogController',
            controllerAs: 'vm',
            resolve: {
                entity: function () {
                    return {};
                }

            }
        }).result.then(function () {
            reloadUserGroups();
        }, function () {

        });
    }
}

import * as angular from 'angular';
import permissionManagementContentHeaderHtml from './permission-management-content-header.html';
import permissionManagementHtml from './permission-management.html';
import userGroupDeleteDialog from './../../entities/user-group/user-group-delete-dialog.html';

'use strict';

angular
    .module('flairbiApp')
    .config(stateConfig);

stateConfig.$inject = ['$stateProvider'];

function stateConfig($stateProvider) {
    $stateProvider
        .state('permission-management', {
            parent: 'admin',
            url: '/permission-management?page&sort',
            data: {
                authorities: [],
                pageTitle: 'Users'
            },
            views: {
                'content-header@': {
                    template: permissionManagementContentHeaderHtml,
                    controller: 'PermissionManagementContentHeaderController',
                    controllerAs: 'vm'
                },
                'content@': {
                    template: permissionManagementHtml,
                    controller: 'PermissionManagementController',
                    controllerAs: 'vm'
                }

            },
            params: {
                usersPage: {
                    value: '1',
                    squash: true
                },
                userGroupsPage: {
                    value: '1',
                    squash: true
                },
                dashboardsPage: {
                    value: '1',
                    squash: true
                }
            },
            resolve: {
                pagingParams: ['$stateParams', 'PaginationUtil', function ($stateParams, PaginationUtil) {
                    return {
                        usersPage: PaginationUtil.parsePage($stateParams.usersPage),
                        userGroupsPage: PaginationUtil.parsePage($stateParams.userGroupsPage),
                        dashboardsPage: PaginationUtil.parsePage($stateParams.dashboardsPage),
                    };
                }],
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('userGroups');
                    return $translate.refresh();
                }]
            }
        })
        .state('permission-management.user-group-delete', {
            url: '/userGroup/{name}/delete',
            data: {
                authorities: []
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function ($stateParams, $state, $uibModal) {
                $uibModal.open({
                    template: userGroupDeleteDialog,
                    controller: 'UserGroupDeleteController',
                    controllerAs: 'vm',
                    size: 'md',
                    resolve: {
                        entity: ['UserGroup', function (UserGroup) {
                            return UserGroup.get({
                                name: $stateParams.name
                            });
                        }]
                    }
                }).result.then(function () {
                    $state.go('permission-management', null, {
                        reload: true
                    });
                }, function () {
                    $state.go('^');
                });
            }]
        });
}

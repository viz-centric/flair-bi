(function () {
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
                        templateUrl: 'app/admin/permission-management/permission-management-content-header.html',
                        controller: 'PermissionManagementContentHeaderController',
                        controllerAs: 'vm'
                    },
                    'content@': {
                        templateUrl: 'app/admin/permission-management/permission-management.html',
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
                        return $translate.refresh();
                    }]
                }
            })
            .state('permission-management.user-group-delete', {
                parent: 'permission-management',
                url: '/userGroup/{name}/delete',
                data: {
                    authorities: []
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function ($stateParams, $state, $uibModal) {
                    $uibModal.open({
                        templateUrl: 'app/entities/user-group/user-group-delete-dialog.html',
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
})();

(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider', 'PERMISSIONS'];

    function stateConfig($stateProvider, PERMISSIONS) {
        $stateProvider
            .state('user-management', {
                parent: 'admin',
                url: '/user-management?page&sort',
                data: {
                    authorities: [PERMISSIONS.READ_USER_MANAGEMENT],
                    pageTitle: 'userManagement.home.title',
                    displayName: "User Management"
                },
                views: {
                    'content-header@': {
                        component: 'userManagementContentHeaderComponent'
                    },
                    'content@': {
                        component: 'userManagementComponent'
                    }
                },
                params: {
                    page: {
                        value: '1',
                        squash: true
                    },
                    sort: {
                        value: 'id,asc',
                        squash: true
                    }
                },
                resolve: {
                    pagingParams: ['$stateParams', 'PaginationUtil', function ($stateParams, PaginationUtil) {
                        return {
                            page: PaginationUtil.parsePage($stateParams.page),
                            sort: $stateParams.sort,
                            predicate: PaginationUtil.parsePredicate($stateParams.sort),
                            ascending: PaginationUtil.parseAscending($stateParams.sort)
                        };
                    }],
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('user-management');
                        return $translate.refresh();
                    }]

                }
            })
            .state('user-management-detail', {
                parent: 'admin',
                url: '/user/:login',
                data: {
                    authorities: [PERMISSIONS.READ_USER_MANAGEMENT],
                    pageTitle: 'user-management.detail.title',
                    displayName: "User Management Details"
                },
                views: {
                    'content-header@': {
                        component: 'userManagementDetailContentHeaderComponent'
                    },
                    'content@': {
                        component: 'userManagementDetailComponent'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('user-management');
                        return $translate.refresh();
                    }],
                    //Added resolve to remember current state before moving to new state
                    previousState: ["$state", function ($state) {
                        var currentStateData = {
                            Name: $state.current.name,
                            Params: $state.params,
                            URL: $state.href($state.current.name, $state.params)
                        };
                        return currentStateData;
                    }]
                }
            })
            .state('user-management.new', {
                url: '/new',
                data: {
                    authorities: [PERMISSIONS.WRITE_USER_MANAGEMENT]
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function ($stateParams,$state, $uibModal) {
                    $uibModal.open({
                        component: 'userManagementDialogComponent',
                        backdrop: 'static',
                        size: 'lg',
                        resolve: {
                            entity: function () {
                                return {
                                    id: null,
                                    login: null,
                                    firstName: null,
                                    lastName: null,
                                    email: null,
                                    activated: true,
                                    langKey: null,
                                    createdBy: null,
                                    createdDate: null,
                                    lastModifiedBy: null,
                                    lastModifiedDate: null,
                                    resetDate: null,
                                    resetKey: null,
                                    authorities: null
                                };
                            }
                        }
                    }).result.then(function () {
                        $state.go('user-management', null, {
                            reload: true
                        });
                    }, function () {
                        $state.go('user-management');
                    });
                }]
            })
            .state('user-management.edit', {
                url: '/{login}/edit',
                data: {
                    authorities: [PERMISSIONS.UPDATE_USER_MANAGEMENT]
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function ($stateParams, $state, $uibModal) {
                    $uibModal.open({
                        component: 'userManagementDialogComponent',
                        backdrop: 'static',
                        size: 'lg',
                        resolve: {
                            entity: ['User', function (User) {
                                return User.get({
                                    login: $stateParams.login
                                });
                            }]
                        }
                    }).result.then(function () {
                        $state.go('user-management', null, {
                            reload: true
                        });
                    }, function () {
                        $state.go('^');
                    });
                }]
            })
            .state('user-management.delete', {
                url: '/{login}/delete',
                data: {
                    authorities: [PERMISSIONS.DELETE_USER_MANAGEMENT]
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function ($stateParams, $state, $uibModal) {
                    $uibModal.open({
                        component: 'userManagementDeleteComponent',
                        size: 'md',
                        resolve: {
                            entity: ['User', function (User) {
                                return User.get({
                                    login: $stateParams.login
                                });
                            }]
                        }
                    }).result.then(function () {
                        $state.go('user-management', null, {
                            reload: true
                        });
                    }, function () {
                        $state.go('^');
                    });
                }]
            });
    }
})();

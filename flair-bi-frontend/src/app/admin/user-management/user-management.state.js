import * as angular from 'angular';
import userManagementContentHeaderHtml from './user-management-content-header.html';
import userManagementHtml from './user-management.html';
import userManagementPropertiesContentHeader from './user-management-properties-content-header.html';
import userManagementDetailHtml from './user-management-detail.html';
import datasourceConstraintDialogHtml from './../../entities/datasource-constraint/datasource-constraint-dialog.html';
import datasourceConstraintDeleteDialogHtml
    from './../../entities/datasource-constraint/datasource-constraint-delete-dialog.html';
import userManagementDialogHtml from './user-management-dialog.html';
import userManagementDeleteDialogHtml from './user-management-delete-dialog.html';
import 'use strict';

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
                pageTitle: 'userManagement.home.title'
            },
            views: {
                'content-header@': {
                    template: userManagementContentHeaderHtml,
                    controller: 'UserManagementController',
                    controllerAs: 'vm'
                },
                'content@': {
                    template: userManagementHtml,
                    controller: 'UserManagementController',
                    controllerAs: 'vm'
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
                pageTitle: 'user-management.detail.title'
            },
            views: {
                'content-header@': {
                    template: userManagementPropertiesContentHeader,
                    controller: 'UserManagementDetailController',
                    controllerAs: 'vm'
                },
                'content@': {
                    template: userManagementDetailHtml,
                    controller: 'UserManagementDetailController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('user-management');
                    return $translate.refresh();
                }],
                //Added resolve to remember current state before moving to new state
                PreviousState: ["$state", function ($state) {
                    var currentStateData = {
                        Name: $state.current.name,
                        Params: $state.params,
                        URL: $state.href($state.current.name, $state.params)
                    };
                    return currentStateData;
                }]
            }
        })
        .state('newConstraint', {
            parent: 'user-management-detail',
            url: '/newConstraint',
            data: {
                authorities: [PERMISSIONS.WRITE_USER_MANAGEMENT],
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function ($stateParams, $state, $uibModal) {
                $uibModal.open({
                    template: datasourceConstraintDialogHtml,
                    controller: 'DatasourceConstraintDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: function () {
                            return {
                                constraintDefinition: {
                                    featureConstraints: [{}]
                                },
                                id: null
                            };
                        }
                    }
                }).result.then(function () {
                    $state.go('^', null, {
                        reload: true
                    });
                }, function () {
                    $state.go('^');
                });
            }],
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('datasourceConstraint');
                    return $translate.refresh();
                }]
            }
        })
        .state('editConstraint', {
            parent: 'user-management-detail',
            url: '/editConstraint/:constraintId',
            data: {
                authorities: [PERMISSIONS.UPDATE_USER_MANAGEMENT],
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function ($stateParams, $state, $uibModal) {
                $uibModal.open({
                    template: datasourceConstraintDialogHtml,
                    controller: 'DatasourceConstraintDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: ['DatasourceConstraint', function (DatasourceConstraint) {
                            return DatasourceConstraint.get({
                                id: $stateParams.constraintId
                            }).$promise;
                        }]
                    }
                }).result.then(function () {
                    $state.go('^', null, {
                        reload: true
                    });
                }, function () {
                    $state.go('^');
                });
            }],
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('datasourceConstraint');
                    return $translate.refresh();
                }]
            }
        })
        .state('user-management-detail.deleteConstraint', {
            url: '/deleteConstraint/:constraintId',
            data: {
                authorities: [PERMISSIONS.DELETE_USER_MANAGEMENT],
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function ($stateParams, $state, $uibModal) {
                $uibModal.open({
                    template: datasourceConstraintDeleteDialogHtml,
                    controller: 'DatasourceConstraintDeleteController',
                    controllerAs: 'vm',
                    size: 'md',
                    resolve: {
                        entity: ['DatasourceConstraint', function (DatasourceConstraint) {
                            return DatasourceConstraint.get({
                                id: $stateParams.constraintId
                            }).$promise;
                        }]
                    }
                }).result.then(function () {
                    $state.go('^', null, {
                        reload: true
                    });
                }, function () {
                    $state.go('^');
                });
            }],
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('datasourceConstraint');
                    return $translate.refresh();
                }]
            }
        })
        .state('user-management.new', {
            url: '/new',
            data: {
                authorities: [PERMISSIONS.WRITE_USER_MANAGEMENT]
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function ($stateParams, $state, $uibModal) {
                $uibModal.open({
                    template: userManagementDialogHtml,
                    controller: 'UserManagementDialogController',
                    controllerAs: 'vm',
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
                    template: userManagementDialogHtml,
                    controller: 'UserManagementDialogController',
                    controllerAs: 'vm',
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
                    template: userManagementDeleteDialogHtml,
                    controller: 'UserManagementDeleteController',
                    controllerAs: 'vm',
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

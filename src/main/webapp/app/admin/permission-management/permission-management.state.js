(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider','PERMISSIONS'];

    function stateConfig($stateProvider,PERMISSIONS) {
        $stateProvider
            .state('permission-management', {
                parent: 'admin',
                url: '/permission-management?page&sort',
                data: {
                    authorities: [],
                    pageTitle: 'Users',
                    displayName: "Permission Management"
                },
                views: {
                    'content-header@': {
                        component: 'permissionManagementContentHeaderComponent'
                    },
                    'content@': {
                        component: 'permissionManagementComponent'
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
            })
            .state('datasource-constraints', {
                parent: 'permission-management',
                url: '/datasource-constraints/:login',
                data: {
                    authorities: [PERMISSIONS.READ_USER_MANAGEMENT],
                    pageTitle: "flairbiApp.datasourceConstraint.home.title",
                    displayName: "Datasource constraints"
                },
                views: {
                    "content-header@": {
                        templateUrl:
                            "app/entities/datasource-constraint/datasource-constraint-header.html",
                        controller: "DatasourceConstraintHeaderController",
                        controllerAs: "vm"
                    },
                    "content@": {
                        templateUrl:
                            "app/entities/datasource-constraint/datasource-constraints.html",
                        controller: "DatasourceConstraintController",
                        controllerAs: "vm"
                    }
                },
                resolve: {
                    translatePartialLoader: [
                        "$translate",
                        "$translatePartialLoader",
                        function ($translate, $translatePartialLoader) {
                            $translatePartialLoader.addPart(
                                "datasourceConstraint"
                            );
                            $translatePartialLoader.addPart("global");
                            return $translate.refresh();
                        }
                    ]
                }
            })
            .state("datasource-constraints-detail", {
                parent: "datasource-constraints",
                url: "/{id}",
                data: {
                    authorities: [PERMISSIONS.READ_USER_MANAGEMENT],
                    pageTitle: "flairbiApp.datasourceConstraint.detail.title",
                    displayName: "Datasource constraint detail"
                },
                views: {
                    "content-header@": {
                        templateUrl:
                            "app/entities/datasource-constraint/datasource-constraint-header.html",
                        controller: "DatasourceConstraintHeaderController",
                        controllerAs: "vm"
                    },
                    "content@": {
                        templateUrl:
                            "app/entities/datasource-constraint/datasource-constraint-detail.html",
                        controller: "DatasourceConstraintDetailController",
                        controllerAs: "vm"
                    }
                },
                resolve: {
                    translatePartialLoader: [
                        "$translate",
                        "$translatePartialLoader",
                        function ($translate, $translatePartialLoader) {
                            $translatePartialLoader.addPart(
                                "datasourceConstraint"
                            );
                            return $translate.refresh();
                        }
                    ],
                    entity: [
                        "$stateParams",
                        "DatasourceConstraint",
                        function ($stateParams, DatasourceConstraint) {
                            return DatasourceConstraint.get({
                                id: $stateParams.id
                            }).$promise;
                        }
                    ],
                    previousState: [
                        "$state",
                        function ($state) {
                            var currentStateData = {
                                name:
                                    $state.current.name ||
                                    "datasource-constraint",
                                params: $state.params,
                                url: $state.href(
                                    $state.current.name,
                                    $state.params
                                )
                            };
                            return currentStateData;
                        }
                    ]
                }
            })
            .state('datasource-constraints-new', {
                parent: 'datasource-constraints',
                url: '/new',
                data: {
                    authorities: [PERMISSIONS.WRITE_USER_MANAGEMENT],
                    displayName: "New datasource constraint"
                },
                views: {
                    "content-header@": {
                        templateUrl:
                            "app/entities/datasource-constraint/datasource-constraint-header.html",
                        controller: "DatasourceConstraintHeaderController",
                        controllerAs: "vm"
                    },
                    "content@": {
                        component: "datasourceConstraintDialogComponent",
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('datasourceConstraint');
                        return $translate.refresh();
                    }]
                }
            })
            .state('datasource-constraints-edit', {
                parent: 'datasource-constraints',
                url: '/edit/{id}',
                data: {
                    authorities: [PERMISSIONS.UPDATE_USER_MANAGEMENT],
                    displayName: "Update datasource constraint"
                },
                views: {
                    "content-header@": {
                        templateUrl:
                            "app/entities/datasource-constraint/datasource-constraint-header.html",
                        controller: "DatasourceConstraintHeaderController",
                        controllerAs: "vm"
                    },
                    "content@": {
                        component: "datasourceConstraintDialogComponent",
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('datasourceConstraint');
                        return $translate.refresh();
                    }]
                }
            })
            .state('datasource-constraints-delete', {
                parent: 'datasource-constraints',
                url: '/delete/:constraintId',
                data: {
                    authorities: [PERMISSIONS.DELETE_USER_MANAGEMENT],
                    displayName: "Datasource constraints"
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function ($stateParams, $state, $uibModal) {
                    $uibModal.open({
                        templateUrl: 'app/entities/datasource-constraint/datasource-constraint-delete-dialog.html',
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
            });
    }
})();

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
            .state('datasource-group-constraints', {
                parent: 'permission-management',
                url: '/datasource-group-constraints/:group',
                data: {
                    authorities: [PERMISSIONS.READ_USER_MANAGEMENT],
                    pageTitle: "flairbiApp.datasourceGroupConstraint.home.title",
                    displayName: "Datasource Group Constraints"
                },
                views: {
                    "content-header@": {
                        templateUrl:
                            "app/entities/datasource-group-constraint/datasource-constraint-header.html",
                        controller: "DatasourceGroupConstraintHeaderController",
                        controllerAs: "vm"
                    },
                    "content@": {
                        templateUrl:
                            "app/entities/datasource-group-constraint/datasource-group-constraints.html",
                        controller: "DatasourceGroupConstraintController",
                        controllerAs: "vm"
                    }
                },
                resolve: {
                    translatePartialLoader: [
                        "$translate",
                        "$translatePartialLoader",
                        function ($translate, $translatePartialLoader) {
                            $translatePartialLoader.addPart(
                                "datasourceGroupConstraint"
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
            .state("datasource-group-constraints-detail", {
                parent: "datasource-group-constraints",
                url: "/{id}",
                data: {
                    authorities: [PERMISSIONS.READ_USER_MANAGEMENT],
                    pageTitle: "flairbiApp.datasourceGroupConstraint.detail.title",
                    displayName: "Datasource group constraint detail"
                },
                views: {
                    "content-header@": {
                        templateUrl:
                            "app/entities/datasource-group-constraint/datasource-constraint-header.html",
                        controller: "DatasourceGroupConstraintHeaderController",
                        controllerAs: "vm"
                    },
                    "content@": {
                        templateUrl:
                            "app/entities/datasource-group-constraint/datasource-constraint-detail.html",
                        controller: "DatasourceGroupConstraintDetailController",
                        controllerAs: "vm"
                    }
                },
                resolve: {
                    translatePartialLoader: [
                        "$translate",
                        "$translatePartialLoader",
                        function ($translate, $translatePartialLoader) {
                            $translatePartialLoader.addPart(
                                "datasourceGroupConstraint"
                            );
                            return $translate.refresh();
                        }
                    ],
                    entity: [
                        "$stateParams",
                        "DatasourceGroupConstraint",
                        function ($stateParams, DatasourceGroupConstraint) {
                            return DatasourceGroupConstraint.get({
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
                                    "datasource-group-constraint",
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
            .state('datasource-group-constraints-new', {
                parent: 'datasource-group-constraints',
                url: '/new',
                data: {
                    authorities: [PERMISSIONS.WRITE_USER_MANAGEMENT],
                    displayName: "New datasource group constraint"
                },
                views: {
                    "content-header@": {
                        templateUrl:
                            "app/entities/datasource-group-constraint/datasource-constraint-header.html",
                        controller: "DatasourceGroupConstraintHeaderController",
                        controllerAs: "vm"
                    },
                    "content@": {
                        component: "datasourceGroupConstraintDialogComponent",
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('datasourceGroupConstraint');
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
            .state('datasource-group-constraints-edit', {
                parent: 'datasource-group-constraints',
                url: '/edit/{id}',
                data: {
                    authorities: [PERMISSIONS.UPDATE_USER_MANAGEMENT],
                    displayName: "Update datasource group constraint"
                },
                views: {
                    "content-header@": {
                        templateUrl:
                            "app/entities/datasource-group-constraint/datasource-constraint-header.html",
                        controller: "DatasourceGroupConstraintHeaderController",
                        controllerAs: "vm"
                    },
                    "content@": {
                        component: "datasourceGroupConstraintDialogComponent",
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('datasourceGroupConstraint');
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

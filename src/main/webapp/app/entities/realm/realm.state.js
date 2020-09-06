(function() {
    'use strict';

    angular
        .module('flairbiApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider
        .state('realm', {
            parent: 'entity',
            url: '/realm?page&sort&search',
            data: {
                authorities: [],
                pageTitle: 'flairbiApp.realm.home.title',
                displayName: 'Realm'

            },
            views: {
                'content@': {
                    templateUrl: 'app/entities/realm/realms.html',
                    controller: 'RealmController',
                    controllerAs: 'vm'
                },
                "content-header@": {
                    templateUrl:'app/entities/realm/realm-header.html',
                    controller: 'RealmController',
                    controllerAs: 'vm'
                },
            },
            params: {
                page: {
                    value: '1',
                    squash: true
                },
                sort: {
                    value: 'id,asc',
                    squash: true
                },
                search: null
            },
            resolve: {
                pagingParams: ['$stateParams', 'PaginationUtil', function ($stateParams, PaginationUtil) {
                    return {
                        page: PaginationUtil.parsePage($stateParams.page),
                        sort: $stateParams.sort,
                        predicate: PaginationUtil.parsePredicate($stateParams.sort),
                        ascending: PaginationUtil.parseAscending($stateParams.sort),
                        search: $stateParams.search
                    };
                }],
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('realm');
                    $translatePartialLoader.addPart('global');
                    return $translate.refresh();
                }]
            }
        })
        .state('realm-detail', {
            parent: 'realm',
            url: '/detail/{id}',
            data: {
                authorities: [],
                pageTitle: 'flairbiApp.realm.detail.title',
                displayName: "Realm Details"
            },
            views: {
                'content@': {
                    templateUrl: 'app/entities/realm/realm-detail.html',
                    controller: 'RealmDetailController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('realm');
                    return $translate.refresh();
                }],
                entity: ['$stateParams', 'Realm', function($stateParams, Realm) {
                    return Realm.get({id : $stateParams.id}).$promise;
                }],
                previousState: ["$state", function ($state) {
                    var currentStateData = {
                        name: $state.current.name || 'realm',
                        params: $state.params,
                        url: $state.href($state.current.name, $state.params)
                    };
                    return currentStateData;
                }]
            }
        })
        .state('realm-new', {
            parent: 'realm',
            url: '/new',
            data: {
                authorities: []
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/realm/realm-dialog.html',
                    controller: 'RealmDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: function () {
                            return {
                                id: null,
                                name: null
                            };
                        }
                    }
                }).result.then(function() {
                    $state.go('realm', null, { reload: 'realm' });
                }, function() {
                    $state.go('realm');
                });
            }]
        })
        .state('realm-edit', {
            parent: 'realm',
            url: '/{id}/edit',
            data: {
                authorities: []
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/realm/realm-dialog.html',
                    controller: 'RealmDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: ['Realm', function(Realm) {
                            return Realm.get({id : $stateParams.id}).$promise;
                        }]
                    }
                }).result.then(function() {
                    $state.go('realm', null, { reload: 'realm' });
                }, function() {
                    $state.go('^');
                });
            }]
        })
        .state('realm-delete', {
            parent: 'realm',
            url: '/{id}/delete',
            data: {
                authorities: []
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/realm/realm-delete-dialog.html',
                    controller: 'RealmDeleteController',
                    controllerAs: 'vm',
                    size: 'md',
                    resolve: {
                        entity: ['Realm', function(Realm) {
                            return Realm.get({id : $stateParams.id}).$promise;
                        }]
                    }
                }).result.then(function() {
                    $state.go('realm', null, { reload: 'realm' });
                }, function() {
                    $state.go('^');
                });
            }]
        });
    }

})();

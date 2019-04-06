import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .config(stateConfig);

stateConfig.$inject = ['$stateProvider'];

function stateConfig($stateProvider) {
    $stateProvider
        .state('functions', {
            parent: 'entity',
            url: '/functions',
            data: {
                pageTitle: 'flairbiApp.functions.home.title'
            },
            views: {
                'content@': {
                    templateUrl: 'app/entities/functions/functions.html',
                    controller: 'FunctionsController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('functions');
                    $translatePartialLoader.addPart('global');
                    return $translate.refresh();
                }]
            }
        })
        .state('functions-detail', {
            parent: 'entity',
            url: '/functions/{id}',
            data: {
                pageTitle: 'flairbiApp.functions.detail.title'
            },
            views: {
                'content@': {
                    templateUrl: 'app/entities/functions/functions-detail.html',
                    controller: 'FunctionsDetailController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('functions');
                    return $translate.refresh();
                }],
                entity: ['$stateParams', 'Functions', function ($stateParams, Functions) {
                    return Functions.get({ id: $stateParams.id }).$promise;
                }],
                previousState: ["$state", function ($state) {
                    var currentStateData = {
                        name: $state.current.name || 'functions',
                        params: $state.params,
                        url: $state.href($state.current.name, $state.params)
                    };
                    return currentStateData;
                }]
            }
        })
        .state('functions-detail.edit', {
            parent: 'functions-detail',
            url: '/detail/edit',
            data: {
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function ($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/functions/functions-dialog.html',
                    controller: 'FunctionsDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: ['Functions', function (Functions) {
                            return Functions.get({ id: $stateParams.id }).$promise;
                        }]
                    }
                }).result.then(function () {
                    $state.go('^', {}, { reload: false });
                }, function () {
                    $state.go('^');
                });
            }]
        })
        .state('functions.new', {
            parent: 'functions',
            url: '/new',
            data: {
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function ($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/functions/functions-dialog.html',
                    controller: 'FunctionsDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: function () {
                            return {
                                name: null,
                                description: null,
                                value: null,
                                dimensionUse: null,
                                measureUse: null,
                                id: null
                            };
                        }
                    }
                }).result.then(function () {
                    $state.go('functions', null, { reload: 'functions' });
                }, function () {
                    $state.go('functions');
                });
            }]
        })
        .state('functions.edit', {
            parent: 'functions',
            url: '/{id}/edit',
            data: {
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function ($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/functions/functions-dialog.html',
                    controller: 'FunctionsDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: ['Functions', function (Functions) {
                            return Functions.get({ id: $stateParams.id }).$promise;
                        }]
                    }
                }).result.then(function () {
                    $state.go('functions', null, { reload: 'functions' });
                }, function () {
                    $state.go('^');
                });
            }]
        })
        .state('functions.delete', {
            parent: 'functions',
            url: '/{id}/delete',
            data: {
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function ($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/functions/functions-delete-dialog.html',
                    controller: 'FunctionsDeleteController',
                    controllerAs: 'vm',
                    size: 'md',
                    resolve: {
                        entity: ['Functions', function (Functions) {
                            return Functions.get({ id: $stateParams.id }).$promise;
                        }]
                    }
                }).result.then(function () {
                    $state.go('functions', null, { reload: 'functions' });
                }, function () {
                    $state.go('^');
                });
            }]
        });
}
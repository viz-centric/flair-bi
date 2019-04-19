import * as angular from 'angular';

import functionsHtml from './functions.html';
import functionsDetailHtml from './functions-detail.html';
import functionsDialogHtml from './functions-dialog.html';
import functionsDeleteDialogHtml from './functions-delete-dialog.html';

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
                    template: functionsHtml,
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
                    template: functionsDetailHtml,
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
                    return Functions.get({id: $stateParams.id}).$promise;
                }],
                previousState: ["$state", function ($state) {
                    return {
                        name: $state.current.name || 'functions',
                        params: $state.params,
                        url: $state.href($state.current.name, $state.params)
                    };
                }]
            }
        })
        .state('functions-detail.edit', {
            url: '/detail/edit',
            data: {},
            onEnter: ['$stateParams', '$state', '$uibModal', function ($stateParams, $state, $uibModal) {
                $uibModal.open({
                    template: functionsDialogHtml,
                    controller: 'FunctionsDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: ['Functions', function (Functions) {
                            return Functions.get({id: $stateParams.id}).$promise;
                        }]
                    }
                }).result.then(function () {
                    $state.go('^', {}, {reload: false});
                }, function () {
                    $state.go('^');
                });
            }]
        })
        .state('functions.new', {
            url: '/new',
            data: {},
            onEnter: ['$stateParams', '$state', '$uibModal', function ($stateParams, $state, $uibModal) {
                $uibModal.open({
                    template: functionsDialogHtml,
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
                    $state.go('functions', null, {reload: 'functions'});
                }, function () {
                    $state.go('functions');
                });
            }]
        })
        .state('functions.edit', {
            url: '/{id}/edit',
            data: {},
            onEnter: ['$stateParams', '$state', '$uibModal', function ($stateParams, $state, $uibModal) {
                $uibModal.open({
                    template: functionsDialogHtml,
                    controller: 'FunctionsDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: ['Functions', function (Functions) {
                            return Functions.get({id: $stateParams.id}).$promise;
                        }]
                    }
                }).result.then(function () {
                    $state.go('functions', null, {reload: 'functions'});
                }, function () {
                    $state.go('^');
                });
            }]
        })
        .state('functions.delete', {
            url: '/{id}/delete',
            data: {},
            onEnter: ['$stateParams', '$state', '$uibModal', function ($stateParams, $state, $uibModal) {
                $uibModal.open({
                    template: functionsDeleteDialogHtml,
                    controller: 'FunctionsDeleteController',
                    controllerAs: 'vm',
                    size: 'md',
                    resolve: {
                        entity: ['Functions', function (Functions) {
                            return Functions.get({id: $stateParams.id}).$promise;
                        }]
                    }
                }).result.then(function () {
                    $state.go('functions', null, {reload: 'functions'});
                }, function () {
                    $state.go('^');
                });
            }]
        });
}

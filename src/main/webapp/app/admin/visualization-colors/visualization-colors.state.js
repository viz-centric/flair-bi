(function() {
    'use strict';

    angular
        .module('flairbiApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider','PERMISSIONS'];

    function stateConfig($stateProvider,PERMISSIONS) {
        $stateProvider
        .state('visualization-colors', {
            parent: 'admin',
            url: '/visualization-colors',
            data: {
                authorities: [PERMISSIONS.READ_VISUALIZATION_COLORS],
                pageTitle: 'flairbiApp.visualizationColors.home.title'
            },
            views: {
                'content@': {
                    templateUrl: 'app/admin/visualization-colors/visualization-colors.html',
                    controller: 'VisualizationColorsController',
                    controllerAs: 'vm'
                },
                'content-header@': {
                    templateUrl: 'app/admin/visualization-colors/visualization-colors-content-header.html',
                    controller: 'VisualizationColorsController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('visualizationColors');
                    $translatePartialLoader.addPart('global');
                    return $translate.refresh();
                }]
            }
        })
        .state('visualization-colors-detail', {
            parent: 'entity',
            url: '/visualization-colors/{id}',
            data: {
                authorities: [PERMISSIONS.READ_VISUALIZATION_COLORS],
                pageTitle: 'flairbiApp.visualizationColors.detail.title'
            },
            views: {
                'content@': {
                    templateUrl: 'app/admin/visualization-colors/visualization-colors-detail.html',
                    controller: 'VisualizationColorsDetailController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('visualizationColors');
                    return $translate.refresh();
                }],
                entity: ['$stateParams', 'VisualizationColors', function($stateParams, VisualizationColors) {
                    return VisualizationColors.get({id : $stateParams.id}).$promise;
                }],
                previousState: ["$state", function ($state) {
                    var currentStateData = {
                        name: $state.current.name || 'visualization-colors',
                        params: $state.params,
                        url: $state.href($state.current.name, $state.params)
                    };
                    return currentStateData;
                }]
            }
        })
        .state('visualization-colors-detail.edit', {
            parent: 'visualization-colors-detail',
            url: '/detail/edit',
            data: {
                authorities: [PERMISSIONS.UPDATE_VISUALIZATION_COLORS]
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/admin/visualization-colors/visualization-colors-dialog.html',
                    controller: 'VisualizationColorsDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'sm',
                    resolve: {
                        entity: ['VisualizationColors', function(VisualizationColors) {
                            return VisualizationColors.get({id : $stateParams.id}).$promise;
                        }]
                    }
                }).result.then(function() {
                    $state.go('^', {}, { reload: false });
                }, function() {
                    $state.go('^');
                });
            }]
        })
        .state('visualization-colors.new', {
            parent: 'visualization-colors',
            url: '/new',
            data: {
                authorities: [PERMISSIONS.WRITE_VISUALIZATION_COLORS]
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/admin/visualization-colors/visualization-colors-dialog.html',
                    controller: 'VisualizationColorsDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'sm',
                    resolve: {
                        entity: function () {
                            return {
                                code: null,
                                id: null
                            };
                        }
                    }
                }).result.then(function() {
                    $state.go('visualization-colors', null, { reload: 'visualization-colors' });
                }, function() {
                    $state.go('visualization-colors');
                });
            }]
        })
        .state('visualization-colors.edit', {
            parent: 'visualization-colors',
            url: '/{id}/edit',
            data: {
                authorities: [PERMISSIONS.UPDATE_VISUALIZATION_COLORS]
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/admin/visualization-colors/visualization-colors-dialog.html',
                    controller: 'VisualizationColorsDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'sm',
                    resolve: {
                        entity: ['VisualizationColors', function(VisualizationColors) {
                            return VisualizationColors.get({id : $stateParams.id}).$promise;
                        }]
                    }
                }).result.then(function() {
                    $state.go('visualization-colors', null, { reload: 'visualization-colors' });
                }, function() {
                    $state.go('^');
                });
            }]
        })
        .state('visualization-colors.delete', {
            parent: 'visualization-colors',
            url: '/{id}/delete',
            data: {
                authorities: [PERMISSIONS.DELETE_VISUALIZATION_COLORS]
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/admin/visualization-colors/visualization-colors-delete-dialog.html',
                    controller: 'VisualizationColorsDeleteController',
                    controllerAs: 'vm',
                    size: 'md',
                    resolve: {
                        entity: ['VisualizationColors', function(VisualizationColors) {
                            return VisualizationColors.get({id : $stateParams.id}).$promise;
                        }]
                    }
                }).result.then(function() {
                    $state.go('visualization-colors', null, { reload: 'visualization-colors' });
                }, function() {
                    $state.go('^');
                });
            }]
        });
    }

})();

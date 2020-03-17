(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider', 'PERMISSIONS'];

    function stateConfig($stateProvider, PERMISSIONS) {
        $stateProvider.state('jhi-health', {
            parent: 'admin',
            url: '/health',
            data: {
                authorities: [PERMISSIONS.READ_HEALTH_CHECKS],
                pageTitle: 'health.title'
            },
            views: {
                'content-header@': {
                    component: 'healthContentHeaderComponent'
                },
                'content@': {
                    component: 'healthComponent'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('health');
                    return $translate.refresh();
                }]
            }
        });
    }
})();

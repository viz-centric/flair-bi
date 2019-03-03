(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider', 'PERMISSIONS'];

    function stateConfig($stateProvider,PERMISSIONS) {
        $stateProvider.state('jhi-metrics', {
            parent: 'admin',
            url: '/metrics',
            data: {
                authorities: [PERMISSIONS.READ_APPLICATION_METRICS],
                pageTitle: 'metrics.title'
            },
            views: {
                'content-header@': {
                    templateUrl: 'app/admin/metrics/metrics-content-header.html',
                    controller: 'JhiMetricsMonitoringController',
                    controllerAs: 'vm'
                },
                'content@': {
                    templateUrl: 'app/admin/metrics/metrics.html',
                    controller: 'JhiMetricsMonitoringController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('metrics');
                    return $translate.refresh();
                }]
            }
        });
    }
})();

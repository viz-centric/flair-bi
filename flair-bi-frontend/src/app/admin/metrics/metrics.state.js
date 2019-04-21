import * as angular from 'angular';
import metricsContentHeaderHtml from './metrics-content-header.html';
import metricsHtml from './metrics.html';

'use strict';

angular
    .module('flairbiApp')
    .config(stateConfig);

stateConfig.$inject = ['$stateProvider', 'PERMISSIONS'];

function stateConfig($stateProvider, PERMISSIONS) {
    $stateProvider.state('jhi-metrics', {
        parent: 'admin',
        url: '/metrics',
        data: {
            authorities: [PERMISSIONS.READ_APPLICATION_METRICS],
            pageTitle: 'metrics.title'
        },
        views: {
            'content-header@': {
                template: metricsContentHeaderHtml,
                controller: 'JhiMetricsMonitoringController',
                controllerAs: 'vm'
            },
            'content@': {
                template: metricsHtml,
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

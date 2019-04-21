import * as angular from 'angular';
import healthContentHeaderHtml from './health-content-header.html';
import healthHtml from './health.html';
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
                template: healthContentHeaderHtml,
                controller: 'JhiHealthCheckController',
                controllerAs: 'vm'
            },
            'content@': {
                template: healthHtml,
                controller: 'JhiHealthCheckController',
                controllerAs: 'vm'
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

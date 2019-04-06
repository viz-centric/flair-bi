import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .config(stateConfig);

stateConfig.$inject = ['$stateProvider', 'PERMISSIONS'];

function stateConfig($stateProvider, PERMISSIONS) {
    $stateProvider.state('logs', {
        parent: 'admin',
        url: '/logs',
        data: {
            authorities: [PERMISSIONS.READ_LOGS],
            pageTitle: 'logs.title'
        },
        views: {
            'content-header@': {
                templateUrl: 'app/admin/logs/logs-content-header.html',
            },
            'content@': {
                templateUrl: 'app/admin/logs/logs.html',
                controller: 'LogsController',
                controllerAs: 'vm'
            }
        },
        resolve: {
            translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                $translatePartialLoader.addPart('logs');
                return $translate.refresh();
            }]
        }
    });
}
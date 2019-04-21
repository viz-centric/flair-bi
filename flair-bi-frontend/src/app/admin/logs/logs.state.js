import * as angular from 'angular';
import logsContentHeaderHtml from './logs-content-header.html';
import logsHtml from './logs.html';

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
                template: logsContentHeaderHtml,
            },
            'content@': {
                template: logsHtml,
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

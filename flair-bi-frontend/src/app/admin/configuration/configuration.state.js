import * as angular from 'angular';
import configurationContentHeaderHtml from './configuration-content-header.html';
import configurationHtml from './configuration.html';

'use strict';

angular
    .module('flairbiApp')
    .config(stateConfig);

stateConfig.$inject = ['$stateProvider', 'PERMISSIONS'];

function stateConfig($stateProvider, PERMISSIONS) {
    $stateProvider.state('jhi-configuration', {
        parent: 'admin',
        url: '/configuration',
        data: {
            authorities: [PERMISSIONS.READ_CONFIGURATION],
            pageTitle: 'configuration.title'
        },
        views: {
            'content-header@': {
                template: configurationContentHeaderHtml,
                controller: 'JhiConfigurationController',
                controllerAs: 'vm'
            },
            'content@': {
                template: configurationHtml,
                controller: 'JhiConfigurationController',
                controllerAs: 'vm'
            }
        },
        resolve: {
            translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                $translatePartialLoader.addPart('configuration');
                return $translate.refresh();
            }]
        }
    });
}

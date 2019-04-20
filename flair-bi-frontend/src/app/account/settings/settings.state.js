import angular from 'angular';
import settingsContentHeaderHtml from './settings-content-header.html';
import settingsHtml from './settings.html';

'use strict';

angular
    .module('flairbiApp')
    .config(stateConfig);

stateConfig.$inject = ['$stateProvider'];

function stateConfig($stateProvider) {
    $stateProvider.state('settings', {
        parent: 'account',
        url: '/settings',
        data: {
            authorities: [],
            pageTitle: 'global.menu.account.settings'
        },
        views: {
            'content-header@': {
                template: settingsContentHeaderHtml,
                controller: 'SettingsController',
                controllerAs: 'vm'
            },
            'content@': {
                template: settingsHtml,
                controller: 'SettingsController',
                controllerAs: 'vm'
            }
        },
        resolve: {
            translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                $translatePartialLoader.addPart('settings');
                return $translate.refresh();
            }]
        }
    });
}

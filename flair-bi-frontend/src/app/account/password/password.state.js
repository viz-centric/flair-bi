import * as angular from 'angular';
import passwordContentHeaderHtml from './password-content-header.html';
import passwordHtml from './password.html';

'use strict';

angular
    .module('flairbiApp')
    .config(stateConfig);

stateConfig.$inject = ['$stateProvider'];

function stateConfig($stateProvider) {
    $stateProvider.state('password', {
        parent: 'account',
        url: '/password',
        data: {
            authorities: [],
            pageTitle: 'global.menu.account.password'
        },
        views: {
            'content-header@': {
                template: passwordContentHeaderHtml
            },
            'content@': {
                template: passwordHtml,
                controller: 'PasswordController',
                controllerAs: 'vm'
            }
        },
        resolve: {
            translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                $translatePartialLoader.addPart('password');
                return $translate.refresh();
            }]
        }
    });
}

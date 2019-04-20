import * as angular from 'angular';
import sessionsHtml from './sessions.html';

'use strict';

angular
    .module('flairbiApp')
    .config(stateConfig);

stateConfig.$inject = ['$stateProvider'];

function stateConfig($stateProvider) {
    $stateProvider.state('sessions', {
        parent: 'account',
        url: '/sessions',
        data: {
            authorities: [],
            pageTitle: 'global.menu.account.sessions'
        },
        views: {
            'content@': {
                template: sessionsHtml,
                controller: 'SessionsController',
                controllerAs: 'vm'
            }
        },
        resolve: {
            translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                $translatePartialLoader.addPart('sessions');
                return $translate.refresh();
            }]
        }
    });
}

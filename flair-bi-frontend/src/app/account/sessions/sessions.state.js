import * as angular from 'angular';
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
                templateUrl: 'app/account/sessions/sessions.html',
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
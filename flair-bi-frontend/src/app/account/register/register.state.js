import * as angular from 'angular';
import registerHtml from './register.html';

'use strict';

angular
    .module('flairbiApp')
    .config(stateConfig);

stateConfig.$inject = ['$stateProvider'];

function stateConfig($stateProvider) {
    $stateProvider.state('register', {
        parent: 'account',
        url: '/register',
        data: {
            authorities: [],
            pageTitle: 'register.title'
        },
        views: {
            'content@': {
                template: registerHtml,
                controller: 'RegisterController',
                controllerAs: 'vm'
            }
        },
        resolve: {
            translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                $translatePartialLoader.addPart('register');
                return $translate.refresh();
            }]
        }
    });
}

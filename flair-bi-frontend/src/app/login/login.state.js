import * as angular from 'angular';
import login from './login.html';

'use strict';

angular
    .module('flairbiApp')
    .config(stateConfig);

stateConfig.$inject = ['$stateProvider'];

export function stateConfig($stateProvider) {
    $stateProvider
        .state('login', {
            url: '/login',
            views: {
                'content@': {
                    template: login,
                    controller: 'LoginController',
                    controllerAs: 'vm'
                },
                'navbar@': {},
                'topnavbar@': {}
            },
            data: {},
            resolve: {
                authorize: ['Auth',
                    function (Auth) {
                        return Auth.authorize();
                    }
                ],
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('login');
                    $translatePartialLoader.addPart('global');
                    return $translate.refresh();
                }]
            }
        });
}

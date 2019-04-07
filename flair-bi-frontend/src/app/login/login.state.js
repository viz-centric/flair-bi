// import * as angular from 'angular';
// 'use strict';

// angular
//     .module('flairbiApp')
//     .config(stateConfig);

stateConfig.$inject = ['$stateProvider'];

export function stateConfig($stateProvider) {
    $stateProvider
        .state('login', {
            url: '/login',
            views: {
                'content@': {
                    templateUrl: 'app/login/login.html',
                    controller: 'LoginController',
                    controllerAs: 'vm'
                },
                'navbar@': {

                },
                'topnavbar@': {

                }
            },
            data: {

            },
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
// import * as angular from 'angular';
// 'use strict';

// angular
//     .module('flairbiApp')
//     .config(stateConfig);

stateConfig.$inject = ['$stateProvider'];

export function stateConfig($stateProvider) {
    $stateProvider.state('home', {
        parent: 'app',
        url: '/',
        data: {
            authorities: []
        },
        views: {
            'content@': {
                templateUrl: 'app/home/home.html',
                controller: 'HomeController',
                controllerAs: 'vm'
            },
            'topnavbar@': {
                templateUrl: 'app/home/home-topnavbar.html',
                controller: 'HomeTopNavBarController',
                controllerAs: 'vm'
            }
        },
        resolve: {
            mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                $translatePartialLoader.addPart('home');
                return $translate.refresh();
            }]
        }
    });
}
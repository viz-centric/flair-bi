import angular from 'angular';
import home from './home.html';
import homeTopNavbar from './home-topnavbar.html';

'use strict';

angular
    .module('flairbiApp')
    .config(stateConfig);

stateConfig.$inject = ['$stateProvider'];

function stateConfig($stateProvider) {
    $stateProvider.state('home', {
        parent: 'app',
        url: '/',
        data: {
            authorities: []
        },
        views: {
            'content@': {
                template: home,
                controller: 'HomeController',
                controllerAs: 'vm'
            },
            'topnavbar@': {
                template: homeTopNavbar,
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

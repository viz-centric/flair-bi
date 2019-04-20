import * as angular from 'angular';
import activateHtml from './activate.html';

'use strict';

angular
    .module('flairbiApp')
    .config(stateConfig);

stateConfig.$inject = ['$stateProvider'];

function stateConfig($stateProvider) {
    $stateProvider.state('activate', {
        parent: 'account',
        url: '/activate?key',
        data: {
            authorities: [],
            pageTitle: 'activate.title'
        },
        views: {
            'content@': {
                template: activateHtml,
                controller: 'ActivationController',
                controllerAs: 'vm'
            }
        },
        resolve: {
            translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                $translatePartialLoader.addPart('activate');
                return $translate.refresh();
            }]
        }
    });
}


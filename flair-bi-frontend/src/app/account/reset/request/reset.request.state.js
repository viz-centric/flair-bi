import * as angular from 'angular';
import resetRequestHtml from './reset.request.html';

'use strict';

angular
    .module('flairbiApp')
    .config(stateConfig);

stateConfig.$inject = ['$stateProvider'];

function stateConfig($stateProvider) {
    $stateProvider.state('requestReset', {
        parent: 'entity',
        url: '/reset/request',
        data: {
            authorities: []
        },
        views: {
            'content@': {
                template: resetRequestHtml,
                controller: 'RequestResetController',
                controllerAs: 'vm'
            },
            'navbar@': {},
            'topnavbar@': {},
            'footer@': {}
        },
        resolve: {
            translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                $translatePartialLoader.addPart('reset');
                return $translate.refresh();
            }]
        }
    });
}

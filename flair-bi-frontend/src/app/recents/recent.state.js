import * as angular from 'angular';
import recentlyAccessedHtml from './recently-accessed.html';
import recentlyCreatedHtml from './recently-created.html';

'use strict';

angular
    .module('flairbiApp')
    .config(stateConfig);

stateConfig.$inject = ['$stateProvider'];

function stateConfig($stateProvider) {
    $stateProvider.state('recently-accessed', {
        parent: 'app',
        url: '/recently-accessed/{id}',
        views: {
            'content@': {
                template: recentlyAccessedHtml,
                controller: 'recentlyAccessedController',
                controllerAs: 'vm'

            }
        }
    }).state('recently-created', {
        parent: 'app',
        url: '/recently-created/{id}',
        views: {
            'content@': {
                template: recentlyCreatedHtml,
                controller: 'recentlyCreatedController',
                controllerAs: 'vm'

            }
        }
    });
}

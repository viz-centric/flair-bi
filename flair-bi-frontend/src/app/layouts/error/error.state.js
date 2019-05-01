import * as angular from 'angular';
import errorHtml from './error.html';
import accessDeniedHtml from './accessdenied.html';

'use strict';

angular
    .module('flairbiApp')
    .config(stateConfig);

stateConfig.$inject = ['$stateProvider'];

export function stateConfig($stateProvider) {
    $stateProvider
        .state('error', {
            parent: 'app',
            url: '/error',
            data: {
                authorities: [],
                pageTitle: 'error.title'
            },
            views: {
                'content@': {
                    template: errorHtml
                }
            },
            resolve: {
                mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('error');
                    return $translate.refresh();
                }]
            }
        })
        .state('accessdenied', {
            parent: 'app',
            url: '/accessdenied',
            data: {
                authorities: []
            },
            views: {
                'content@': {
                    template: accessDeniedHtml
                }
            },
            resolve: {
                mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('error');
                    return $translate.refresh();
                }]
            }
        });
}

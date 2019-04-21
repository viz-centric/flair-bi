import * as angular from 'angular';
import docsHtml from './docs.html';

'use strict';

angular
    .module('flairbiApp')
    .config(stateConfig);

stateConfig.$inject = ['$stateProvider', 'PERMISSIONS'];

function stateConfig($stateProvider, PERMISSIONS) {
    $stateProvider.state('docs', {
        parent: 'admin',
        url: '/docs',
        data: {
            authorities: [PERMISSIONS.READ_API],
            pageTitle: 'global.menu.admin.apidocs'
        },
        views: {
            'content@': {
                template: docsHtml
            }
        },
        resolve: {
            translatePartialLoader: ['$translate', function ($translate) {
                return $translate.refresh();
            }]
        }
    });
}

import * as angular from 'angular';
import auditsContentHeaderHtml from './audits-content-header.html';
import auditsHtml from './audits.html';
'use strict';

angular
    .module('flairbiApp')
    .config(stateConfig);

stateConfig.$inject = ['$stateProvider', 'PERMISSIONS'];

function stateConfig($stateProvider, PERMISSIONS) {
    $stateProvider.state('audits', {
        parent: 'admin',
        url: '/audits',
        data: {
            authorities: [PERMISSIONS.READ_AUDITS],
            pageTitle: 'audits.title'
        },
        views: {
            'content-header@': {
                template: auditsContentHeaderHtml,
                controller: 'AuditsController',
                controllerAs: 'vm'
            },
            'content@': {
                template: auditsHtml,
                controller: 'AuditsController',
                controllerAs: 'vm'
            }
        },
        resolve: {
            translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                $translatePartialLoader.addPart('audits');
                return $translate.refresh();
            }]
        }
    });
}

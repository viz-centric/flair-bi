import * as angular from 'angular';
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
                templateUrl: 'app/admin/audits/audits-content-header.html',
                controller: 'AuditsController',
                controllerAs: 'vm'
            },
            'content@': {
                templateUrl: 'app/admin/audits/audits.html',
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
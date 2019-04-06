import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .config(stateConfig);

stateConfig.$inject = ['$stateProvider'];

function stateConfig($stateProvider) {
    $stateProvider.state('account', {
        parent: 'app',
        url: '/account',
        views: {
            'content@': {
                templateUrl: 'app/account/account.html',
                controller: 'AccountController',
                controllerAs: 'vm'

            }
        }
    });
}
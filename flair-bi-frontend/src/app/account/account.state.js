import * as angular from 'angular';
import accountHtml from './account.html';

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
                template: accountHtml,
                controller: 'AccountController',
                controllerAs: 'vm'

            }
        }
    });
}

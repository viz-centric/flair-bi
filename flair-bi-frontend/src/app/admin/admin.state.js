import * as angular from 'angular';

import adminHtml from './admin.html';

'use strict';

angular
    .module('flairbiApp')
    .config(stateConfig);

stateConfig.$inject = ['$stateProvider'];

function stateConfig($stateProvider) {
    $stateProvider.state('admin', {
        parent: 'app',
        url: '/administration',
        views: {
            'content@': {
                template: adminHtml,
                controller: 'AdminController',
                controllerAs: 'vm'
            }
        }
    });
}

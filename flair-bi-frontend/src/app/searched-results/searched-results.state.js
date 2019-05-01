import * as angular from 'angular';
import searchedResultHtml from './searched-results.html';
import homeTopnavbarHtml from './../home/home-topnavbar.html';

'use strict';

angular
    .module('flairbiApp')
    .config(stateConfig);

stateConfig.$inject = ['$stateProvider'];

function stateConfig($stateProvider) {
    $stateProvider.state('searched-results', {
        parent: 'app',
        url: '/searched-results/{searchCriteria}',
        views: {
            'content@': {
                template: searchedResultHtml,
                controller: 'SearchedResultsController',
                controllerAs: 'vm'

            },
            'topnavbar@': {
                template: homeTopnavbarHtml,
                controller: 'HomeTopNavBarController',
                controllerAs: 'vm'
            }
        }
    });
}

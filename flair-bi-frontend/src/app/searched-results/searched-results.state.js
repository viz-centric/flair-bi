(function () {
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
                    templateUrl: 'app/searched-results/searched-results.html',
                    controller: 'SearchedResultsController',
                    controllerAs: 'vm'
                   
                },
                'topnavbar@': {
                    templateUrl: 'app/home/home-topnavbar.html',
                    controller: 'HomeTopNavBarController',
                    controllerAs: 'vm'
                }
            }
        });
    }
})();


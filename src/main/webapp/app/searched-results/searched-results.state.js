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
                    component: 'searchedResultsComponent'
                },
                'topnavbar@': {
                    templateUrl: 'app/home/home-topnavbar.html',
                    controller: 'HomeTopNavBarController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('home');
                    $translatePartialLoader.addPart('views');
                    $translatePartialLoader.addPart('dashboards');
                    return $translate.refresh();
                }]
            }
        });
    }
})();


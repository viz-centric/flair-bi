(function () {
    'use strict'; 

    angular
        .module('flairbiApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('recently-accessed', {
            parent: 'app',
            url: '/recently-accessed/{id}',
            views: {
                'content@': {
                    templateUrl: 'app/recents/recently-accessed.html',
                    controller: 'recentlyAccessedController',
                    controllerAs: 'vm'
                   
                }
            }
        }).state('recently-created', {
            parent: 'app',
            url: '/recently-created/{id}',
            views: {
                'content@': {
                    templateUrl: 'app/recents/recently-created.html',
                    controller: 'recentlyCreatedController',
                    controllerAs: 'vm'
                   
                }
            }
        });
    }
})();


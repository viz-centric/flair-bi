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
                    component: 'recentlyAccessedComponent'
                }
            }
        }).state('recently-created', {
            parent: 'app',
            url: '/recently-created/{id}',
            views: {
                'content@': {
                    component: 'recentlyCreatedComponent'
                }
            }
        });
    }
})();


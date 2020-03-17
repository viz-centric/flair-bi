(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider
            .state('error', {
                parent: 'app',
                url: '/error',
                data: {
                    public: true,
                    pageTitle: 'error.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'app/layouts/error/error.html'
                    }
                },
                resolve: {
                    mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('error');
                        return $translate.refresh();
                    }]
                }
            })
            .state('accessdenied', {
                parent: 'app',
                url: '/accessdenied',
                data: {
                    public: true
                },
                views: {
                    'content@': {
                        templateUrl: 'app/layouts/error/accessdenied.html'
                    }
                },
                resolve: {
                    mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('error');
                        return $translate.refresh();
                    }]
                }
            });
    }
})();

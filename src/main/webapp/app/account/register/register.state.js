(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('register', {
            parent: 'account',
            url: '/register',
            data: {
                notAuthenticated: true,
                pageTitle: 'register.title'
            },
            views: {
                'content@': {
                    template: '<register-component></register-component>'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('register');
                    return $translate.refresh();
                }]
            }
        });
    }
})();

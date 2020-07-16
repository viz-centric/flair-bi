(function() {
    'use strict';

    angular
        .module('flairbiApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider
        .state('client-logo', {
            parent: 'admin',
            url: '/client-logo',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'flairbiApp.clientLogo.home.title'
            },
            views: {
                'content-header@': {
                    template: '<client-logo-header-component></client-logo-header-component>'
                },
                'content@': {
                    template: '<client-logo-component></client-logo-component>'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('clientLogo');
                    $translatePartialLoader.addPart('global');
                    return $translate.refresh();
                }]
            }
        });
    }

})();

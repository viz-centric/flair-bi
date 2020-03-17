(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider', 'PERMISSIONS'];

    function stateConfig($stateProvider, PERMISSIONS) {
        $stateProvider.state('jhi-configuration', {
            parent: 'admin',
            url: '/configuration',
            data: {
                authorities: [PERMISSIONS.READ_CONFIGURATION],
                pageTitle: 'configuration.title'
            },
            views: {
                'content-header@': {
                    template: '<jh-configuration-content-header-component></jh-configuration-content-header-component>'
                },
                'content@': {
                    template: '<jh-configuration-component></jh-configuration-component>'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('configuration');
                    return $translate.refresh();
                }]
            }
        });
    }
})();

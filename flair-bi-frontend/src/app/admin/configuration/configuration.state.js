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
                    templateUrl: 'app/admin/configuration/configuration-content-header.html',
                    controller: 'JhiConfigurationController',
                    controllerAs: 'vm'
                },
                'content@': {
                    templateUrl: 'app/admin/configuration/configuration.html',
                    controller: 'JhiConfigurationController',
                    controllerAs: 'vm'
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

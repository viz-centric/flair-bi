(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('requestReset', {
            parent: 'entity',
            url: '/reset/request',
            data: {
                public: true
            },
            views: {
                'content@': {
                    template: '<reset-request-component></reset-request-component>'
                },
                'navbar@': {

                },
                'topnavbar@': {

                },
                'footer@': {

                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('reset');
                    return $translate.refresh();
                }]
            }
        });
    }
})();

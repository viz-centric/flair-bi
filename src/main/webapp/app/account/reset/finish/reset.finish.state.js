(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('finishReset', {
            parent: 'entity',
            url: '/reset/finish?key',
            data: {
                public: true
            },
            views: {
                'content@': {
                    template: '<reset-finish-component></reset-finish-component>'
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

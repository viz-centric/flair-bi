(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('admin', {
            parent: 'app',
            url: '/administration',
            views: {
                'content@': {
                    template: '<admin-component></admin-component>'
                }
            }
        });
    }
})();

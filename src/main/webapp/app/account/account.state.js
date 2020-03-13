(function () {
    'use strict'; 

    angular
        .module('flairbiApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('account', {
            parent: 'app',
            url: '/account',
            views: {
                'content@': {
                    template: '<account-component></account-component>'
                } 
            }
        });
    }
})();


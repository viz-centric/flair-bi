(function () {
    'use strict'; 

    angular
        .module('flairbiApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('communication-list', {
            parent: 'app',
            url: '/communication-list/{id}',
            data: {
                authorities: [],
                pageTitle: 'Communication List',
                displayName: "Communication List"
            },
            views: {
                'content@': {
                    templateUrl: 'app/entities/flair-bi/scheduler/communication-list/communication-list.html',
                    controller: 'CommunicationListController',
                    controllerAs: 'vm'
                }
            }
        });
    }
})();


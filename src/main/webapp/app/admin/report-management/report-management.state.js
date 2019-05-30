(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider
            .state('report-management', {
                parent: 'admin',
                url: '/report-management?page&sort',
                data: {
                    authorities: [],
                    pageTitle: 'Reports',
                    displayName: "report-management"
                },
                views: {
                    'content-header@': {
                        templateUrl: 'app/admin/report-management/report-management-content-header.html',
                    },
                    'content@': {
                        templateUrl: 'app/admin/report-management/report-management.html',
                        controller: 'ReportManagementController',
                        controllerAs: 'vm'
                    }

                },
            })

    }
})();

(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider','PERMISSIONS'];

    function stateConfig($stateProvider,PERMISSIONS) {
        $stateProvider
            .state('report-management', {
                parent: 'admin',
                url: '/report-management?page&sort',
                data: {
                    authorities: [],
                    pageTitle: 'Reports',
                    displayName: "report Management"
                },
                params: {
                    page: {
                        value: '1',
                        squash: true
                    },
                    sort: {
                        value: 'id,asc',
                        squash: true
                    }
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
                resolve: {
                    pagingParams: ['$stateParams', 'PaginationUtil', function ($stateParams, PaginationUtil) {
                        return {
                            page: PaginationUtil.parsePage($stateParams.page),
                            sort: $stateParams.sort,
                            predicate: PaginationUtil.parsePredicate($stateParams.sort),
                            ascending: PaginationUtil.parseAscending($stateParams.sort)
                        };
                    }],
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('report-management');
                        return $translate.refresh();
                    }]


                }

            })
            .state('report-management-log', {
                parent:'report-management',
                url: '/report/:visualizationid',
                data: {
                    authorities: [],
                    pageTitle: 'Report',
                    displayName: "Report Logs"
                },
                params: {
                    page: {
                        value: '1',
                        squash: true
                    },
                    sort: {
                        value: 'id,asc',
                        squash: true
                    }
                },
                views: {
                    'content-header@': {
                        templateUrl: 'app/admin/report-management/report-management-logs-content-header.html',
                    },
                    'content@': {
                        templateUrl: 'app/admin/report-management/report-management-logs.html',
                        controller: 'ReportManagementLogsController',
                        controllerAs: 'vm'
                    }
                },
                resolve: {
                    pagingParams: ['$stateParams', 'PaginationUtil', function ($stateParams, PaginationUtil) {
                        return {
                            page: PaginationUtil.parsePage($stateParams.page),
                            sort: $stateParams.sort,
                            predicate: PaginationUtil.parsePredicate($stateParams.sort),
                            ascending: PaginationUtil.parseAscending($stateParams.sort)
                        };
                    }],
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('report-management');
                        return $translate.refresh();
                    }]

                }

            })

    }
})();

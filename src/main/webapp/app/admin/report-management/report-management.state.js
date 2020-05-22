(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider', 'PERMISSIONS'];

    function stateConfig($stateProvider, PERMISSIONS) {
        $stateProvider
            .state('report-management', {
                parent: 'admin',
                url: '/report-management/{id}?page&sort&:thresholdAlert',
                data: {
                    authorities: [],
                    pageTitle: 'reportManagement.home.title',
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
                    },
                    id: {
                        value: 'report',
                        squash: true
                    }
                },
                views: {
                    'content-header@': {
                        templateUrl: 'app/admin/report-management/report-management-content-header.html',
                    },
                    'content@': {
                        component: 'reportManagementComponent'
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
                    }],
                    $title: function() { return 'About'; }

                }

            })
            //below code needs to be commented for a while
            // .state("report-management.new", {
            //     parent: "report-management",
            //     url: "/schedule/new",
            //     data: {
            //         displayName: false,
            //         authorities: [PERMISSIONS.SHARE_SCHEDULED_REPORT]
            //     },
            //     onEnter: [
            //         "$stateParams",
            //         "$state",
            //         "$uibModal",
            //         function($stateParams, $state, $uibModal) {
            //             $uibModal
            //                 .open({
            //                     templateUrl:
            //                         "app/entities/flair-bi/scheduler/scheduler-dialog.html",
            //                     controller: "SchedulerDialogController",
            //                     controllerAs: "vm",
            //                     backdrop: "static",
            //                     size: "lg",
            //                     resolve: {
            //                         visualMetaData: function () {
            //                             return null;
            //                         },
            //                         datasource: function(){
            //                             return null;
            //                         },
            //                         view: function(){
            //                             return null;
            //                         },
            //                         dashboard: function(){
            //                             return null;
            //                         },
            //                         scheduledObj: function(){
            //                             return null;
            //                         },
            //                         thresholdAlert: function(){
            //                             return false;
            //                         }
            //                     }
            //                 })
            //                 .result.then(
            //                     function() {
            //                         $state.go("report-management", null, {
            //                             reload: "report-management"
            //                         });
            //                     }
            //                 );
            //         }
            //     ]
            // })
            .state('report-management-log', {
                parent: 'report-management',
                url: '/report/:visualizationid/:reportType',
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
                        component: 'reportManagementLogComponent'
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
                    }],
                    

                }

            })

    }
})();

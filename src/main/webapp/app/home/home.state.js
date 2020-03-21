(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('home', {
            parent: 'app',
            url: '/',
            data: {
                authorities: []
            },
            views: {
                'content@': {
                    component: 'homeComponent'
                },
                'topnavbar@': {
                    component: 'homeTopNavComponent'
                },
                'details@home': {
                    component: 'welcomeTileComponent'
                }
            },
            resolve: {
                mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('home');
                    $translatePartialLoader.addPart('report-management');
                    return $translate.refresh();
                }],
                isAdmin: ['AccountDispatch', function (AccountDispatch) {
                    return AccountDispatch.isAdmin();
                }]
            }
        })
            .state('home.dashboards', {
                url: 'dash?page&sort',
                data: {
                    authorities: []
                },
                views: {
                    'details@home': {
                        component: 'dashboardsTileComponent'
                    }
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
                resolve: {
                    mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('home');
                        $translatePartialLoader.addPart('report-management');
                        return $translate.refresh();
                    }],
                    pagingParams: ['$stateParams', 'PaginationUtil', function ($stateParams, PaginationUtil) {
                        return {
                            page: PaginationUtil.parsePage($stateParams.page),
                            sort: $stateParams.sort,
                            predicate: PaginationUtil.parsePredicate($stateParams.sort),
                            ascending: PaginationUtil.parseAscending($stateParams.sort)
                        };
                    }],
                }
            })
            .state('home.views', {
                url: 'vi?page&sort',
                data: {
                    authorities: []
                },
                views: {
                    'details@home': {
                        component: 'viewsTileComponent'
                    }
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
                resolve: {
                    mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('home');
                        $translatePartialLoader.addPart('report-management');
                        return $translate.refresh();
                    }],
                    pagingParams: ['$stateParams', 'PaginationUtil', function ($stateParams, PaginationUtil) {
                        return {
                            page: PaginationUtil.parsePage($stateParams.page),
                            sort: $stateParams.sort,
                            predicate: PaginationUtil.parsePredicate($stateParams.sort),
                            ascending: PaginationUtil.parseAscending($stateParams.sort)
                        };
                    }],
                }
            })
            .state('home.datasources', {
                url: 'ds?page&sort',
                data: {
                    authorities: []
                },
                views: {
                    'details@home': {
                        component: 'datasourcesTileComponent'
                    }
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
                resolve: {
                    mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('home');
                        $translatePartialLoader.addPart('report-management');
                        return $translate.refresh();
                    }],
                    pagingParams: ['$stateParams', 'PaginationUtil', function ($stateParams, PaginationUtil) {
                        return {
                            page: PaginationUtil.parsePage($stateParams.page),
                            sort: $stateParams.sort,
                            predicate: PaginationUtil.parsePredicate($stateParams.sort),
                            ascending: PaginationUtil.parseAscending($stateParams.sort)
                        };
                    }],
                    isAdmin: ['AccountDispatch', function (AccountDispatch) {
                        return AccountDispatch.isAdmin();
                    }]
                }
            }).state('home.bookmarks', {
                url: 'bm?page&sort',
                data: {
                    authorities: []
                },
                views: {
                    'details@home': {
                        component: 'bookmarksTileComponent'
                    }
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
                resolve: {
                    mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('home');
                        $translatePartialLoader.addPart('report-management');
                        return $translate.refresh();
                    }],
                    pagingParams: ['$stateParams', 'PaginationUtil', function ($stateParams, PaginationUtil) {
                        return {
                            page: PaginationUtil.parsePage($stateParams.page),
                            sort: $stateParams.sort,
                            predicate: PaginationUtil.parsePredicate($stateParams.sort),
                            ascending: PaginationUtil.parseAscending($stateParams.sort)
                        };
                    }],
                }
            }).state('home.reports', {
                url: 'rp?page&sort',
                data: {
                    authorities: []
                },
                views: {
                    'details@home': {
                        component: 'flairInsightComponent'
                    }
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
                resolve: {
                    mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('home');
                        $translatePartialLoader.addPart('report-management');
                        return $translate.refresh();
                    }],
                    pagingParams: ['$stateParams', 'PaginationUtil', function ($stateParams, PaginationUtil) {
                        return {
                            page: PaginationUtil.parsePage($stateParams.page),
                            sort: $stateParams.sort,
                            predicate: PaginationUtil.parsePredicate($stateParams.sort),
                            ascending: PaginationUtil.parseAscending($stateParams.sort)
                        };
                    }],
                }
            }).state('home.recentAccessViews', {
                url: 'rav',
                data: {
                    authorities: []
                },
                views: {
                    'details@home': {
                        component: 'welcomeTileComponent'
                    },
                    'details2@home': {
                        component: 'recentAccessTileComponent'
                    }
                },
                resolve: {
                    mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('home');
                        return $translate.refresh();
                    }],
                    account: ['AccountDispatch', function (AccountDispatch) {
                        return AccountDispatch.getAccount();
                    }],
                    viewWatches: ['ViewWatches', function (ViewWatches) {
                        return ViewWatches.query({
                            page: 0,
                            size: 5,
                            sort: 'watchTime,desc'
                        });
                    }],
                    isAdmin: ['AccountDispatch', function (AccountDispatch) {
                        return AccountDispatch.isAdmin();
                    }],
                    show: function () {
                        return true;
                    }
                }
            }).state('home.recentAccessBookmarks', {
                url: 'rab',
                data: {
                    authorities: []
                },
                views: {
                    'details@home': {
                        component: 'welcomeTileComponent'
                    },
                    'details2@home': {
                        component: 'recentAccessTileComponent'
                    }
                },
                resolve: {
                    mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('home');
                        return $translate.refresh();
                    }],
                    account: ['AccountDispatch', function (AccountDispatch) {
                        return AccountDispatch.getAccount();
                    }],
                    viewWatches: ['recentBookmarkService', function (recentBookmarkService) {
                        return recentBookmarkService.getRecentBookmark("?page=0&size=5&sort=watchTime,desc")
                            .then(function (result) {
                                return result.data;
                            });
                    }],
                    isAdmin: ['AccountDispatch', function (AccountDispatch) {
                        return AccountDispatch.isAdmin();
                    }],
                    show: ['screenDetectService', function (screenDetectService) {
                        return !screenDetectService.isDesktop();
                    }]
                }
            });
    }
})();

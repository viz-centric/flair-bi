import * as angular from 'angular';

import dashboardContentHeaderHtml from './dashboards-content-header.html';
import dashboardHtml from './dashboards.html';
import dashboardPropertiesContentHeaderHtml from './dashboards-properties-content-header.html';
import dashboardDetailHtml from './dashboards-detail.html';
import dashboardOverviewContentHeaderHtml from './dashboards-overview-content-header.html';
import dashboardOverviewHtml from './dashboards-overview.html';
import dashboardDialogHtml from './dashboards-dialog.html';
import dashboardDeleteDialogHtml from './dashboards-delete-dialog.html';
import featureBookmarkContentHeaderHtml from './../feature-bookmark/feature-bookmark-content-header.html';
import featureBookmarksHtml from './../feature-bookmark/feature-bookmarks.html';
import featureBookmarkDialogHtml from './../feature-bookmark/feature-bookmark-dialog.html';
import featureBookmarkDeleteDialogHtml from './../feature-bookmark/feature-bookmark-delete-dialog.html';
import dashboardPublishRequestDialogHtml from './dashboard-publish-request-dialog.html';

"use strict";

angular.module("flairbiApp").config(stateConfig);

stateConfig.$inject = ["$stateProvider", "PERMISSIONS"];

function stateConfig($stateProvider, PERMISSIONS) {
    $stateProvider
        .state("dashboards", {
            parent: "entity",
            url: "/dashboards",
            data: {
                authorities: [PERMISSIONS.READ_DASHBOARDS],
                pageTitle: "flairbiApp.dashboards.home.title",
                displayName: "Dashboards"
            },
            views: {
                "content-header@": {
                    template: dashboardContentHeaderHtml,
                    controller: "DashboardsController",
                    controllerAs: "vm"
                },
                "content@": {
                    template: dashboardHtml,
                    controller: "DashboardsController",
                    controllerAs: "vm"
                }
            },
            resolve: {
                translatePartialLoader: [
                    "$translate",
                    "$translatePartialLoader",
                    function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart("dashboards");
                        $translatePartialLoader.addPart("global");
                        return $translate.refresh();
                    }
                ]
            }
        })
        .state("dashboards-detail", {
            parent: "dashboards-overview",
            url: "/details",
            data: {
                authorities: [],
                pageTitle: "flairbiApp.dashboards.detail.title",
                displayName: "Details"
            },
            views: {
                "content-header@": {
                    template: dashboardPropertiesContentHeaderHtml,
                    controller: "DashboardsDetailController",
                    controllerAs: "vm"
                },
                "content@": {
                    template: dashboardDetailHtml,
                    controller: "DashboardsDetailController",
                    controllerAs: "vm"
                }
            },
            resolve: {
                translatePartialLoader: [
                    "$translate",
                    "$translatePartialLoader",
                    function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart("dashboards");
                        return $translate.refresh();
                    }
                ],
                entity: [
                    "$stateParams",
                    "Dashboards",
                    function ($stateParams, Dashboards) {
                        return Dashboards.get({
                            id: $stateParams.id
                        }).$promise;
                    }
                ],
                previousState: [
                    "$state",
                    function ($state) {
                        var currentStateData = {
                            name: $state.current.name || "dashboards",
                            params: $state.params,
                            url: $state.href(
                                $state.current.name,
                                $state.params
                            )
                        };
                        return currentStateData;
                    }
                ]
            }
        })
        .state("dashboards-overview", {
            parent: "dashboards",
            url: "/{id}",
            data: {
                authorities: [],
                pageTitle: "flairbiApp.dashboards.detail.title",
                displayName: "{{entity.dashboardName}}"
            },
            views: {
                "content-header@": {
                    template: dashboardOverviewContentHeaderHtml,
                    controller: "DashboardOverviewContentHeaderController",
                    controllerAs: "vm"
                },
                "content@": {
                    template: dashboardOverviewHtml,
                    controller: "DashboardOverviewController",
                    controllerAs: "vm"
                }
            },
            resolve: {
                translatePartialLoader: [
                    "$translate",
                    "$translatePartialLoader",
                    function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart("dashboards");
                        return $translate.refresh();
                    }
                ],
                entity: [
                    "$stateParams",
                    "Dashboards",
                    function ($stateParams, Dashboards) {
                        return Dashboards.get({
                            id: $stateParams.id
                        }).$promise;
                    }
                ],
                previousState: [
                    "$state",
                    function ($state) {
                        var currentStateData = {
                            name: $state.current.name || "dashboards",
                            params: $state.params,
                            url: $state.href(
                                $state.current.name,
                                $state.params
                            )
                        };
                        return currentStateData;
                    }
                ]
            }
        })
        .state("dashboards-detail.edit", {
            url: "/edit",
            data: {
                authorities: [],
                displayName: false
            },
            onEnter: [
                "$stateParams",
                "$state",
                "$uibModal",
                function ($stateParams, $state, $uibModal) {
                    $uibModal
                        .open({
                            template: dashboardDialogHtml,
                            controller: "DashboardsDialogController",
                            controllerAs: "vm",
                            backdrop: "static",
                            size: "md"
                        })
                        .result.then(
                        function () {
                            $state.go(
                                "^",
                                {},
                                {
                                    reload: false
                                }
                            );
                        },
                        function () {
                            $state.go("^");
                        }
                    );
                }
            ]
        })
        .state("dashboards.new", {
            // TODO : this is just a work around not a permanent fix
            url: "/create/new",
            data: {
                authorities: [PERMISSIONS.WRITE_DASHBOARDS],
                displayName: false
            },
            onEnter: [
                "$stateParams",
                "$state",
                "$uibModal",
                function ($stateParams, $state, $uibModal) {
                    $uibModal
                        .open({
                            template: dashboardDialogHtml,
                            controller: "DashboardsDialogController",
                            controllerAs: "vm",
                            backdrop: "static",
                            size: "md"
                        })
                        .result.then(
                        function () {
                            $state.go("dashboards", null, {
                                reload: "dashboards"
                            });
                        },
                        function () {
                            $state.go("dashboards");
                        }
                    );
                }
            ]
        })
        .state("dashboards.edit", {
            url: "/{id}/edit",
            data: {
                authorities: []
            },
            onEnter: [
                "$stateParams",
                "$state",
                "$uibModal",
                function ($stateParams, $state, $uibModal) {
                    $uibModal
                        .open({
                            template: dashboardDialogHtml,
                            controller: "DashboardsDialogController",
                            controllerAs: "vm",
                            backdrop: "static",
                            size: "lg"
                        })
                        .result.then(
                        function () {
                            $state.go("dashboards", null, {
                                reload: "dashboards"
                            });
                        },
                        function () {
                            $state.go("^");
                        }
                    );
                }
            ]
        })
        .state("dashboards.delete", {
            url: "/{id}/delete",
            data: {
                authorities: [],
                displayName: false
            },
            onEnter: [
                "$stateParams",
                "$state",
                "$uibModal",
                function ($stateParams, $state, $uibModal) {
                    $uibModal
                        .open({
                            template: dashboardDeleteDialogHtml,
                            controller: "DashboardsDeleteController",
                            controllerAs: "vm",
                            size: "md",
                            resolve: {
                                entity: [
                                    "Dashboards",
                                    function (Dashboards) {
                                        return Dashboards.get({
                                            id: $stateParams.id
                                        }).$promise;
                                    }
                                ]
                            }
                        })
                        .result.then(
                        function () {
                            $state.go("dashboards", null, {
                                reload: "dashboards"
                            });
                        },
                        function () {
                            $state.go("^");
                        }
                    );
                }
            ]
        })
        .state("dashboard-bookmarks", {
            parent: "dashboards-overview",
            url: "/bookmarks",
            data: {
                authorities: [],
                pageTitle: "Bookmarks",
                displayName: "bookmarks"
            },
            views: {
                "content-header@": {
                    template: featureBookmarkContentHeaderHtml
                },
                "content@": {
                    template: featureBookmarksHtml,
                    controller: "FeatureBookmarkController",
                    controllerAs: "vm"
                }
            },
            resolve: {
                data: [
                    "FeatureBookmark",
                    "Dashboards",
                    "$q",
                    "$stateParams",
                    function (
                        FeatureBookmark,
                        Dashboards,
                        $q,
                        $stateParams
                    ) {
                        var defered = $q.defer();

                        Dashboards.get(
                            {
                                id: $stateParams.id
                            },
                            function (res) {
                                FeatureBookmark.query(
                                    {
                                        "datasource.id":
                                        res.dashboardDatasource.id
                                    },
                                    function (res) {
                                        defered.resolve(res);
                                    },
                                    function (err) {
                                        defered.reject(res);
                                    }
                                );
                            },
                            function (err) {
                                defered.reject(err);
                            }
                        ).$promise;

                        return defered.promise;
                    }
                ],
                config: [
                    "$stateParams",
                    function ($stateParams) {
                        return {
                            create: {
                                enabled: false,
                                route: null
                            },
                            view: {
                                enabled: false,
                                route: null
                            },
                            edit: {
                                enabled: true,
                                route:
                                    "dashboard-bookmarks.edit({id: " +
                                    $stateParams.id +
                                    ", bookmarkId:featureBookmark.id})"
                            },
                            delete: {
                                enabled: true,
                                route:
                                    "dashboard-bookmarks.delete({id: " +
                                    $stateParams.id +
                                    ",bookmarkId:featureBookmark.id})"
                            }
                        };
                    }
                ],
                translatePartialLoader: [
                    "$translate",
                    "$translatePartialLoader",
                    function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart("featureBookmark");
                        return $translate.refresh();
                    }
                ]
            }
        })
        .state("dashboard-bookmarks.edit", {
            url: "/{bookmarkId}/edit",
            onEnter: [
                "$stateParams",
                "$state",
                "$uibModal",
                function ($stateParams, $state, $uibModal) {
                    $uibModal
                        .open({
                            template: featureBookmarkDialogHtml,
                            controller: "FeatureBookmarkDialogController",
                            controllerAs: "vm",
                            backdrop: "static",
                            size: "lg",
                            resolve: {
                                entity: [
                                    "FeatureBookmark",
                                    function (FeatureBookmark) {
                                        return FeatureBookmark.get({
                                            id: $stateParams.bookmarkId
                                        }).$promise;
                                    }
                                ]
                            }
                        })
                        .result.then(
                        function () {
                            $state.go("dashboard-bookmarks", null, {
                                reload: "dashboard-bookmarks"
                            });
                        },
                        function () {
                            $state.go("^");
                        }
                    );
                }
            ]
        })
        .state("dashboard-bookmarks.delete", {
            url: "/{bookmarkId}/delete",
            onEnter: [
                "$stateParams",
                "$state",
                "$uibModal",
                function ($stateParams, $state, $uibModal) {
                    $uibModal
                        .open({
                            template: featureBookmarkDeleteDialogHtml,
                            controller: "FeatureBookmarkDeleteController",
                            controllerAs: "vm",
                            size: "md",
                            resolve: {
                                entity: [
                                    "FeatureBookmark",
                                    function (FeatureBookmark) {
                                        return FeatureBookmark.get({
                                            id: $stateParams.bookmarkId
                                        }).$promise;
                                    }
                                ]
                            }
                        })
                        .result.then(
                        function () {
                            $state.go("dashboard-bookmarks", null, {
                                reload: "dashboard-bookmarks"
                            });
                        },
                        function () {
                            $state.go("^");
                        }
                    );
                }
            ]
        })
        .state("request-dashboard-publish", {
            parent: "dashboards-overview",
            url: "/request",
            data: {
                displayName: false
            },
            onEnter: [
                "$stateParams",
                "$state",
                "$uibModal",
                function ($stateParams, $state, $uibModal) {
                    $uibModal
                        .open({
                            template: dashboardPublishRequestDialogHtml,
                            controller:
                                "DashboardPublishRequestDialogController",
                            controllerAs: "vm",
                            size: "md",
                            resolve: {
                                entity: [
                                    "Dashboards",
                                    function (Dashboards) {
                                        return Dashboards.get({
                                            id: $stateParams.id
                                        }).$promise;
                                    }
                                ]
                            }
                        })
                        .result.then(
                        function (result) {
                            $state.go(
                                "dashboards-overview",
                                {
                                    id: result.dashboardId
                                },
                                {
                                    reload: "dashboards-overview"
                                }
                            );
                        },
                        function () {
                        }
                    );
                }
            ]
        });
}

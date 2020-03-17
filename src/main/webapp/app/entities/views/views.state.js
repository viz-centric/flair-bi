(function () {
    "use strict";

    angular.module("flairbiApp").config(stateConfig);

    stateConfig.$inject = ["$stateProvider"];

    function stateConfig($stateProvider) {
        $stateProvider
            .state("views", {
                parent: "entity",
                url: "/views",
                params: {
                    data: null
                },
                data: {
                    authorities: [],
                    pageTitle: "flairbiApp.views.home.title"
                },
                views: {
                    "content@": {
                        templateUrl: "app/entities/views/views.html",
                        controller: "ViewsController",
                        controllerAs: "vm"
                    }
                },
                resolve: {
                    translatePartialLoader: [
                        "$translate",
                        "$translatePartialLoader",
                        function ($translate, $translatePartialLoader) {
                            $translatePartialLoader.addPart("views");
                            $translatePartialLoader.addPart("global");
                            return $translate.refresh();
                        }
                    ]
                }
            })
            .state("dashboards-overview.view-detail", {
                url: "/views/{viewId}/details",
                data: {
                    authorities: [],
                    pageTitle: "flairbiApp.views.detail.title",
                    displayName: "Details"
                },
                views: {
                    "content-header@": {
                        templateUrl:
                            "app/entities/views/views-properties-content-header.html",
                        controller: "ViewsDetailController",
                        controllerAs: "vm"
                    },
                    "content@": {
                        templateUrl: "app/entities/views/views-detail.html",
                        controller: "ViewsDetailController",
                        controllerAs: "vm"
                    }
                },
                resolve: {
                    translatePartialLoader: [
                        "$translate",
                        "$translatePartialLoader",
                        function ($translate, $translatePartialLoader) {
                            $translatePartialLoader.addPart("views");
                            return $translate.refresh();
                        }
                    ],
                    entity: [
                        "$stateParams",
                        "Views",
                        function ($stateParams, Views) {
                            return Views.get({
                                id: $stateParams.viewId
                            }).$promise;
                        }
                    ],
                    previousState: [
                        "$state",
                        function ($state) {
                            var currentStateData = {
                                name: $state.current.name || "views",
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
            .state("views-detail", {
                parent: "entity",
                url: "/views/{id}/details",
                data: {
                    authorities: [],
                    pageTitle: "flairbiApp.views.detail.title"
                },
                views: {
                    "content-header@": {
                        templateUrl:
                            "app/entities/views/views-properties-content-header.html",
                        controller: "ViewsDetailController",
                        controllerAs: "vm"
                    },
                    "content@": {
                        templateUrl: "app/entities/views/views-detail.html",
                        controller: "ViewsDetailController",
                        controllerAs: "vm"
                    }
                },
                resolve: {
                    translatePartialLoader: [
                        "$translate",
                        "$translatePartialLoader",
                        function ($translate, $translatePartialLoader) {
                            $translatePartialLoader.addPart("views");
                            return $translate.refresh();
                        }
                    ],
                    entity: [
                        "$stateParams",
                        "Views",
                        function ($stateParams, Views) {
                            return Views.get({
                                id: $stateParams.id
                            }).$promise;
                        }
                    ],
                    previousState: [
                        "$state",
                        function ($state) {
                            var currentStateData = {
                                name: $state.current.name || "views",
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
            .state("flairbi", {
                parent: "entity",
                url: "/flairbi/{id}/{sid}",
                data: {
                    authorities: [], // had permission issue here
                    pageTitle: "flairbiApp.views.detail.title"
                },
                views: {
                    "content@": {
                        templateUrl: "app/entities/views/flairbi.html",
                        controller: "flairbiController",
                        controllerAs: "vm"
                    }
                },
                resolve: {
                    translatePartialLoader: [
                        "$translate",
                        "$translatePartialLoader",
                        function ($translate, $translatePartialLoader) {
                            $translatePartialLoader.addPart("views");
                            return $translate.refresh();
                        }
                    ],
                    entity: [
                        "$stateParams",
                        "Views",
                        function ($stateParams, Views) {
                            return Views.get({
                                id: $stateParams.id
                            }).$promise;
                        }
                    ],
                    previousState: [
                        "$state",
                        function ($state) {
                            var currentStateData = {
                                name: $state.current.name || "views",
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
            .state("dashboards-overview.view-detail.edit", {
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
                                templateUrl:
                                    "app/entities/views/views-dialog.html",
                                controller: "ViewsDialogController",
                                controllerAs: "vm",
                                backdrop: "static",
                                size: "md",
                                resolve: {
                                    entity: [
                                        "Views",
                                        function (Views) {
                                            return Views.get({
                                                id: $stateParams.viewId
                                            }).$promise;
                                        }
                                    ],
                                    viewReleases: [
                                        "Views",
                                        function (Views) {
                                            return Views.getViewReleases({
                                                id: $stateParams.viewId
                                            }).$promise;
                                        }
                                    ]
                                }
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
            .state("views-detail.edit", {
                url: "/edit",
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
                                templateUrl:
                                    "app/entities/views/views-dialog.html",
                                controller: "ViewsDialogController",
                                controllerAs: "vm",
                                backdrop: "static",
                                size: "md",
                                resolve: {
                                    entity: [
                                        "Views",
                                        function (Views) {
                                            return Views.get({
                                                id: $stateParams.id
                                            }).$promise;
                                        }
                                    ]
                                }
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
            .state("dashboards-overview.view-new", {
                url: "/views/new",
                data: {
                    authorities: [],
                    displayName: false
                },
                params: {
                    dashboard: null
                },
                onEnter: [
                    "$stateParams",
                    "$state",
                    "$uibModal",
                    "$window",
                    "$location",
                    function (
                        $stateParams,
                        $state,
                        $uibModal,
                        $window,
                        $location
                    ) {
                        $uibModal
                            .open({
                                templateUrl:
                                    "app/entities/views/views-dialog.html",
                                controller: "ViewsDialogController",
                                controllerAs: "vm",
                                backdrop: "static",
                                size: "md",
                                resolve: {
                                    entity: function () {
                                        return {
                                            viewDashboard:
                                                $stateParams.dashboard,
                                            viewName: null,
                                            description: null,
                                            published: false,
                                            image: null,
                                            imageContentType: null,
                                            id: null
                                        };
                                    },
                                    viewReleases: function () {
                                        return [];
                                    }
                                }
                            })
                            .result.then(
                                function (result) {
                                    $state.go(
                                        "dashboards-overview",
                                        {
                                            id: result.viewDashboard.id
                                        },
                                        {
                                            reload: "dashboards-overview"
                                        }
                                    );
                                },
                                function () {
                                    $state.go("dashboards");
                                }
                            );
                    }
                ],
                resolve: {
                    translatePartialLoader: [
                        "$translate",
                        "$translatePartialLoader",
                        function ($translate, $translatePartialLoader) {
                            $translatePartialLoader.addPart("views");
                            $translatePartialLoader.addPart("global");
                            return $translate.refresh();
                        }
                    ]
                }
            })
            .state("dashboards-overview.view-delete", {
                url: "/views/{viewId}/delete",
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
                                templateUrl:
                                    "app/entities/views/views-delete-dialog.html",
                                controller: "ViewsDeleteController",
                                controllerAs: "vm",
                                size: "md",
                                resolve: {
                                    entity: [
                                        "Views",
                                        function (Views) {
                                            return Views.get({
                                                id: $stateParams.viewId
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
                                    //$state.go('^');
                                }
                            );
                    }
                ],
                resolve: {
                    translatePartialLoader: [
                        "$translate",
                        "$translatePartialLoader",
                        function ($translate, $translatePartialLoader) {
                            $translatePartialLoader.addPart("views");
                            $translatePartialLoader.addPart("global");
                            return $translate.refresh();
                        }
                    ]
                }
            })
            .state("request-view-publish", {
                parent: "dashboards-overview",
                url: "/view/{viewId}/request",
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
                                templateUrl:
                                    "app/entities/views/view-request-publish-dialog.html",
                                controller: "ViewRequestPublishController",
                                controllerAs: "vm",
                                size: "md",
                                resolve: {
                                    entity: [
                                        "Views",
                                        function (Views) {
                                            return Views.get({
                                                id: $stateParams.viewId
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
})();

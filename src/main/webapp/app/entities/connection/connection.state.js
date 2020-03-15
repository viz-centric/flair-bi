(function () {
    "use strict";

    angular.module("flairbiApp").config(stateConfig);

    stateConfig.$inject = ["$stateProvider"];

    function stateConfig($stateProvider) {
        $stateProvider
            .state("connection", {
                parent: "admin",
                url: "/connection?page&sort&search",
                data: {
                    authorities: [],
                    pageTitle: "flairbiApp.connection.home.title"
                },
                views: {
                    "content-header@": {
                        templateUrl:
                            "app/entities/connection/connections-content-header.html",
                        controller: "ConnectionsContentHeaderController",
                        controllerAs: "vm"
                    },
                    "content@": {
                        templateUrl: "app/entities/connection/connections.html",
                        controller: "ConnectionsController",
                        controllerAs: "vm"
                    }
                },
                params: {
                    page: {
                        value: "1",
                        squash: true
                    },
                    sort: {
                        value: "id,asc",
                        squash: true
                    },
                    search: null
                },
                resolve: {
                    pagingParams: [
                        "$stateParams",
                        "PaginationUtil",
                        function ($stateParams, PaginationUtil) {
                            return {
                                page: PaginationUtil.parsePage(
                                    $stateParams.page
                                ),
                                sort: $stateParams.sort,
                                predicate: PaginationUtil.parsePredicate(
                                    $stateParams.sort
                                ),
                                ascending: PaginationUtil.parseAscending(
                                    $stateParams.sort
                                ),
                                search: $stateParams.search
                            };
                        }
                    ],
                    translatePartialLoader: [
                        "$translate",
                        "$translatePartialLoader",
                        function ($translate, $translatePartialLoader) {
                            $translatePartialLoader.addPart("global");
                            $translatePartialLoader.addPart("service");
                            return $translate.refresh();
                        }
                    ]
                }
            })
            .state("connection.new", {
                url: "/new",
                data: {
                    authorities: [],
                    pageTitle: "flairbiApp.connection.home.title"
                },
                views: {
                    "content@": {
                        templateUrl: "app/entities/data-connection/data-connection.html",
                        controller: "DataConnectionController",
                        controllerAs: "vm"
                    }
                },
                resolve: {
                    entity: function () {
                        return {
                            name: null,
                            lastUpdated: null,
                            connectionName: null,
                            queryPath: null,
                            id: null
                        };
                    },
                    translatePartialLoader: [
                        "$translate",
                        "$translatePartialLoader",
                        function ($translate, $translatePartialLoader) {
                            $translatePartialLoader.addPart("global");
                            $translatePartialLoader.addPart("datasources");
                            return $translate.refresh();
                        }
                    ]
                }
            })
            .state("connection.edit", {
                url: "/{connectionId}/edit",
                onEnter: [
                    "$stateParams",
                    "$state",
                    "$uibModal",
                    function ($stateParams, $state, $uibModal) {
                        $uibModal
                            .open({
                                templateUrl:
                                    "app/entities/connection/connection-dialog.html",
                                controller: "ConnectionDialogController",
                                controllerAs: "vm",
                                backdrop: "static",
                                size: "md",
                                resolve: {
                                    entity: [
                                        "Connections",
                                        function (Connections) {
                                            return Connections.get({
                                                id: $stateParams.connectionId
                                            }).$promise;
                                        }
                                    ]
                                }
                            })
                            .result.then(
                                function () {
                                    $state.go("connection", null, {
                                        reload: "connection"
                                    });
                                },
                                function () {
                                    $state.go("^");
                                }
                            );
                    }
                ]
            })
            .state("connection.delete", {
                url: "/{connectionId}/delete",
                onEnter: [
                    "$stateParams",
                    "$state",
                    "$uibModal",
                    function ($stateParams, $state, $uibModal) {
                        $uibModal
                            .open({
                                templateUrl:
                                    "app/entities/connection/connection-delete-dialog.html",
                                controller: "ConnectionDeleteDialogController",
                                controllerAs: "vm",
                                backdrop: "static",
                                size: "lg",
                                resolve: {
                                    entity: [
                                        "Connections",
                                        function (Connections) {
                                            return Connections.get({
                                                id: $stateParams.connectionId
                                            }).$promise;
                                        }
                                    ]
                                }
                            })
                            .result.then(
                                function () {
                                    $state.go("connection", null, {
                                        reload: "connection"
                                    });
                                },
                                function () {
                                    $state.go("^");
                                }
                            );
                    }
                ]
            })
            .state("connection-detail-abstract", {
                abstract: true,
                parent: "connection",
                url: "/{connectionLinkId}",
                views: {
                    "content-header@": {
                        templateUrl:
                            "app/entities/connection/connection-detail-content-header.html",
                        controller: "ConnectionDetailController",
                        controllerAs: "vm"
                    },
                    "content@": {
                        templateUrl:
                            "app/entities/connection/connection-detail.html",
                        controller: "ConnectionDetailController",
                        controllerAs: "vm"
                    }
                },
                resolve: {
                    translatePartialLoader: [
                        "$translate",
                        "$translatePartialLoader",
                        function ($translate, $translatePartialLoader) {
                            return $translate.refresh();
                        }
                    ],
                    entity: [
                        "$stateParams",
                        "Connections",
                        function ($stateParams, Connections) {
                            return Connections.query({
                                linkId: $stateParams.connectionLinkId
                            }).$promise;
                        }
                    ],
                    previousState: [
                        "$state",
                        function ($state) {
                            var currentStateData = {
                                name: $state.current.name || "connection",
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
            .state("connection-detail", {
                parent: "connection-detail-abstract",
                url: "/detail",
                templateUrl: "app/entities/datasources/datasources.html",
                controller: "DatasourcesController",
                controllerAs: "vm",
                data: {
                    authorities: [],
                    displayName: "Connection Details"
                },
                resolve: {
                    translatePartialLoader: [
                        "$translate",
                        "$translatePartialLoader",
                        function ($translate, $translatePartialLoader) {
                            $translatePartialLoader.addPart("datasources");
                            return $translate.refresh();
                        }
                    ],
                    datasourceFilter: [
                        "$stateParams",
                        function ($stateParams) {
                            return {
                                connectionName: $stateParams.connectionLinkId
                            };
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
                                    enabled: true,
                                    route:
                                        "conn-datasource-detail({id: " +
                                        $stateParams.id +
                                        ', connectionLinkId: "' +
                                        $stateParams.connectionLinkId +
                                        '", datasourceId: datasources.id  })'
                                },
                                edit: {
                                    enabled: true,
                                    route:
                                        "conn-datasource-edit({id: " +
                                        $stateParams.id +
                                        ', connectionLinkId: "' +
                                        $stateParams.connectionLinkId +
                                        '", datasourceId: datasources.id  })'
                                },
                                delete: {
                                    enabled: true,
                                    route:
                                        "conn-datasource-delete({id: " +
                                        $stateParams.id +
                                        ', connectionLinkId: "' +
                                        $stateParams.connectionLinkId +
                                        '", datasourceId: datasources.id  })'
                                }
                            };
                        }
                    ]
                }
            })
            .state("conn-datasource-detail-abstract", {
                abstract: true,
                parent: "connection-detail",
                url: "/{datasourceId}",
                data: {
                    authorities: ["READ_DATASOURCES_APPLICATION"],
                    pageTitle: "flairbiApp.datasources.detail.title"
                },
                views: {
                    "content-header@": {
                        templateUrl:
                            "app/entities/datasources/datasources-detail-content-header.html",
                        controller: "DatasourcesDetailController",
                        controllerAs: "vm"
                    },
                    "content@": {
                        templateUrl:
                            "app/entities/datasources/datasources-detail.html",
                        controller: "DatasourcesDetailController",
                        controllerAs: "vm"
                    }
                },
                resolve: {
                    translatePartialLoader: [
                        "$translate",
                        "$translatePartialLoader",
                        function ($translate, $translatePartialLoader) {
                            $translatePartialLoader.addPart("datasources");
                            return $translate.refresh();
                        }
                    ],
                    entity: [
                        "$stateParams",
                        "Datasources",
                        function ($stateParams, Datasources) {
                            return Datasources.get({
                                id: $stateParams.datasourceId
                            }).$promise;
                        }
                    ],
                    previousState: [
                        "$state",
                        function ($state) {
                            var currentStateData = {
                                name: $state.current.name || "datasources",
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
            .state("conn-datasource-detail", {
                parent: "conn-datasource-detail-abstract",
                url: "/detail",
                data: {
                    authorities: ["READ_DATASOURCES_APPLICATION"],
                    displayName: "Datasource Details"
                },
                templateUrl: "app/entities/dashboards/dashboard-list.html",
                controller: "DashboardListController",
                controllerAs: "vm",
                resolve: {
                    dashboardFilter: [
                        "$stateParams",
                        function ($stateParams) {
                            return {
                                "dashboardDatasources.id":
                                    $stateParams.datasourceId
                            };
                        }
                    ]
                }
            })
            .state("conn-datasource-edit", {
                parent: "connection-detail",
                url: "/{datasourceId}/edit",
                data: {
                    authorities: ["UPDATE_DATASOURCES_APPLICATION"]
                },
                onEnter: [
                    "$stateParams",
                    "$state",
                    "$uibModal",
                    function ($stateParams, $state, $uibModal) {
                        $uibModal
                            .open({
                                templateUrl:
                                    "app/entities/datasources/datasources-dialog.html",
                                controller: "DatasourcesDialogController",
                                controllerAs: "vm",
                                backdrop: "static",
                                size: "lg",
                                resolve: {
                                    entity: [
                                        "Datasources",
                                        function (Datasources) {
                                            return Datasources.get({
                                                id: $stateParams.datasourceId
                                            }).$promise;
                                        }
                                    ]
                                }
                            })
                            .result.then(
                                function () {
                                    $state.go("connection-detail", null, {
                                        reload: "connection-detail"
                                    });
                                },
                                function () {
                                    $state.go("^");
                                }
                            );
                    }
                ]
            })
            .state("conn-datasource-delete", {
                parent: "connection-detail",
                url: "/{datasourceId}/delete",
                data: {
                    authorities: ["DELETE_DATASOURCES_APPLICATION"]
                },
                onEnter: [
                    "$stateParams",
                    "$state",
                    "$uibModal",
                    function ($stateParams, $state, $uibModal) {
                        $uibModal
                            .open({
                                templateUrl:
                                    "app/entities/datasources/datasources-delete-dialog.html",
                                controller: "DatasourcesDeleteController",
                                controllerAs: "vm",
                                size: "md",
                                resolve: {
                                    entity: [
                                        "Datasources",
                                        function (Datasources) {
                                            return Datasources.get({
                                                id: $stateParams.datasourceId
                                            }).$promise;
                                        }
                                    ],
                                    deleteInfo: [
                                        "Datasources",
                                        function (Datasources) {
                                            return Datasources.deleteInfo({
                                                id: $stateParams.datasourceId
                                            }).$promise;
                                        }
                                    ]
                                }
                            })
                            .result.then(
                                function () {
                                    $state.go("connection-detail", null, {
                                        reload: "connection-detail"
                                    });
                                },
                                function () {
                                    $state.go("^");
                                }
                            );
                    }
                ]
            });
    }
})();

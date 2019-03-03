(function() {
    "use strict";

    angular.module("flairbiApp").config(stateConfig);

    stateConfig.$inject = ["$stateProvider"];

    function stateConfig($stateProvider) {
        $stateProvider
            .state("datasources", {
                parent: "entity",
                url: "/datasources",
                data: {
                    authorities: ["READ_DATASOURCES_APPLICATION"],
                    pageTitle: "flairbiApp.datasources.home.title"
                },
                views: {
                    "content@": {
                        templateUrl:
                            "app/entities/datasources/datasources.html",
                        controller: "DatasourcesController",
                        controllerAs: "vm"
                    }
                },
                resolve: {
                    translatePartialLoader: [
                        "$translate",
                        "$translatePartialLoader",
                        function($translate, $translatePartialLoader) {
                            $translatePartialLoader.addPart("datasources");
                            $translatePartialLoader.addPart("global");
                            return $translate.refresh();
                        }
                    ],
                    datasourceFilter: [
                        function() {
                            return null;
                        }
                    ]
                }
            })
            .state("datasources-detail-abstract", {
                parent: "datasources",
                url: "/{id}",
                abstract: true,
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
                        function($translate, $translatePartialLoader) {
                            $translatePartialLoader.addPart("datasources");
                            return $translate.refresh();
                        }
                    ],
                    entity: [
                        "$stateParams",
                        "Datasources",
                        function($stateParams, Datasources) {
                            return Datasources.get({
                                id: $stateParams.id
                            }).$promise;
                        }
                    ],
                    previousState: [
                        "$state",
                        function($state) {
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
            .state("datasources-detail", {
                parent: "datasources-detail-abstract",
                url: "/detail",
                templateUrl: "app/entities/dashboards/dashboard-list.html",
                controller: "DashboardListController",
                controllerAs: "vm",
                resolve: {
                    dashboardFilter: [
                        "$stateParams",
                        function($stateParams) {
                            return {
                                "dashboardDatasource.id": $stateParams.id
                            };
                        }
                    ]
                }
            })
            .state("datasources-detail.edit", {
                parent: "datasources-detail",
                url: "/detail/edit",
                data: {
                    authorities: ["UPDATE_DATASOURCES_APPLICATION"]
                },
                onEnter: [
                    "$stateParams",
                    "$state",
                    "$uibModal",
                    function($stateParams, $state, $uibModal) {
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
                                        function(Datasources) {
                                            return Datasources.get({
                                                id: $stateParams.id
                                            }).$promise;
                                        }
                                    ]
                                }
                            })
                            .result.then(
                                function() {
                                    $state.go(
                                        "^",
                                        {},
                                        {
                                            reload: false
                                        }
                                    );
                                },
                                function() {
                                    $state.go("^");
                                }
                            );
                    }
                ]
            })
            .state("datasources.new", {
                parent: "datasources",
                url: "/new",
                data: {
                    authorities: ["WRITE_DATASOURCES_APPLICATION"]
                },
                onEnter: [
                    "$stateParams",
                    "$state",
                    "$uibModal",
                    function($stateParams, $state, $uibModal) {
                        $uibModal
                            .open({
                                templateUrl:
                                    "app/entities/service/wizard-dialog.html",
                                controller: "WizardDialogController",
                                controllerAs: "vm",
                                backdrop: "static",
                                size: "lg",
                                resolve: {
                                    entity: function() {
                                        return {
                                            name: null,
                                            lastUpdated: null,
                                            connectionName: null,
                                            queryPath: null,
                                            id: null
                                        };
                                    }
                                }
                            })
                            .result.then(
                                function() {
                                    $state.go("datasources", null, {
                                        reload: "datasources"
                                    });
                                },
                                function() {
                                    $state.go("datasources");
                                }
                            );
                    }
                ]
            })
            .state("datasources.edit", {
                parent: "datasources",
                url: "/{id}/edit",
                data: {
                    authorities: ["UPDATE_DATASOURCES_APPLICATION"]
                },
                onEnter: [
                    "$stateParams",
                    "$state",
                    "$uibModal",
                    function($stateParams, $state, $uibModal) {
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
                                        function(Datasources) {
                                            return Datasources.get({
                                                id: $stateParams.id
                                            }).$promise;
                                        }
                                    ]
                                }
                            })
                            .result.then(
                                function() {
                                    $state.go("datasources", null, {
                                        reload: "datasources"
                                    });
                                },
                                function() {
                                    $state.go("^");
                                }
                            );
                    }
                ]
            })
            .state("datasources.delete", {
                parent: "datasources",
                url: "/{id}/delete",
                data: {
                    authorities: ["DELETE_DATASOURCES_APPLICATION"]
                },
                onEnter: [
                    "$stateParams",
                    "$state",
                    "$uibModal",
                    function($stateParams, $state, $uibModal) {
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
                                        function(Datasources) {
                                            return Datasources.get({
                                                id: $stateParams.id
                                            }).$promise;
                                        }
                                    ],
                                    deleteInfo: [
                                        "Datasources",
                                        function(Datasources) {
                                            return Datasources.deleteInfo({
                                                id: $stateParams.id
                                            }).$promise;
                                        }
                                    ]
                                }
                            })
                            .result.then(
                                function() {
                                    $state.go("datasources", null, {
                                        reload: "datasources"
                                    });
                                },
                                function() {
                                    $state.go("^");
                                }
                            );
                    }
                ]
            });
    }
})();

import * as angular from 'angular';
"use strict";

angular.module("flairbiApp").config(stateConfig);

stateConfig.$inject = ["$stateProvider", "PERMISSIONS"];

function stateConfig($stateProvider, PERMISSIONS) {
    $stateProvider
        .state("visualmetadata", {
            parent: "entity",
            url: "/visualmetadata",
            data: {
                authorities: [PERMISSIONS.READ_VISUAL_METADATA],
                pageTitle: "flairbiApp.visualmetadata.home.title"
            },
            views: {
                "content@": {
                    templateUrl:
                        "app/entities/visualmetadata/visualmetadata.html",
                    controller: "VisualmetadataController",
                    controllerAs: "vm"
                }
            },
            resolve: {
                translatePartialLoader: [
                    "$translate",
                    "$translatePartialLoader",
                    function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart("visualmetadata");
                        $translatePartialLoader.addPart("barChartType");
                        $translatePartialLoader.addPart("global");
                        return $translate.refresh();
                    }
                ]
            }
        })
        .state("visualmetadata-detail", {
            parent: "entity",
            url: "/visualmetadata/{id}",
            data: {
                authorities: [],
                pageTitle: "flairbiApp.visualmetadata.detail.title"
            },
            views: {
                "content@": {
                    templateUrl:
                        "app/entities/visualmetadata/visualmetadata-detail.html",
                    controller: "VisualmetadataDetailController",
                    controllerAs: "vm"
                }
            },
            resolve: {
                translatePartialLoader: [
                    "$translate",
                    "$translatePartialLoader",
                    function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart("visualmetadata");
                        $translatePartialLoader.addPart("barChartType");
                        return $translate.refresh();
                    }
                ],
                entity: [
                    "$stateParams",
                    "Visualmetadata",
                    function ($stateParams, Visualmetadata) {
                        return Visualmetadata.get({
                            id: $stateParams.id
                        }).$promise;
                    }
                ],
                previousState: [
                    "$state",
                    function ($state) {
                        var currentStateData = {
                            name: $state.current.name || "visualmetadata",
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
        .state("flair-integration", {
            parent: "entity",
            url: "/flair-integration/{id}",
            data: {
                authorities: [],
                pageTitle: "flairbiApp.visualmetadata.detail.title"
            },
            views: {
                "flairintegration@": {
                    templateUrl:
                        "app/entities/visualmetadata/flair-integration.html",
                    controller: "flairIntegrationController",
                    controllerAs: "vm"
                }
            },
            resolve: {
                translatePartialLoader: [
                    "$translate",
                    "$translatePartialLoader",
                    function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart("visualmetadata");
                        $translatePartialLoader.addPart("barChartType");
                        return $translate.refresh();
                    }
                ],
                entity: [
                    "$stateParams",
                    "Visualmetadata",
                    function ($stateParams, Visualmetadata) {
                        return Visualmetadata.get({
                            id: $stateParams.id
                        }).$promise;
                    }
                ],
                previousState: [
                    "$state",
                    function ($state) {
                        var currentStateData = {
                            name: $state.current.name || "visualmetadata",
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
        .state("visualmetadata-detail.edit", {
            parent: "visualmetadata-detail",
            url: "/detail/edit",
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
                                "app/entities/visualmetadata/visualmetadata-dialog.html",
                            controller: "VisualmetadataDialogController",
                            controllerAs: "vm",
                            backdrop: "static",
                            size: "lg",
                            resolve: {
                                entity: [
                                    "Visualmetadata",
                                    function (Visualmetadata) {
                                        return Visualmetadata.get({
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
        .state("visualmetadata.new", {
            parent: "visualmetadata",
            url: "/new",
            data: {
                authorities: [PERMISSIONS.WRITE_VISUAL_METADATA]
            },
            onEnter: [
                "$stateParams",
                "$state",
                "$uibModal",
                function ($stateParams, $state, $uibModal) {
                    $uibModal
                        .open({
                            templateUrl:
                                "app/entities/visualmetadata/visualmetadata-dialog.html",
                            controller: "VisualmetadataDialogController",
                            controllerAs: "vm",
                            backdrop: "static",
                            size: "lg",
                            resolve: {
                                entity: function () {
                                    return {
                                        height: null,
                                        width: null,
                                        xposition: null,
                                        yposition: null,
                                        sequenceNo: null,
                                        query: null,
                                        background: null,
                                        opacity: null,
                                        showTitle: null,
                                        titlebackgroundclr: null,
                                        titletextclr: null,
                                        sTitle: null,
                                        datasource: null,
                                        noOfDim: null,
                                        sxaxis: null,
                                        syaxis: null,
                                        slegend: null,
                                        legendPosition: null,
                                        clrscheme: null,
                                        vclr: null,
                                        visualBuildId: null,
                                        bottomborder: null,
                                        border: null,
                                        titletext: null,
                                        showlabels: null,
                                        queryjson: null,
                                        orderOfDisplay: null,
                                        stacked: null,
                                        axisLegendColor: null,
                                        barChartType: null,
                                        showGrid: null,
                                        id: null
                                    };
                                }
                            }
                        })
                        .result.then(
                            function () {
                                $state.go("visualmetadata", null, {
                                    reload: "visualmetadata"
                                });
                            },
                            function () {
                                $state.go("visualmetadata");
                            }
                        );
                }
            ]
        })
        .state("visualmetadata.edit", {
            parent: "visualmetadata",
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
                            templateUrl:
                                "app/entities/visualmetadata/visualmetadata-dialog.html",
                            controller: "VisualmetadataDialogController",
                            controllerAs: "vm",
                            backdrop: "static",
                            size: "lg",
                            resolve: {
                                entity: [
                                    "Visualmetadata",
                                    function (Visualmetadata) {
                                        return Visualmetadata.get({
                                            id: $stateParams.id
                                        }).$promise;
                                    }
                                ]
                            }
                        })
                        .result.then(
                            function () {
                                $state.go("visualmetadata", null, {
                                    reload: "visualmetadata"
                                });
                            },
                            function () {
                                $state.go("^");
                            }
                        );
                }
            ]
        })
        .state("visualmetadata.delete", {
            parent: "visualmetadata",
            url: "/{id}/delete",
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
                                "app/entities/visualmetadata/visualmetadata-delete-dialog.html",
                            controller: "VisualmetadataDeleteController",
                            controllerAs: "vm",
                            size: "md",
                            resolve: {
                                entity: [
                                    "Visualmetadata",
                                    function (Visualmetadata) {
                                        return Visualmetadata.get({
                                            id: $stateParams.id
                                        }).$promise;
                                    }
                                ]
                            }
                        })
                        .result.then(
                            function () {
                                $state.go("visualmetadata", null, {
                                    reload: "visualmetadata"
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
import * as angular from 'angular';

import visualizationsHtml from './visualizations.html';
import visualizationsDeleteDialogHtml from './visualizations-delete-dialog.html';
import visualizationsDetailsHtml from './visualizations-detail.html';
import visualizationsDialogHtml from './visualizations-dialog.html';


"use strict";

angular.module("flairbiApp").config(stateConfig);

stateConfig.$inject = ["$stateProvider", "PERMISSIONS"];

function stateConfig($stateProvider, PERMISSIONS) {
    $stateProvider
        .state("visualizations", {
            parent: "entity",
            url: "/visualizations",
            data: {
                authorities: [PERMISSIONS.READ_VISUALIZATIONS],
                pageTitle: "flairbiApp.visualizations.home.title"
            },
            views: {
                "content@": {
                    template: visualizationsHtml,
                    controller: "VisualizationsController",
                    controllerAs: "vm"
                }
            },
            resolve: {
                translatePartialLoader: [
                    "$translate",
                    "$translatePartialLoader",
                    function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart("visualizations");
                        $translatePartialLoader.addPart("global");
                        return $translate.refresh();
                    }
                ]
            }
        })
        .state("visualizations-detail", {
            parent: "entity",
            url: "/visualizations/{id}",
            data: {
                authorities: [PERMISSIONS.READ_VISUALIZATIONS],
                pageTitle: "flairbiApp.visualizations.detail.title"
            },
            views: {
                "content@": {
                    template: visualizationsDetailsHtml,
                    controller: "VisualizationsDetailController",
                    controllerAs: "vm"
                }
            },
            resolve: {
                translatePartialLoader: [
                    "$translate",
                    "$translatePartialLoader",
                    function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart("visualizations");
                        $translatePartialLoader.addPart("fieldType");
                        $translatePartialLoader.addPart("propertyType");
                        return $translate.refresh();
                    }
                ],
                entity: [
                    "$stateParams",
                    "Visualizations",
                    function ($stateParams, Visualizations) {
                        return Visualizations.get({
                            id: $stateParams.id
                        }).$promise;
                    }
                ],
                previousState: [
                    "$state",
                    function ($state) {
                        return {
                            name: $state.current.name || "visualizations",
                            params: $state.params,
                            url: $state.href(
                                $state.current.name,
                                $state.params
                            )
                        };
                    }
                ]
            }
        })
        .state("visualizations-detail.edit", {
            url: "/detail/edit",
            data: {
                authorities: [PERMISSIONS.UPDATE_VISUALIZATIONS]
            },
            onEnter: [
                "$stateParams",
                "$state",
                "$uibModal",
                function ($stateParams, $state, $uibModal) {
                    $uibModal
                        .open({
                            template: visualizationsDialogHtml,
                            controller: "VisualizationsDialogController",
                            controllerAs: "vm",
                            backdrop: "static",
                            size: "lg",
                            resolve: {
                                entity: [
                                    "Visualizations",
                                    function (Visualizations) {
                                        return Visualizations.get({
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
        .state("visualizations.new", {
            url: "/new",
            data: {
                authorities: [PERMISSIONS.WRITE_VISUALIZATIONS]
            },
            onEnter: [
                "$stateParams",
                "$state",
                "$uibModal",
                function ($stateParams, $state, $uibModal) {
                    $uibModal
                        .open({
                            template: visualizationsDialogHtml,
                            controller: "VisualizationsDialogController",
                            controllerAs: "vm",
                            backdrop: "static",
                            size: "lg",
                            resolve: {
                                entity: function () {
                                    return {
                                        name: null,
                                        icon: null,
                                        customId: null,
                                        functionname: null,
                                        id: null
                                    };
                                }
                            }
                        })
                        .result.then(
                        function () {
                            $state.go("visualizations", null, {
                                reload: "visualizations"
                            });
                        },
                        function () {
                            $state.go("visualizations");
                        }
                    );
                }
            ]
        })
        .state("visualizations.edit", {
            url: "/{id}/edit",
            data: {
                authorities: [PERMISSIONS.UPDATE_VISUALIZATIONS]
            },
            onEnter: [
                "$stateParams",
                "$state",
                "$uibModal",
                function ($stateParams, $state, $uibModal) {
                    $uibModal
                        .open({
                            template: visualizationsDialogHtml,
                            controller: "VisualizationsDialogController",
                            controllerAs: "vm",
                            backdrop: "static",
                            size: "lg",
                            resolve: {
                                entity: [
                                    "Visualizations",
                                    function (Visualizations) {
                                        return Visualizations.get({
                                            id: $stateParams.id
                                        }).$promise;
                                    }
                                ]
                            }
                        })
                        .result.then(
                        function () {
                            $state.go("visualizations", null, {
                                reload: "visualizations"
                            });
                        },
                        function () {
                            $state.go("^");
                        }
                    );
                }
            ]
        })
        .state("visualizations.delete", {
            url: "/{id}/delete",
            data: {
                authorities: [PERMISSIONS.DELETE_VISUALIZATIONS]
            },
            onEnter: [
                "$stateParams",
                "$state",
                "$uibModal",
                function ($stateParams, $state, $uibModal) {
                    $uibModal
                        .open({
                            template: visualizationsDeleteDialogHtml,
                            controller: "VisualizationsDeleteController",
                            controllerAs: "vm",
                            size: "md",
                            resolve: {
                                entity: [
                                    "Visualizations",
                                    function (Visualizations) {
                                        return Visualizations.get({
                                            id: $stateParams.id
                                        }).$promise;
                                    }
                                ]
                            }
                        })
                        .result.then(
                        function () {
                            $state.go("visualizations", null, {
                                reload: "visualizations"
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

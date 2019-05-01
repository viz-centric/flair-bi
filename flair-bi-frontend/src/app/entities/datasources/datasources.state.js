import * as angular from 'angular';
import datasourcesHtml from './datasources.html';
import datasourcesDetailContentHeaderHtml from './datasources-detail-content-header.html';
import datasourcesDetailHtml from './datasources-detail.html';
import dashboardListHtml from './../dashboards/dashboard-list.html';
import datasourcesDialogHtml from './datasources-dialog.html';
import wizardDialogHtml from './../service/wizard-dialog.html';
import datasourcesDeleteDialogHtml from './datasources-delete-dialog.html';
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
                    template: datasourcesHtml,
                    controller: "DatasourcesController",
                    controllerAs: "vm"
                }
            },
            resolve: {
                translatePartialLoader: [
                    "$translate",
                    "$translatePartialLoader",
                    function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart("datasources");
                        $translatePartialLoader.addPart("global");
                        return $translate.refresh();
                    }
                ],
                datasourceFilter: [
                    function () {
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
                    template: datasourcesDetailContentHeaderHtml,
                    controller: "DatasourcesDetailController",
                    controllerAs: "vm"
                },
                "content@": {
                    template: datasourcesDetailHtml,
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
                            id: $stateParams.id
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
        .state("datasources-detail", {
            parent: "datasources-detail-abstract",
            url: "/detail",
            template: dashboardListHtml,
            controller: "DashboardListController",
            controllerAs: "vm",
            resolve: {
                dashboardFilter: [
                    "$stateParams",
                    function ($stateParams) {
                        return {
                            "dashboardDatasource.id": $stateParams.id
                        };
                    }
                ]
            }
        })
        .state("datasources-detail.edit", {
            url: "/detail/edit",
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
                            template:datasourcesDialogHtml,
                            controller: "DatasourcesDialogController",
                            controllerAs: "vm",
                            backdrop: "static",
                            size: "lg",
                            resolve: {
                                entity: [
                                    "Datasources",
                                    function (Datasources) {
                                        return Datasources.get({
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
        .state("datasources.new", {
            url: "/new",
            data: {
                authorities: ["WRITE_DATASOURCES_APPLICATION"]
            },
            onEnter: [
                "$stateParams",
                "$state",
                "$uibModal",
                function ($stateParams, $state, $uibModal) {
                    $uibModal
                        .open({
                            template: wizardDialogHtml,
                            controller: "WizardDialogController",
                            controllerAs: "vm",
                            backdrop: "static",
                            size: "lg",
                            resolve: {
                                entity: function () {
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
                            function () {
                                $state.go("datasources", null, {
                                    reload: "datasources"
                                });
                            },
                            function () {
                                $state.go("datasources");
                            }
                        );
                }
            ]
        })
        .state("datasources.edit", {
            url: "/{id}/edit",
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
                            template: datasourcesDialogHtml,
                            controller: "DatasourcesDialogController",
                            controllerAs: "vm",
                            backdrop: "static",
                            size: "lg",
                            resolve: {
                                entity: [
                                    "Datasources",
                                    function (Datasources) {
                                        return Datasources.get({
                                            id: $stateParams.id
                                        }).$promise;
                                    }
                                ]
                            }
                        })
                        .result.then(
                            function () {
                                $state.go("datasources", null, {
                                    reload: "datasources"
                                });
                            },
                            function () {
                                $state.go("^");
                            }
                        );
                }
            ]
        })
        .state("datasources.delete", {
            url: "/{id}/delete",
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
                            template: datasourcesDeleteDialogHtml,
                            controller: "DatasourcesDeleteController",
                            controllerAs: "vm",
                            size: "md",
                            resolve: {
                                entity: [
                                    "Datasources",
                                    function (Datasources) {
                                        return Datasources.get({
                                            id: $stateParams.id
                                        }).$promise;
                                    }
                                ],
                                deleteInfo: [
                                    "Datasources",
                                    function (Datasources) {
                                        return Datasources.deleteInfo({
                                            id: $stateParams.id
                                        }).$promise;
                                    }
                                ]
                            }
                        })
                        .result.then(
                            function () {
                                $state.go("datasources", null, {
                                    reload: "datasources"
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

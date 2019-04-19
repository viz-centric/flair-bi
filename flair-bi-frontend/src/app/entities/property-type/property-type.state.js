import * as angular from 'angular';

import propertyTypeHtml from './property-type.html';
import propertyTypeDetailHtml from './property-type-detail.html';
import propertyTypeDialogHtml from './property-type-dialog.html';
import propertyTypeDeleteDialogHtml from './property-type-delete-dialog.html';

"use strict";

angular.module("flairbiApp").config(stateConfig);

stateConfig.$inject = ["$stateProvider"];

function stateConfig($stateProvider) {
    $stateProvider
        .state("property-type", {
            parent: "entity",
            url: "/property-type",
            data: {
                authorities: [],
                pageTitle: "flairbiApp.propertyType.home.title"
            },
            views: {
                "content@": {
                    template: propertyTypeHtml,
                    controller: "PropertyTypeController",
                    controllerAs: "vm"
                }
            },
            resolve: {
                translatePartialLoader: [
                    "$translate",
                    "$translatePartialLoader",
                    function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart("propertyType");
                        $translatePartialLoader.addPart("global");
                        return $translate.refresh();
                    }
                ]
            }
        })
        .state("property-type-detail", {
            parent: "entity",
            url: "/property-type/{id}",
            data: {
                pageTitle: "flairbiApp.propertyType.detail.title"
            },
            views: {
                "content@": {
                    template: propertyTypeDetailHtml,
                    controller: "PropertyTypeDetailController",
                    controllerAs: "vm"
                }
            },
            resolve: {
                translatePartialLoader: [
                    "$translate",
                    "$translatePartialLoader",
                    function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart("propertyType");
                        $translatePartialLoader.addPart("global");
                        return $translate.refresh();
                    }
                ],
                entity: [
                    "$stateParams",
                    "PropertyTypes",
                    function ($stateParams, PropertyTypes) {
                        return PropertyTypes.get({
                            id: $stateParams.id
                        }).$promise;
                    }
                ],
                previousState: [
                    "$state",
                    "$stateParams",
                    function ($state, $stateParams) {
                        return {
                            name: $state.current.name || "property-type",
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
        .state("property-type-detail.edit", {
            url: "/detail/edit",
            data: {},
            onEnter: [
                "$stateParams",
                "$state",
                "$uibModal",
                function ($stateParams, $state, $uibModal) {
                    $uibModal
                        .open({
                            template: propertyTypeDialogHtml,
                            controller: "PropertyTypeDialogController",
                            controllerAs: "vm",
                            backdrop: "static",
                            size: "lg",
                            resolve: {
                                entity: [
                                    "PropertyTypes",
                                    function (PropertyTypes) {
                                        return PropertyTypes.get({
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
                                    reload: true
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
        .state("property-type.new", {
            url: "/new",
            data: {},
            onEnter: [
                "$stateParams",
                "$state",
                "$uibModal",
                function ($stateParams, $state, $uibModal) {
                    $uibModal
                        .open({
                            template: propertyTypeDialogHtml,
                            controller: "PropertyTypeDialogController",
                            controllerAs: "vm",
                            backdrop: "static",
                            size: "lg",
                            resolve: {
                                entity: function () {
                                    return {};
                                }
                            }
                        })
                        .result.then(
                        function () {
                            $state.go("property-type", null, {
                                reload: "property-type"
                            });
                        },
                        function () {
                            $state.go("property-type");
                        }
                    );
                }
            ]
        })
        .state("property-type.edit", {
            url: "/{id}/edit",
            data: {},
            onEnter: [
                "$stateParams",
                "$state",
                "$uibModal",
                function ($stateParams, $state, $uibModal) {
                    $uibModal
                        .open({
                            template: propertyTypeDialogHtml,
                            controller: "PropertyTypeDialogController",
                            controllerAs: "vm",
                            backdrop: "static",
                            size: "lg",
                            resolve: {
                                entity: [
                                    "PropertyTypes",
                                    function (PropertyTypes) {
                                        return PropertyTypes.get({
                                            id: $stateParams.id
                                        }).$promise;
                                    }
                                ]
                            }
                        })
                        .result.then(
                        function () {
                            $state.go("property-type", null, {
                                reload: "property-type"
                            });
                        },
                        function () {
                            $state.go("^");
                        }
                    );
                }
            ]
        })
        .state("property-type.delete", {
            url: "/{id}/delete",
            data: {},
            onEnter: [
                "$stateParams",
                "$state",
                "$uibModal",
                function ($stateParams, $state, $uibModal) {
                    $uibModal
                        .open({
                            template: propertyTypeDeleteDialogHtml,
                            controller:
                                "PropertyTypeDeleteDialogController",
                            controllerAs: "vm",
                            backdrop: "static",
                            size: "lg",
                            resolve: {
                                entity: [
                                    "PropertyTypes",
                                    function (PropertyTypes) {
                                        return PropertyTypes.get({
                                            id: $stateParams.id
                                        }).$promise;
                                    }
                                ]
                            }
                        })
                        .result.then(
                        function () {
                            $state.go("property-type", null, {
                                reload: "property-type"
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

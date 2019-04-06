import * as angular from 'angular';
"use strict";

angular.module("flairbiApp").config(stateConfig);

stateConfig.$inject = ["$stateProvider"];

function stateConfig($stateProvider) {
    $stateProvider
        .state("feature-criteria", {
            parent: "entity",
            url: "/feature-criteria",
            data: {
                authorities: ["ROLE_USER"],
                pageTitle: "flairbiApp.featureCriteria.home.title"
            },
            views: {
                "content@": {
                    templateUrl:
                        "app/entities/feature-criteria/feature-criteria.html",
                    controller: "FeatureCriteriaController",
                    controllerAs: "vm"
                }
            },
            resolve: {
                translatePartialLoader: [
                    "$translate",
                    "$translatePartialLoader",
                    function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart("featureCriteria");
                        $translatePartialLoader.addPart("global");
                        return $translate.refresh();
                    }
                ]
            }
        })
        .state("feature-criteria-detail", {
            parent: "feature-criteria",
            url: "/feature-criteria/{id}",
            data: {
                authorities: ["ROLE_USER"],
                pageTitle: "flairbiApp.featureCriteria.detail.title"
            },
            views: {
                "content@": {
                    templateUrl:
                        "app/entities/feature-criteria/feature-criteria-detail.html",
                    controller: "FeatureCriteriaDetailController",
                    controllerAs: "vm"
                }
            },
            resolve: {
                translatePartialLoader: [
                    "$translate",
                    "$translatePartialLoader",
                    function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart("featureCriteria");
                        return $translate.refresh();
                    }
                ],
                entity: [
                    "$stateParams",
                    "FeatureCriteria",
                    function ($stateParams, FeatureCriteria) {
                        return FeatureCriteria.get({ id: $stateParams.id })
                            .$promise;
                    }
                ],
                previousState: [
                    "$state",
                    function ($state) {
                        var currentStateData = {
                            name: $state.current.name || "feature-criteria",
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
        .state("feature-criteria-detail.edit", {
            parent: "feature-criteria-detail",
            url: "/detail/edit",
            data: {
                authorities: ["ROLE_USER"]
            },
            onEnter: [
                "$stateParams",
                "$state",
                "$uibModal",
                function ($stateParams, $state, $uibModal) {
                    $uibModal
                        .open({
                            templateUrl:
                                "app/entities/feature-criteria/feature-criteria-dialog.html",
                            controller: "FeatureCriteriaDialogController",
                            controllerAs: "vm",
                            backdrop: "static",
                            size: "lg",
                            resolve: {
                                entity: [
                                    "FeatureCriteria",
                                    function (FeatureCriteria) {
                                        return FeatureCriteria.get({
                                            id: $stateParams.id
                                        }).$promise;
                                    }
                                ]
                            }
                        })
                        .result.then(
                            function () {
                                $state.go("^", {}, { reload: false });
                            },
                            function () {
                                $state.go("^");
                            }
                        );
                }
            ]
        })
        .state("feature-criteria.new", {
            parent: "feature-criteria",
            url: "/new",
            data: {
                authorities: ["ROLE_USER"]
            },
            onEnter: [
                "$stateParams",
                "$state",
                "$uibModal",
                function ($stateParams, $state, $uibModal) {
                    $uibModal
                        .open({
                            templateUrl:
                                "app/entities/feature-criteria/feature-criteria-dialog.html",
                            controller: "FeatureCriteriaDialogController",
                            controllerAs: "vm",
                            backdrop: "static",
                            size: "lg",
                            resolve: {
                                entity: function () {
                                    return {
                                        value: null,
                                        id: null
                                    };
                                }
                            }
                        })
                        .result.then(
                            function () {
                                $state.go("feature-criteria", null, {
                                    reload: "feature-criteria"
                                });
                            },
                            function () {
                                $state.go("feature-criteria");
                            }
                        );
                }
            ]
        })
        .state("feature-criteria.edit", {
            parent: "feature-criteria",
            url: "/{id}/edit",
            data: {
                authorities: ["ROLE_USER"]
            },
            onEnter: [
                "$stateParams",
                "$state",
                "$uibModal",
                function ($stateParams, $state, $uibModal) {
                    $uibModal
                        .open({
                            templateUrl:
                                "app/entities/feature-criteria/feature-criteria-dialog.html",
                            controller: "FeatureCriteriaDialogController",
                            controllerAs: "vm",
                            backdrop: "static",
                            size: "lg",
                            resolve: {
                                entity: [
                                    "FeatureCriteria",
                                    function (FeatureCriteria) {
                                        return FeatureCriteria.get({
                                            id: $stateParams.id
                                        }).$promise;
                                    }
                                ]
                            }
                        })
                        .result.then(
                            function () {
                                $state.go("feature-criteria", null, {
                                    reload: "feature-criteria"
                                });
                            },
                            function () {
                                $state.go("^");
                            }
                        );
                }
            ]
        })
        .state("feature-criteria.delete", {
            parent: "feature-criteria",
            url: "/{id}/delete",
            data: {
                authorities: ["ROLE_USER"]
            },
            onEnter: [
                "$stateParams",
                "$state",
                "$uibModal",
                function ($stateParams, $state, $uibModal) {
                    $uibModal
                        .open({
                            templateUrl:
                                "app/entities/feature-criteria/feature-criteria-delete-dialog.html",
                            controller: "FeatureCriteriaDeleteController",
                            controllerAs: "vm",
                            size: "md",
                            resolve: {
                                entity: [
                                    "FeatureCriteria",
                                    function (FeatureCriteria) {
                                        return FeatureCriteria.get({
                                            id: $stateParams.id
                                        }).$promise;
                                    }
                                ]
                            }
                        })
                        .result.then(
                            function () {
                                $state.go("feature-criteria", null, {
                                    reload: "feature-criteria"
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
(function() {
    "use strict";

    angular.module("flairbiApp").config(stateConfig);

    stateConfig.$inject = ["$stateProvider", "PERMISSIONS"];

    function stateConfig($stateProvider, PERMISSIONS) {
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
                        templateUrl:
                            "app/entities/property-type/property-type.html",
                        controller: "PropertyTypeController",
                        controllerAs: "vm"
                    }
                },
                resolve: {
                    translatePartialLoader: [
                        "$translate",
                        "$translatePartialLoader",
                        function($translate, $translatePartialLoader) {
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
                        templateUrl:
                            "app/entities/property-type/property-type-detail.html",
                        controller: "PropertyTypeDetailController",
                        controllerAs: "vm"
                    }
                },
                resolve: {
                    translatePartialLoader: [
                        "$translate",
                        "$translatePartialLoader",
                        function($translate, $translatePartialLoader) {
                            $translatePartialLoader.addPart("propertyType");
                            $translatePartialLoader.addPart("global");
                            return $translate.refresh();
                        }
                    ],
                    entity: [
                        "$stateParams",
                        "PropertyTypes",
                        function($stateParams, PropertyTypes) {
                            return PropertyTypes.get({
                                id: $stateParams.id
                            }).$promise;
                        }
                    ],
                    previousState: [
                        "$state",
                        "$stateParams",
                        function($state, $stateParams) {
                            var currentStateData = {
                                name: $state.current.name || "property-type",
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
            .state("property-type-detail.edit", {
                url: "/detail/edit",
                data: {},
                onEnter: [
                    "$stateParams",
                    "$state",
                    "$uibModal",
                    function($stateParams, $state, $uibModal) {
                        $uibModal
                            .open({
                                templateUrl:
                                    "app/entities/property-type/property-type-dialog.html",
                                controller: "PropertyTypeDialogController",
                                controllerAs: "vm",
                                backdrop: "static",
                                size: "lg",
                                resolve: {
                                    entity: [
                                        "PropertyTypes",
                                        function(PropertyTypes) {
                                            return PropertyTypes.get({
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
                                            reload: true
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
            .state("property-type.new", {
                url: "/new",
                data: {},
                onEnter: [
                    "$stateParams",
                    "$state",
                    "$uibModal",
                    function($stateParams, $state, $uibModal) {
                        $uibModal
                            .open({
                                templateUrl:
                                    "app/entities/property-type/property-type-dialog.html",
                                controller: "PropertyTypeDialogController",
                                controllerAs: "vm",
                                backdrop: "static",
                                size: "lg",
                                resolve: {
                                    entity: function() {
                                        return {};
                                    }
                                }
                            })
                            .result.then(
                                function() {
                                    $state.go("property-type", null, {
                                        reload: "property-type"
                                    });
                                },
                                function() {
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
                    function($stateParams, $state, $uibModal) {
                        $uibModal
                            .open({
                                templateUrl:
                                    "app/entities/property-type/property-type-dialog.html",
                                controller: "PropertyTypeDialogController",
                                controllerAs: "vm",
                                backdrop: "static",
                                size: "lg",
                                resolve: {
                                    entity: [
                                        "PropertyTypes",
                                        function(PropertyTypes) {
                                            return PropertyTypes.get({
                                                id: $stateParams.id
                                            }).$promise;
                                        }
                                    ]
                                }
                            })
                            .result.then(
                                function() {
                                    $state.go("property-type", null, {
                                        reload: "property-type"
                                    });
                                },
                                function() {
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
                    function($stateParams, $state, $uibModal) {
                        $uibModal
                            .open({
                                templateUrl:
                                    "app/entities/property-type/property-type-delete-dialog.html",
                                controller:
                                    "PropertyTypeDeleteDialogController",
                                controllerAs: "vm",
                                backdrop: "static",
                                size: "lg",
                                resolve: {
                                    entity: [
                                        "PropertyTypes",
                                        function(PropertyTypes) {
                                            return PropertyTypes.get({
                                                id: $stateParams.id
                                            }).$promise;
                                        }
                                    ]
                                }
                            })
                            .result.then(
                                function() {
                                    $state.go("property-type", null, {
                                        reload: "property-type"
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

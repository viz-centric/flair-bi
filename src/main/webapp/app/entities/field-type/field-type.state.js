(function() {
    "use strict";

    angular.module("flairbiApp").config(stateConfig);

    stateConfig.$inject = ["$stateProvider", "PERMISSIONS"];

    function stateConfig($stateProvider, PERMISSIONS) {
        $stateProvider
            .state("field-type", {
                abstract: true,
                url: "/field-type",
                parent: "visualizations-detail"
            })
            .state("field-type.new", {
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
                                    "app/entities/field-type/field-type-dialog.html",
                                controller: "FieldTypeDialogController",
                                controllerAs: "vm",
                                backdrop: "static",
                                size: "lg",
                                resolve: {
                                    fieldTypeEntity: function() {
                                        return {};
                                    }
                                }
                            })
                            .result.then(
                                function() {
                                    $state.go(
                                        "visualizations-detail",
                                        $stateParams,
                                        {
                                            reload: true
                                        }
                                    );
                                },
                                function() {
                                    $state.go(
                                        "visualizations-detail",
                                        $stateParams
                                    );
                                }
                            );
                    }
                ]
            })
            .state("field-type-detail", {
                parent: "field-type",
                url: "/{fieldTypeId}",
                data: {
                    pageTitle: "flairbiApp.fieldType.detail.title"
                },
                views: {
                    "content@": {
                        templateUrl:
                            "app/entities/field-type/field-type-detail.html",
                        controller: "FieldTypeDetailController",
                        controllerAs: "vm"
                    }
                },
                resolve: {
                    translatePartialLoader: [
                        "$translate",
                        "$translatePartialLoader",
                        function($translate, $translatePartialLoader) {
                            $translatePartialLoader.addPart("fieldType");
                            $translatePartialLoader.addPart("propertyType");
                            $translatePartialLoader.addPart("global");
                            return $translate.refresh();
                        }
                    ],
                    fieldTypeEntity: [
                        "$stateParams",
                        "Visualizations",
                        function($stateParams, Visualizations) {
                            return Visualizations.getFieldType({
                                id: $stateParams.id,
                                fieldTypeId: $stateParams.fieldTypeId
                            }).$promise;
                        }
                    ],
                    previousState: [
                        "$state",
                        function($state) {
                            var currentStateData = {
                                name:
                                    $state.current.name ||
                                    "visualizations-detail",
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
            .state("field-type.delete", {
                url: "/{fieldTypeId}/delete",
                data: {},
                onEnter: [
                    "$stateParams",
                    "$state",
                    "$uibModal",
                    function($stateParams, $state, $uibModal) {
                        $uibModal
                            .open({
                                templateUrl:
                                    "app/entities/field-type/field-type-delete-dialog.html",
                                controller: "FieldTypeDeleteDialogController",
                                controllerAs: "vm",
                                backdrop: "static",
                                size: "lg",
                                resolve: {}
                            })
                            .result.then(
                                function() {
                                    $state.go(
                                        "visualizations-detail",
                                        $stateParams,
                                        {
                                            reload: true
                                        }
                                    );
                                },
                                function() {
                                    $state.go(
                                        "visualizations-detail",
                                        $stateParams
                                    );
                                }
                            );
                    }
                ]
            });
    }
})();

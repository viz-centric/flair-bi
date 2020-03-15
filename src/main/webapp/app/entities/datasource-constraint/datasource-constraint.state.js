(function () {
    "use strict";

    angular.module("flairbiApp").config(stateConfig);

    stateConfig.$inject = ["$stateProvider"];

    function stateConfig($stateProvider) {
        $stateProvider
            .state("datasource-constraint", {
                parent: "entity",
                url: "/datasource-constraint",
                data: {
                    authorities: [],
                    pageTitle: "flairbiApp.datasourceConstraint.home.title"
                },
                views: {
                    "content@": {
                        templateUrl:
                            "app/entities/datasource-constraint/datasource-constraints.html",
                        controller: "DatasourceConstraintController",
                        controllerAs: "vm"
                    }
                },
                resolve: {
                    translatePartialLoader: [
                        "$translate",
                        "$translatePartialLoader",
                        function ($translate, $translatePartialLoader) {
                            $translatePartialLoader.addPart(
                                "datasourceConstraint"
                            );
                            $translatePartialLoader.addPart("global");
                            return $translate.refresh();
                        }
                    ]
                }
            })
            .state("datasource-constraint-detail", {
                parent: "datasource-constraint",
                url: "/datasource-constraint/{id}",
                data: {
                    authorities: [],
                    pageTitle: "flairbiApp.datasourceConstraint.detail.title"
                },
                views: {
                    "content@": {
                        templateUrl:
                            "app/entities/datasource-constraint/datasource-constraint-detail.html",
                        controller: "DatasourceConstraintDetailController",
                        controllerAs: "vm"
                    }
                },
                resolve: {
                    translatePartialLoader: [
                        "$translate",
                        "$translatePartialLoader",
                        function ($translate, $translatePartialLoader) {
                            $translatePartialLoader.addPart(
                                "datasourceConstraint"
                            );
                            return $translate.refresh();
                        }
                    ],
                    entity: [
                        "$stateParams",
                        "DatasourceConstraint",
                        function ($stateParams, DatasourceConstraint) {
                            return DatasourceConstraint.get({
                                id: $stateParams.id
                            }).$promise;
                        }
                    ],
                    previousState: [
                        "$state",
                        function ($state) {
                            var currentStateData = {
                                name:
                                    $state.current.name ||
                                    "datasource-constraint",
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
            .state("datasource-constraint-detail.edit", {
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
                                    "app/entities/datasource-constraint/datasource-constraint-dialog.html",
                                controller:
                                    "DatasourceConstraintDialogController",
                                controllerAs: "vm",
                                backdrop: "static",
                                size: "lg",
                                resolve: {
                                    entity: [
                                        "DatasourceConstraint",
                                        function (DatasourceConstraint) {
                                            return DatasourceConstraint.get({
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
            .state("datasource-constraint.new", {
                url: "/new",
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
                                    "app/entities/datasource-constraint/datasource-constraint-dialog.html",
                                controller:
                                    "DatasourceConstraintDialogController",
                                controllerAs: "vm",
                                backdrop: "static",
                                size: "lg",
                                resolve: {
                                    entity: function () {
                                        return {
                                            constraintDefinition: null,
                                            id: null
                                        };
                                    }
                                }
                            })
                            .result.then(
                                function () {
                                    $state.go("datasource-constraint", null, {
                                        reload: "datasource-constraint"
                                    });
                                },
                                function () {
                                    $state.go("datasource-constraint");
                                }
                            );
                    }
                ]
            })
            .state("datasource-constraint.edit", {
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
                                    "app/entities/datasource-constraint/datasource-constraint-dialog.html",
                                controller:
                                    "DatasourceConstraintDialogController",
                                controllerAs: "vm",
                                backdrop: "static",
                                size: "lg",
                                resolve: {
                                    entity: [
                                        "DatasourceConstraint",
                                        function (DatasourceConstraint) {
                                            return DatasourceConstraint.get({
                                                id: $stateParams.id
                                            }).$promise;
                                        }
                                    ]
                                }
                            })
                            .result.then(
                                function () {
                                    $state.go("datasource-constraint", null, {
                                        reload: "datasource-constraint"
                                    });
                                },
                                function () {
                                    $state.go("^");
                                }
                            );
                    }
                ]
            })
            .state("datasource-constraint.delete", {
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
                                    "app/entities/datasource-constraint/datasource-constraint-delete-dialog.html",
                                controller:
                                    "DatasourceConstraintDeleteController",
                                controllerAs: "vm",
                                size: "md",
                                resolve: {
                                    entity: [
                                        "DatasourceConstraint",
                                        function (DatasourceConstraint) {
                                            return DatasourceConstraint.get({
                                                id: $stateParams.id
                                            }).$promise;
                                        }
                                    ]
                                }
                            })
                            .result.then(
                                function () {
                                    $state.go("datasource-constraint", null, {
                                        reload: "datasource-constraint"
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

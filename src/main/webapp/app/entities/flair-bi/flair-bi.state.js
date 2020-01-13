(function() {
    "use strict";

    angular.module("flairbiApp").config(stateConfig);

    stateConfig.$inject = ["$stateProvider"];

    function stateConfig($stateProvider) {
        $stateProvider
            .state(
                "flair-bi-build",
                viewAndDeveloperSettings(
                    "/dashboards/{dashboardId}/views/{id}/build",
                    false
                )
            )
            .state(
                "flair-bi",
                viewAndDeveloperSettings(
                    "/dashboards/{dashboardId}/views/{id}",
                    false
                )
            )
            .state(
                "flair-bi-publish",
                viewAndDeveloperSettings(
                    "/dashboards/{dashboardId}/views/{id}/release",
                    true
                )
            )
            .state("table-view", {
                parent: "entity",
                url: "/visual-table/{id}?datasource",
                data: {
                    authorities: []
                },
                views: {
                    "content@": {
                        templateUrl:
                            "app/entities/flair-bi/tableview/flair-bi-table-view.html",
                        controller: "FlairBiTableviewController",
                        controllerAs: "vm"
                    },
                    "footer@": {},
                    "topnavbar@": {},
                    "rightnavbar@": {},
                    "navbar@": {}
                },
                resolve: {
                    visualMetadata: [
                        "$stateParams",
                        "Visualmetadata",
                        "$state",
                        function($stateParams, Visualmetadata, $state) {
                            return $stateParams.id
                        }
                    ],
                    datasource: [
                        "$stateParams",
                        "Datasources",
                        function($stateParams, Datasources){
                          return $stateParams.datasource
                         
                        }
                      ]
                }
            })
            .state("fullscreen", {
                parent: "entity",
                url: "/visual/{id}?datasource",
                data: {
                    authorities: []
                },
                views: {
                    "content@": {
                        templateUrl:
                            "app/entities/flair-bi/fullscreen/flair-bi-fullscreen.html",
                        controller: "FlairBiFullscreenController",
                        controllerAs: "vm"
                    },
                    "footer@": {},
                    "topnavbar@": {},
                    "rightnavbar@": {},
                    "navbar@": {}
                },
                resolve: {
                    visualMetadata: [
                        "$stateParams",
                        "Visualmetadata",
                        "$state",
                        function($stateParams, Visualmetadata, $state) {
                            return Visualmetadata.get({
                                id: $stateParams.id
                            }).$promise;
                        }
                    ],
                    datasource: [
                      "$stateParams",
                      "Datasources",
                      function($stateParams, Datasources){
                        return Datasources.get({
                          id: $stateParams.datasource
                        }).$promise;
                      }
                    ]
                }
            });

        function viewAndDeveloperSettings(url, isRead) {
            return {
                parent: "entity",
                url: url,
                data: {
                    authorities: [], // had permission issue here
                    pageTitle: "flairbiApp.views.detail.title"
                },
                views: {
                    "content@": {
                        templateUrl: "app/entities/flair-bi/flair-bi.html",
                        controller: "FlairBiController",
                        controllerAs: "vm"
                    },
                    "footer@": {
                        templateUrl:
                            "app/entities/flair-bi/flair-bi-footer.html",
                        controller: "FlairBiFooterController",
                        controllerAs: "vm"
                    },
                    "content-header@": {
                        templateUrl:
                            "app/entities/flair-bi/flair-bi-content-header.html",
                        controller: "FlairBiContentHeaderController",
                        controllerAs: "vm"
                    },
                    "rightnavbar@": {
                        templateUrl:
                            "app/entities/flair-bi/rightnavbar/flair-bi-rightnavbar.html",
                        controller: "FlairBiRightNavBarController",
                        controllerAs: "vm"
                    }
                },
                resolve: {
                    configuration: function() {
                        return {
                            readOnly: isRead
                        };
                    },

                    translatePartialLoader: [
                        "$translate",
                        "$translatePartialLoader",
                        function($translate, $translatePartialLoader) {
                            $translatePartialLoader.addPart("views");
                            $translatePartialLoader.addPart("dimensions");
                            $translatePartialLoader.addPart("drilldown");
                            $translatePartialLoader.addPart("feature");
                            $translatePartialLoader.addPart("featureBookmark");
                            $translatePartialLoader.addPart("visualmetadata");
                            return $translate.refresh();
                        }
                    ],
                    datasource: [
                        "$stateParams",
                        "Dashboards",
                        "$q",
                        function($stateParams, Dashboards, $q) {
                            if (!isNaN($stateParams.dashboardId)) {
                                return Dashboards.datasource({
                                    id: $stateParams.dashboardId
                                }).$promise;
                            } else {
                                var deferred = $q.defer();
                                deferred.reject("Not valid id");
                                return deferred.promise;
                            }
                        }
                    ],
                    entity: [
                        "$stateParams",
                        "Views",
                        "$q",
                        function($stateParams, Views, $q) {
                            if (!isNaN($stateParams.id)) {
                                return Views.get({
                                    id: $stateParams.id
                                }).$promise;
                            } else {
                                var deferred = $q.defer();
                                deferred.reject("Not valid id");
                                return deferred.promise;
                            }
                        }
                    ],
                    states: [
                        "$stateParams",
                        "Views",
                        "$q",
                        function($stateParams, Views, $q) {
                            if (!isNaN($stateParams.id)) {
                                if (isRead) {
                                    return Views.getLatestRelease({
                                        id: $stateParams.id
                                    }).$promise;
                                } else {
                                    return Views.getCurrentEditState({
                                        id: $stateParams.id
                                    }).$promise;
                                }
                            } else {
                                var deferred = $q.defer();
                                deferred.reject("Not valid id");
                                return deferred.promise;
                            }
                        }
                    ],
                    featureEntities: [
                        "Features",
                        "$stateParams",
                        "$q",
                        function(Features, $stateParams, $q) {
                            if (!isNaN($stateParams.id)) {
                                return Features.query({
                                    view: $stateParams.id
                                }).$promise;
                            } else {
                                var deferred = $q.defer();
                                deferred.reject("Not valid id");
                                return deferred.promise;
                            }
                        }
                    ],
                    previousState: [
                        "$state",
                        function($state) {
                            var currentStateData = {
                                name: $state.current.name || "views",
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
            };
        }
    }
})();

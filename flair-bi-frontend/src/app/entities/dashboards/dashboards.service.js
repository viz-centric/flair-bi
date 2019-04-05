(function() {
    "use strict";
    angular.module("flairbiApp").factory("Dashboards", Dashboards);

    Dashboards.$inject = ["$resource"];

    function Dashboards($resource) {
        var resourceUrl = "api/dashboards/:id/:q";

        return $resource(
            resourceUrl,
            {
                q: "@q"
            },
            {
                query: { method: "GET", isArray: true },
                get: {
                    method: "GET",
                    transformResponse: function(data) {
                        if (data) {
                            data = angular.fromJson(data);
                        }
                        return data;
                    }
                },
                update: { method: "PUT" },
                datasource: {
                    method: "GET",
                    url: "api/dashboards/:id/datasource"
                },
                currentRelease: {
                    url: "api/dashboards/:id/releases/latest",
                    method: "GET"
                },
                releases: {
                    url: "api/dashboards/:id/releases",
                    method: "GET",
                    isArray: true
                },
                releaseByVersion: {
                    url: "api/dashboards/:id/releases/:version",
                    method: "GET"
                },
                requestRelease: {
                    url: "api/dashboards/:id/requestRelease",
                    method: "PUT"
                }
            }
        );
    }
})();

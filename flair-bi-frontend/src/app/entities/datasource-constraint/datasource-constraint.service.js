(function() {
    "use strict";
    angular
        .module("flairbiApp")
        .factory("DatasourceConstraint", DatasourceConstraint);

    DatasourceConstraint.$inject = ["$resource"];

    function DatasourceConstraint($resource) {
        var resourceUrl = "api/datasource-constraints/:id/:query";

        return $resource(
            resourceUrl,
            {
                query: "@query"
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
                update: { method: "PUT" }
            }
        );
    }
})();

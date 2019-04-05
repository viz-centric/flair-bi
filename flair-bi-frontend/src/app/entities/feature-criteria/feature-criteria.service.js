(function() {
    "use strict";
    angular.module("flairbiApp").factory("FeatureCriteria", FeatureCriteria);

    FeatureCriteria.$inject = ["$resource"];

    function FeatureCriteria($resource) {
        var resourceUrl = "api/feature-criteria/:id/:query";

        return $resource(
            resourceUrl,
            {
                query: "@query"
            },
            {
                query: {
                    method: "GET",
                    isArray: true
                },
                get: {
                    method: "GET",
                    transformResponse: function(data) {
                        if (data) {
                            data = angular.fromJson(data);
                        }
                        return data;
                    }
                },
                update: {
                    method: "PUT"
                }
            }
        );
    }
})();

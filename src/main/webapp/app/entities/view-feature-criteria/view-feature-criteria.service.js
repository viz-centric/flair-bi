(function() {
    "use strict";
    angular.module("flairbiApp").factory("ViewFeatureCriteria", ViewFeatureCriteria);

    ViewFeatureCriteria.$inject = ["$resource"];

    function ViewFeatureCriteria($resource) {
        var resourceUrl = "api/view-feature-criteria/:id/:query";

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
                },
                save: {
                    method: "POST",
                    isArray: true
                }
            }
        );
    }
})();

(function() {
    "use strict";
    angular.module("flairbiApp").factory("Features", Features);

    Features.$inject = ["$resource"];

    function Features($resource) {
        var resourceUrl = "api/features/:id/:query";

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
                addFeatures: {
                    url: "api/features/list",
                    method: "POST"
                },
                update: {
                    method: "PUT"
                }
            }
        );
    }
})();

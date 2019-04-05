(function() {
    "use strict";
    angular.module("flairbiApp").factory("FeatureBookmark", FeatureBookmark);

    FeatureBookmark.$inject = ["$resource"];

    function FeatureBookmark($resource) {
        var resourceUrl = "api/feature-bookmarks/:id/:query";

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

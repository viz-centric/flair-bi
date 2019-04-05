(function() {
    "use strict";

    angular.module("flairbiApp").factory("FeatureTypes", FeatureTypes);

    FeatureTypes.$inject = ["$resource"];

    function FeatureTypes($resource) {
        var resourceUrl = "api/featureTypes/:id";

        return $resource(
            resourceUrl,
            {},
            {
                query: {
                    method: "GET",
                    isArray: true
                }
            }
        );
    }
})();

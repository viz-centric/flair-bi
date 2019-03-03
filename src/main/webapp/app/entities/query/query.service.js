(function() {
    "use strict";
    angular.module("flairbiApp").factory("Query", Release);

    Release.$inject = ["$resource"];

    function Release($resource) {
        var resourceUrl = "api/query/:id";

        return $resource(
            resourceUrl,
            {},
            {
                executeQuery: {
                    method: "POST",
                    url: "fbiengine/api/queries/:connectionLinkId"
                },
                testConnection: {
                    method: "POST",
                    url: "api/query/test"
                }
            }
        );
    }
})();

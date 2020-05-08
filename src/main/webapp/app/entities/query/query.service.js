(function () {
    "use strict";
    angular.module("flairbiApp").factory("Query", Query);

    Query.$inject = ["$resource"];

    function Query($resource) {
        var resourceUrl = "api/query/:id";

        return $resource(
            resourceUrl,
            {},
            {
                executeQuery: {
                    method: "POST",
                    url: "/api/query/execute"
                },
                testConnection: {
                    method: "POST",
                    url: "api/query/test"
                }
            }
        );
    }
})();

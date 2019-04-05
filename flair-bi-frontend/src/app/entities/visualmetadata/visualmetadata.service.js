(function() {
    "use strict";
    angular.module("flairbiApp").factory("Visualmetadata", Visualmetadata);

    Visualmetadata.$inject = ["$resource"];

    function Visualmetadata($resource) {
        var resourceUrl = "api/visualmetadata/:id/:q";

        return $resource(
            resourceUrl,
            {
                q: "@q"
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
                validate: {
                    url: "api/visualmetadata/validate",
                    method: "POST"
                }
            }
        );
    }
})();

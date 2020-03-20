(function () {
    "use strict";

    angular.module("flairbiApp").factory("Connections", Connections);

    Connections.$inject = ["$resource"];

    function Connections($resource) {
        var resourceUrl = "api/connection/:id/";

        return $resource(
            resourceUrl,
            {},
            {
                query: {
                    method: "GET",
                    isArray: true
                },
                get: {
                    method: "GET",
                    transformResponse: function (data) {
                        if (data) {
                            data = angular.fromJson(data);
                        }
                        return data;
                    }
                },
                update: {
                    method: "PUT"
                },
                fetchFeatures: {
                    url: "api/connection/features/:datasourceId",
                    method: "POST"
                },
                deleteInfo: {
                    method: "GET",
                    isArray: true,
                    url: "api/connection/:linkId/deleteInfo"
                }
            }
        );
    }
})();

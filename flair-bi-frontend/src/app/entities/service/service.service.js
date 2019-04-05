(function() {
    "use strict";
    angular.module("flairbiApp").factory("Service", Service);

    Service.$inject = ["$resource"];

    function Service($resource) {
        var resourceUrl = "api/services/:id";

        return $resource(
            resourceUrl,
            {},
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
                update: { method: "PUT" },
                deleteInfo: {
                    method: "GET",
                    url: "api/services/:id/deleteInfo",
                    isArray: true
                }
            }
        );
    }
})();

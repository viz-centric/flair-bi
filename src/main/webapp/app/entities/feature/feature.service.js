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
                },
                markPinFilter: {
                    url: "api/features/pinFilter/?id=:id&pin=:pin",
                    method: "PUT",
                    params:{ 
                        id:'@id', 
                        pin: '@pin'
                    }
                }
            }
        );
    }
})();

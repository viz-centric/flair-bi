(function() {
    "use strict";
    angular.module("flairbiApp").factory("Visualizations", Visualizations);

    Visualizations.$inject = ["$resource"];

    function Visualizations($resource) {
        var resourceUrl = "api/visualizations/:id";

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
                getFieldType: {
                    method: "GET",
                    url: "api/visualizations/:id/fieldTypes/:fieldTypeId",
                    params: {
                        id: "@id",
                        fieldTypeId: "@fieldTypeId"
                    }
                },
                saveFieldType: {
                    method: "POST",
                    url: "api/visualizations/:id/fieldTypes"
                },
                deleteFieldType: {
                    method: "DELETE",
                    url: "api/visualizations/:id/fieldTypes/:fieldTypeId"
                },
                assignPropertyType: {
                    method: "POST",
                    url: "api/visualizations/:id/propertyTypes"
                },
                removePropertyType: {
                    method: "DELETE",
                    url: "api/visualizations/:id/propertyTypes/:propertyTypeId"
                }
            }
        );
    }
})();

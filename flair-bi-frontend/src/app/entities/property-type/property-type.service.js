import * as angular from 'angular';
"use strict";

angular.module("flairbiApp").factory("PropertyTypes", PropertyTypes);

PropertyTypes.$inject = ["$resource"];

function PropertyTypes($resource) {
    var resourceUrl = "api/propertyTypes/:id";

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
            }
        }
    );
}
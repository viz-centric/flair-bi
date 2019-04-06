import * as angular from 'angular';
"use strict";

angular.module("flairbiApp").factory("ConnectionTypes", ConnectionTypes);

ConnectionTypes.$inject = ["$resource"];

function ConnectionTypes($resource) {
    var resourceUrl = "api/connection-type/:id";

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
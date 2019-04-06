import * as angular from 'angular';
"use strict";
angular.module("flairbiApp").factory("Hierarchies", Hierarchies);

Hierarchies.$inject = ["$resource"];

function Hierarchies($resource) {
    var resourceUrl = "api/hierarchies/:id/:query";

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
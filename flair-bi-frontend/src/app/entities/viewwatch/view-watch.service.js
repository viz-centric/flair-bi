import * as angular from 'angular';
"use strict";
angular.module("flairbiApp").factory("ViewWatches", Views);

Views.$inject = ["$resource"];

function Views($resource) {
    var resourceUrl = "api/viewWatches/:id/:query";

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
import * as angular from 'angular';
"use strict";
angular.module("flairbiApp").factory("Information", Features);

Features.$inject = ["$resource"];

function Features($resource) {
    var resourceUrl = "api/information/:id/:query";

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
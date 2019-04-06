import * as angular from 'angular';
"use strict";
angular.module("flairbiApp").factory("Datasources", Datasources);

Datasources.$inject = ["$resource", "DateUtils"];

function Datasources($resource, DateUtils) {
    var resourceUrl = "api/datasources/:id/:query";

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
                        data.lastUpdated = DateUtils.convertDateTimeFromServer(
                            data.lastUpdated
                        );
                    }
                    return data;
                }
            },
            update: {
                method: "PUT"
            },
            deleteInfo: {
                method: "GET",
                url: "api/datasources/:id/deleteInfo",
                isArray: true
            },
            search: {
                method: "GET",
                url: "api/datasources/search/:query",
                isArray: true
            },
            listTables: {
                method: "POST",
                url: "api/datasources/listTables"
            }
        }
    );
}
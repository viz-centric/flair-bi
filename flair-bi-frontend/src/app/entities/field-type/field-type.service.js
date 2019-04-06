import * as angular from 'angular';
"use strict";

angular.module("flairbiApp").factory("FieldTypes", FieldTypes);

FieldTypes.$inject = ["$resource"];

function FieldTypes($resource) {
    var resourceUrl = "api/fieldTypes/:id";

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
            assignPropertyType: {
                method: "POST",
                url: "api/fieldTypes/:id/propertyTypes"
            },
            removePropertyType: {
                method: "DELETE",
                url: "api/fieldTypes/:id/propertyTypes/:propertyTypeId"
            }
        }
    );
}
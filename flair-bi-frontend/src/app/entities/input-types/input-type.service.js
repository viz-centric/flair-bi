import * as angular from 'angular';
"use strict";

angular.module("flairbiApp").factory("InputTypes", InputTypes);

InputTypes.$inject = ["$resource"];

function InputTypes($resource) {
    var resourceUrl = "api/inputTypes/:id";
    return $resource(
        resourceUrl,
        {},
        {
            query: {
                method: "GET",
                isArray: true
            }
        }
    );
}
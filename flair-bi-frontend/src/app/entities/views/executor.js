import * as angular from 'angular';
"use strict";

var app = angular.module("flairbiApp");
app.factory("ExecutorFactory", [
    "$http",
    "$cookies",
    function ($http, $cookies) {
        return {
            executor: function (
                query,
                datasourceId,
                filterString,
                eCache,
                callbackFunction,
                errorFunction
            ) {
                $.ajax({
                    url: "/api/proxy/cherrypy",
                    type: "GET",
                    data: {
                        q: query,
                        datasourceId: datasourceId,
                        filters: filterString,
                        enablecache: eCache
                    },
                    success: callbackFunction,
                    error: errorFunction
                });
            },
            getVisualProperties: function (
                requestIds,
                callbackFunction,
                errorFunction
            ) {
                $.ajax({
                    url:
                        "/api/visualproperties/visualmetadata/associates?visualMetadataIds=" +
                        requestIds,
                    type: "GET",
                    success: callbackFunction,
                    error: errorFunction
                });
            },
            deleteVisualProperties: function (
                requestIds,
                callbackFunction,
                errorFunction
            ) {
                $.ajax({
                    url:
                        "/api/visualproperties/visualmetadata/associates?visualMetadataIds=" +
                        requestIds.toString(),
                    headers: {
                        //'X-XSRF-TOKEN':'bab08fda-ad35-4d0a-bbe7-f7c52589ca6d'
                        "X-XSRF-TOKEN": $cookies.get("XSRF-TOKEN")
                    },
                    type: "DELETE",
                    success: callbackFunction,
                    error: errorFunction
                });
            },
            getVisualMetadataRow: function (
                requestId,
                callbackFunction,
                errorFunction
            ) {
                $.ajax({
                    url: "/api/visualmetadata/" + requestId,
                    type: "GET",
                    success: callbackFunction,
                    error: errorFunction
                });
            },
            flairml: function (
                query,
                datasourceId,
                callbackFunction,
                errorFunction
            ) {
                $.ajax({
                    url: "/api/proxy/flairml",
                    type: "GET",
                    data: { q: query, datasourceId: datasourceId },
                    success: callbackFunction,
                    error: errorFunction
                });
            },
            getCurrentDrilldowns: function (
                sourceid,
                callbackFunction,
                errorFunction
            ) {
                $.ajax({
                    url: "/api/drilldowns/sourceId?sourceId=" + sourceid,
                    type: "GET",
                    success: callbackFunction,
                    error: errorFunction
                });
            },
            getVisualDrilldowns: function (
                sourceid,
                name,
                callbackFunction,
                errorFunction
            ) {
                $.ajax({
                    url:
                        "/api/drilldowns/sourceId/name?sourceId=" +
                        sourceid +
                        "&name=" +
                        name,
                    type: "GET",
                    success: callbackFunction,
                    error: errorFunction
                });
            },
            deleteDrill: function (
                sourceid,
                name,
                callbackFunction,
                errorFunction
            ) {
                $.ajax({
                    url:
                        "/api/drilldowns/sourceId/name?sourceId=" +
                        sourceid +
                        "&name=" +
                        name,
                    headers: {
                        "X-XSRF-TOKEN": $cookies.get("XSRF-TOKEN")
                    },
                    type: "DELETE",
                    success: callbackFunction,
                    error: errorFunction
                });
            }
        };
    }
]);
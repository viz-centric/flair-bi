(function() {
    "use strict";
    angular.module("flairbiApp").factory("Views", Views);

    Views.$inject = ["$resource", 'Blob'];

    function Views($resource, Blob) {
        var resourceUrl = "api/views/:id/:query";

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
                recentlyCreated: {
                    url: "api/views/recentlyCreated",
                    method: "GET",
                    isArray: true
                },
                mostPopular: {
                    url: "api/views/mostPopular",
                    method: "GET",
                    isArray: true
                },
                requestRelease: {
                    url: "api/views/:id/requestRelease",
                    method: "PUT"
                },
                getViewPublishes: {
                    url: "api/views/publishRequests",
                    method: "GET",
                    isArray: true
                },
                getViewReleases: {
                    url: "api/views/:id/releases",
                    method: "GET",
                    isArray: true
                },
                getLatestRelease: {
                    url: "api/views/:id/releases/latest",
                    method: "GET"
                },
                getReleaseByVersion: {
                    url: "api/views/:id/releases/:version",
                    method: "GET"
                },
                getCurrentEditState: {
                    url: "api/views/:id/viewState",
                    method: "GET"
                },
                saveViewState: {
                    url: "api/views/:id/viewState",
                    method: "PUT"
                },
                download: {
                    url: 'api/views/:id/export',
                    method: "GET",
                    responseType: 'arraybuffer',
                    transformResponse: function (data) {
                        const fileData = new Blob([data], {type: 'text/plain;charset=utf-8'});
                        return { raw: fileData };
                    }
                }
            }
        );
    }
})();

import * as angular from 'angular';
'use strict';
angular
    .module('flairbiApp')
    .factory('VisualizationColors', VisualizationColors);

VisualizationColors.$inject = ['$resource'];

function VisualizationColors($resource) {
    var resourceUrl = 'api/visualization-colors/:id';

    return $resource(resourceUrl, {}, {
        'query': { method: 'GET', isArray: true },
        'get': {
            method: 'GET',
            transformResponse: function (data) {
                if (data) {
                    data = angular.fromJson(data);
                }
                return data;
            }
        },
        'update': { method: 'PUT' }
    });
}
(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('SchedulerService1', SchedulerService1);

        SchedulerService1.$inject = ['$resource'];

    function SchedulerService1($resource) {
        var service = $resource('url', {}, {
            'query': {
                method: 'GET',
                isArray: true
            },
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    return data;
                }
            },
            'save': {
                method: 'POST'
            },
            'update': {
                method: 'PUT'
            },
            'delete': {
                method: 'DELETE'
            }
        });

        return service;
    }
})();

(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('UserGroup', User);

    User.$inject = ['$resource'];

    function User($resource) {
        var service = $resource('api/userGroups/:name', {}, {
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
            },
            'getDashboardPermissions': {
                method: 'GET',
                url: 'api/userGroups/:name/dashboardPermissions',
                isArray: true
            },
            'getViewPermissions': {
                method: 'GET',
                url: 'api/userGroups/:name/dashboardPermissions/:id/viewPermissions',
                isArray: true
            },
            'searchDashboardPermissions': {
                method: 'GET',
                url: 'api/userGroups/:name/dashboardPermissions/search',
                isArray: true
            },
            'searchViewPermissions': {
                method: 'GET',
                url: 'api/userGroups/:name/viewPermissions/search',
                isArray: true
            },
            'changePermissions': {
                method: 'PUT',
                url: 'api/userGroups/:name/changePermissions'
            },
            'getAllUserGroups': {
                method: 'GET',
                url: 'api/userGroups/all',
                isArray: true
            }

        });

        return service;
    }
})();

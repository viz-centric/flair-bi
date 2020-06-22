(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('User', User);

    User.$inject = ['$resource'];

    function User($resource) {
        var service = $resource('api/users/:login', {}, {
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
            'getDatasourcePermissions': {
                method: 'GET',
                url: 'api/users/:login/datasourcePermissions',
                isArray: true
            },
            'getDashboardPermissions': {
                method: 'GET',
                url: 'api/users/:login/dashboardPermissions',
                isArray: true
            },
            'searchDashboardPermissions': {
                method: 'GET',
                url: 'api/users/:login/dashboardPermissions/search',
                isArray: true
            },
            'searchViewPermissions': {
                method: 'GET',
                url: 'api/users/:login/viewPermissions/search',
                isArray: true
            },
            'getViewPermisions': {
                method: 'GET',
                url: 'api/users/:login/dashboardPermissions/:id/viewPermissions',
                isArray: true
            },
            'changePermissions':{
                method: 'PUT',
                url: '/api/users/:login/changePermissions'
            },
            'search': {
                method: 'GET',
                isArray: true,
                url: 'api/users/search/:query'
            },
        });

        return service;
    }
})();

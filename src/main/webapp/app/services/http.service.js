(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('HttpService', HttpService);

    HttpService.$inject = ['$http'];

    function HttpService($http) {
        var service = {
            call: call,
            testConnection: testConnection,
            pingURL: pingURL,
            connectionTypes: connectionTypes,
            connections: connections,
            getVizualizationServiceMode:getVizualizationServiceMode
        };

        return service;

        ////////////////
        function call(request, success, error) {
            return $http(request).then(success, error);
        }

        function testConnection(serviceId, body, success, error) {
            if (serviceId) {
                return $http.post('api/fbi-engine/' + serviceId + '/testConnection', body).then(success, error);
            } else {
                return $http.post('api/fbi-engine/testConnections', body).then(success, error);
            }
        }

        function pingURL(url, success, error) {
            return $http.get('api/fbi-engine/ping?url=' + url).then(success, error);
        }

        function connectionTypes(serviceInfo, success, error) {
            return $http({
                method: 'POST',
                data: serviceInfo,
                url: 'api/fbi-engine/connection-types'
            }).then(function (res) { success(res.data); }, error);
        }

        function connections(serviceInfo, success, error) {
            return $http({
                method: 'POST',
                data: serviceInfo,
                url: 'api/fbi-engine/connections'
            }).then(function (res) { success(res.data) }, error);
        }

        function getVizualizationServiceMode(success, error) {
            return $http.get('api/vizualizationServiceMode').then(success, error);
        }
    }
})();

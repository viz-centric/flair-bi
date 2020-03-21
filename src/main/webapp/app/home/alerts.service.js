(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('alertsService', alertsService);

    alertsService.$inject = ['$http'];

    function alertsService($http) {
        var service = {
            getReleaseAlerts: getReleaseAlerts,
            getReleaseAlertsCount: getReleaseAlertsCount,
            getAllReleaseAlerts: getAllReleaseAlerts
        };

        return service;

        ////////////////
        function getReleaseAlerts(id, offset) {
            return $http({
                url: 'api/release-alerts/' + id + '/' + offset,
                method: 'GET'
            });
        }

        function getReleaseAlertsCount(id) {
            return $http({
                url: 'api/release-alerts-count/' + id,
                method: 'GET'
            });
        }

        function getAllReleaseAlerts() {
            return $http({
                url: 'api/release-all-alerts',
                method: 'GET'
            });
        }


    }
})();

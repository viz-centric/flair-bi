(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('AlertsDispatcherService', AlertsDispatcherService);

    alertsService.$inject = [];

    function AlertsDispatcherService($) {
        var releaseTotalAlertsCount=0;
        var service = {
            setReleaseTotalAlertsCount:setReleaseTotalAlertsCount,
            getReleaseTotalAlertsCount:getReleaseTotalAlertsCount
        };

        return service;

        ////////////////
        function setReleaseTotalAlertsCount(count) {
            releaseTotalAlertsCount=releaseTotalAlertsCount+count;
        }
        function getReleaseTotalAlertsCount(count) {
            return releaseTotalAlertsCount;
        }

    }
})();

(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('schedulerService', schedulerService);

    schedulerService.$inject = ['$http'];

    function schedulerService($http) {
        var service = {
            scheduleReport: scheduleReport,
            getScheduleReports:getScheduleReports
        };

        return service;

        ////////////////
        function scheduleReport(body) {
            return $http({
                url: 'api/schedule',
                method: 'POST',
                data: body
            });
        }

        function getScheduleReports(pageNo) {
            return $http({
                url: 'api/schedule/reports/'+pageNo,
                method: 'GET'
            });
        }

    }
})();

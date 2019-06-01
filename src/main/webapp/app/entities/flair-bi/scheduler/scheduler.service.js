(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('schedulerService', schedulerService);

    schedulerService.$inject = ['$http'];

    function schedulerService($http) {
        var service = {
            scheduleReport: scheduleReport,
            getSchedulerReportsAndEngineData:getSchedulerReportsAndEngineData,
            getScheduledReportsCount:getScheduledReportsCount,
            getScheduleReport:getScheduleReport,
            cancelScheduleReport:cancelScheduleReport,
            getSchedulerReports:getSchedulerReports
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

        function getSchedulerReportsAndEngineData(pageSize,page) {
            $http({
                url: 'api/schedule/reports/engine/'+pageSize+'/'+page,
                method: 'GET'
            });
        }

        function getSchedulerReports(pageSize,page) {
            return $http({
                url: 'api/schedule/reports/'+pageSize+'/'+page,
                method: 'GET'
            });
        }

        function getScheduledReportsCount() {
            return $http({
                url: 'api/schedule/reports/count',
                method: 'GET'
            });
        }

        function getScheduleReport(visualizationid) {
            return $http({
                url: 'api/schedule/'+visualizationid,
                method: 'GET'
            });
        }

        function cancelScheduleReport(visualizationid) {
            return $http({
                url: 'api/schedule/'+visualizationid,
                method: 'DELETE'
            });
        }

    }
})();

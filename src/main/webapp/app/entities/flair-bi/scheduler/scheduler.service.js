(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('schedulerService', schedulerService);

    schedulerService.$inject = ['$http'];

    function schedulerService($http) {
        var service = {
            scheduleReport: scheduleReport,
            getScheduledReportsCount:getScheduledReportsCount,
            getScheduleReport:getScheduleReport,
            cancelScheduleReport:cancelScheduleReport,
            getSchedulerReports:getSchedulerReports,
            executeNow:executeNow,
            getScheduleReportLogs:getScheduleReportLogs,
            filterScheduledReports:filterScheduledReports
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

        function executeNow(visualizationid){
            return $http({
                url: 'api/executeImmediate/'+visualizationid,
                method: 'GET'
            });
        }
        function getScheduleReportLogs(visualizationid,pageSize,page){
            return $http({
                url: 'api/schedule/report/logs/'+visualizationid+'/'+pageSize+'/'+page,
                method: 'GET'
            });   
        }
        function filterScheduledReports(userName,reportName,startDate,endDate,pageSize,page){
           return $http({
                url: 'api/schedule/searchReports/?userName='+userName+'&reportName='+reportName+'&startDate='+startDate+'&endDate='+endDate+'&pageSize='+pageSize+'&page='+page,
                method: 'GET'
            });
        }

    }
})();

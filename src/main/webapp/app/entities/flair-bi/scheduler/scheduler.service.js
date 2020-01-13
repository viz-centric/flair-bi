(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('schedulerService', schedulerService);

    schedulerService.$inject = ['$http'];

    function schedulerService($http) {
        var service = {
            scheduleReport: scheduleReport,
            getScheduledReportsCount: getScheduledReportsCount,
            getScheduleReport: getScheduleReport,
            cancelScheduleReport: cancelScheduleReport,
            getSchedulerReports: getSchedulerReports,
            executeNow: executeNow,
            getScheduleReportLogs: getScheduleReportLogs,
            filterScheduledReports: filterScheduledReports,
            getReportLogByMetaId: getReportLogByMetaId,
            channelParameters: channelParameters,
            createTeamConfig: createTeamConfig,
            updateTeamConfig: updateTeamConfig,
            createEmailConfig: createEmailConfig,
            updateEmailConfig: updateEmailConfig,
            getEmailConfig: getEmailConfig,
            getTeamConfig: getTeamConfig,
            deleteChannelConfig: deleteChannelConfig
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

        function getSchedulerReports(pageSize, page) {
            return $http({
                url: 'api/schedule/reports/' + pageSize + '/' + page,
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
                url: 'api/schedule/' + visualizationid,
                method: 'GET'
            });
        }

        function cancelScheduleReport(visualizationid) {
            return $http({
                url: 'api/schedule/' + visualizationid,
                method: 'DELETE'
            });
        }

        function executeNow(visualizationid) {
            return $http({
                url: 'api/executeImmediate/' + visualizationid,
                method: 'GET'
            });
        }
        function getScheduleReportLogs(visualizationid, pageSize, page) {
            return $http({
                url: 'api/schedule/report/logs/' + visualizationid + '/' + pageSize + '/' + page,
                method: 'GET'
            });
        }
        function filterScheduledReports(userName, reportName, startDate, endDate, pageSize, page) {
            return $http({
                url: 'api/schedule/searchReports/?userName=' + userName + '&reportName=' + reportName + '&startDate=' + startDate + '&endDate=' + endDate + '&pageSize=' + pageSize + '&page=' + page,
                method: 'GET'
            });
        }
        function getReportLogByMetaId(taskLogMetaId) {
            return $http({
                url: 'api/schedule/report/log/' + taskLogMetaId,
                method: 'GET'
            });
        }
        function channelParameters() {
            return $http({
                url: 'api/notification/channelParameters/?channel=""',
                method: 'GET'
            });
        }
        function createTeamConfig(body) {
            return $http({
                url: 'api/notification/createTeamConfig',
                method: 'POST',
                data: body
            });
        }
        function updateTeamConfig(body) {
            return $http({
                url: 'api/notification/updateTeamConfig',
                method: 'PUT',
                data: body
            });
        }
        function createEmailConfig(body) {
            return $http({
                url: 'api/notification/createEmailConfig',
                method: 'POST',
                data: body
            });
        }
        function updateEmailConfig(body) {
            return $http({
                url: 'api/notification/updateEmailConfig',
                method: 'PUT',
                data: body
            });
        }
        function getEmailConfig(id) {
            return $http({
                url: 'api/notification/getEmailConfig/?id=' + id + '',
                method: 'GET'
            });
        }
        function getTeamConfig(id) {
            return $http({
                url: 'api/notification/getTeamConfig/?id=' + id + '',
                method: 'GET'
            });
        }
        function deleteChannelConfig(id) {
            return $http({
                url: 'api/notification/deleteChannelConfig/?id=' + id + '',
                method: 'DELETE'
            });
        }
    }
})();

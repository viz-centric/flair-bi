import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .factory('schedulerService', schedulerService);

schedulerService.$inject = ['$http'];

function schedulerService($http) {
    var service = {
        scheduleReport: scheduleReport,
        getScheduleReports:getScheduleReports,
        getScheduledReportsCount:getScheduledReportsCount,
        getScheduleReport:getScheduleReport,
        cancelScheduleReport:cancelScheduleReport
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

    function getScheduleReports(pageSize,page) {
        $http({
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

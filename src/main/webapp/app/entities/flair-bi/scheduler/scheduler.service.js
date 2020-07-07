(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('schedulerService', schedulerService);

    schedulerService.$inject = ['$http','User','$q'];

    function schedulerService($http,User,$q) {
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
            disableTicketCreation: disableTicketCreation,
            searchUsers:searchUsers,
            getUserNameByEmail:getUserNameByEmail
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
        function filterScheduledReports(userName, reportName, startDate, endDate, pageSize, page,thresholdAlert) {
            return $http({
                url: 'api/schedule/searchReports/?userName=' + userName + '&reportName=' + reportName + '&startDate=' + startDate + '&endDate=' + endDate + '&pageSize=' + pageSize + '&page=' + page+'&thresholdAlert='+thresholdAlert,
                method: 'GET'
            });
        }
        function getReportLogByMetaId(taskLogMetaId) {
            return $http({
                url: 'api/schedule/report/log/' + taskLogMetaId,
                method: 'GET'
            });
        }
        function disableTicketCreation(schedulerTaskLogId) {
            return $http({
                url: 'api/notification/disableTicketCreationRequest/?schedulerTaskLogId=' + schedulerTaskLogId + '',
                method: 'GET'
            });
        }
        function searchUsers(q,limit){
            return $q(function(resolve, reject) {
                var promise=User.search({page: 0,size:limit,login: q}).$promise;
                promise.then(function (data) {
                    var retVal = data.map(function (item) {
                        return item.firstName + " " + item.email;
                    });
                    if (retVal) {
                    resolve(retVal);
                    } else {
                    reject(emptyList);
                    }
                },function(){
                    reject(emptyList);
                });
            });
        }

        function getUserNameByEmail(email){
            return $q(function(resolve, reject) {
                var promise=User.getUserNameByEmail({email: email}).$promise;
                promise.then(function (data) {
                    if (data.email) {
                        resolve(data.firstName + " " + data.email);
                    } else {
                        reject("");
                    }
                },function(){
                    reject("");
                });
            });
        }
    }
})();
(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('AuditsUtilsService', AuditsUtilsService);

    AuditsUtilsService.$inject = [];

    function AuditsUtilsService() {
        var service = {
            previousMonth: previousMonth,
            today: today
        };

        return service;

        function previousMonth() {
            var fromDate = new Date();
            if (fromDate.getMonth() === 0) {
                fromDate = new Date(fromDate.getFullYear() - 1, 11, fromDate.getDate());
            } else {
                fromDate = new Date(fromDate.getFullYear(), fromDate.getMonth() - 1, fromDate.getDate());
            }
            return fromDate;
        }

        function today() {
            // Today + 1 day - needed if the current day must be included
            var today = new Date();
            today.setDate(today.getDate() + 1);
            return today;
        }
    }
})();


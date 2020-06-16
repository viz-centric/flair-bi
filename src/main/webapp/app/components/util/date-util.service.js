(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('DateUtils', DateUtils);

    DateUtils.$inject = ['$filter','filterParametersService'];

    function DateUtils($filter,filterParametersService) {

        var service = {
            convertDateTimeFromServer: convertDateTimeFromServer,
            convertLocalDateFromServer: convertLocalDateFromServer,
            convertLocalDateToServer: convertLocalDateToServer,
            dateformat: dateformat,
            formatDate:formatDate,
            resetTimezone:resetTimezone,
            strToDate:strToDate,
            resetTimezoneDate:resetTimezoneDate
        };

        return service;

        function convertDateTimeFromServer(date) {
            if (date) {
                return new Date(date);
            } else {
                return null;
            }
        }

        function convertLocalDateFromServer(date) {
            if (date) {
                var dateString = date.split('-');
                return new Date(dateString[0], dateString[1] - 1, dateString[2]);
            }
            return null;
        }

        function convertLocalDateToServer(date) {
            if (date) {
                return $filter('date')(date, 'yyyy-MM-dd');
            } else {
                return null;
            }
        }

        function dateformat() {
            return 'yyyy-MM-dd';
        }

        function formatDate(date) {
            if (!date) {
                return null;
            }
            return filterParametersService.dateToString(date);
        }

        function resetTimezone(date) {
            if (!date) {
                return null;
            }
            date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
            return date;
        }

        function strToDate(date) {
            if (!date) {
                return null;
            }
            return Date.parse(date) ? new Date(date) : null;
        }

        function resetTimezoneDate(startDate) {
            return startDate;
        }
    }

})();

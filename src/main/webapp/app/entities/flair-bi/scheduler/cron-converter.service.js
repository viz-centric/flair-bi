(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('cronConverterService', cronConverterService);

    cronConverterService.$inject = ['$http'];

    function cronConverterService($http) {
        var DURATION_TYPE=[{'id':'minute','name':'Minutely'},{'id':'hour','name':'Hourly'},{'id':'day','name':'Daily'},{'id':'week','name':'Weekly'},{'id':'month','name':'Monthly'},{'id':'year','name':'Yearly'}];

        var DAY_LOOKUPS = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday'
        ];

        var MONTH_LOOKUPS = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ];

        var schedule = {
            "timezone": "Asia/Kolkata",
            "duration_type": "day",
            "minutes": "38",
            "hours": "13",
            "week_day": "thursday",
            "date": "27",
            "month_name": "september",
            "start_year": "2018",
            "start_month": "09",
            "start_day": "27"
        }
        var CHANNEL_LOOKUPS=['Email','Slack','Stride'];



        var service = {
            toScheduleObject: toScheduleObject,
            getChannels:getChannels,
            getDurationType:getDurationType,
            getMonths:getMonths,
            getDays:getDays
        };

        return service;

        ////////////////
        function toScheduleObject(cronExpression) {
            var cronArray = cronExpression.split('');
        }
        function getChannels(){
            return CHANNEL_LOOKUPS;
        }
        function getDurationType(){
            return DURATION_TYPE;
        }
        function getMonths(){
            return MONTH_LOOKUPS;
        }
        function getDays(){
            return DAY_LOOKUPS;
        }
    }
})();

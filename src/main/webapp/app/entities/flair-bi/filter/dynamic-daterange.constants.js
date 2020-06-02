(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .constant('DYNAMIC_DATE_RANGE_CONFIG',
            [
                {
                    title: 'Last 7 days',
                    period: {
                        months: 0,
                        days: 7
                    }
                },
                {
                    title: 'Last 30 days',
                    period: {
                        months: 1,
                        days: 0
                    }
                },
                {
                    title: 'Last 90 days',
                    period: {
                        months: 3,
                        days: 0
                    }
                },
                {
                    title: 'Last 365 days',
                    period: {
                        months: 12,
                        days: 0
                    }
                },
                {
                    title: 'Week to date',
                    toDate: 'isoWeek'
                },
                {
                    title: 'Month to date',
                    toDate: 'month'
                },
                {
                    title: 'Quarter to date',
                    toDate: 'quarter'
                },
                {
                    title: 'Year to date',
                    toDate: 'year'
                },
                {
                    title: 'Custom X days',
                    isCustom: true,
                    unit: 'days',
                    startDay: true
                },
                {
                    title: 'Custom X hours',
                    isCustom: true,
                    unit: 'hours',
                    startDay: false
                }
            ]);
})();

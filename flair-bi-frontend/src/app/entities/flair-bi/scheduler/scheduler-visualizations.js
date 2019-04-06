import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .constant('scheduler_visualizations', [
        'Bar Chart',
        'Pie Chart',
        'Line Chart',
        'Table'
    ]
    );
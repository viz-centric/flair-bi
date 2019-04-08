import angular from 'angular';

'use strict';
angular.module('flairbiApp')
    .run(chartConfiguration);

chartConfiguration.$inject = ['Chartjs']

function chartConfiguration(Chartjs) {
    Chartjs.defaults.global.responsive = true;
    Chartjs.defaults.global.maintainAspectRatio = false;
    Chartjs.defaults.global.elements.rectangle.borderWidth = 1;
}



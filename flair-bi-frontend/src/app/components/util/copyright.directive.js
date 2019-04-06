import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .component('copyright', copyright());


function copyright() {
    return {
        template: '<strong>Copyright</strong> Flair BI &copy; 2016-2017',
    };
}


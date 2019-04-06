import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .filter('split', split);

function split() {
    return splitFilter;

    function splitFilter(input, splitChar, splitIndex) {
        return input.split(splitChar)[splitIndex];
    }
}
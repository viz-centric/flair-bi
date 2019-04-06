import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .factory('Activate', Activate);

Activate.$inject = ['$resource'];

function Activate($resource) {
    var service = $resource('api/activate', {}, {
        'get': { method: 'GET', params: {}, isArray: false }
    });

    return service;
}


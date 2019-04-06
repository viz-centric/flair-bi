import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .factory('LogsService', LogsService);

LogsService.$inject = ['$resource'];

function LogsService($resource) {
    var service = $resource('management/logs', {}, {
        'findAll': { method: 'GET', isArray: true },
        'changeLevel': { method: 'PUT' }
    });

    return service;
}
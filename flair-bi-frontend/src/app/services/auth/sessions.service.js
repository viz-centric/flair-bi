import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .factory('Sessions', Sessions);

Sessions.$inject = ['$resource'];

function Sessions($resource) {
    return $resource('api/account/sessions/:series', {}, {
        'getAll': { method: 'GET', isArray: true }
    });
}
// import * as angular from 'angular';
// 'use strict';

// angular
//     .module('flairbiApp')
//     .factory('Sessions', Sessions);

Sessions.$inject = ['$resource'];

export const name = 'Sessions';
export function Sessions($resource) {
    return $resource('api/account/sessions/:series', {}, {
        'getAll': { method: 'GET', isArray: true }
    });
}
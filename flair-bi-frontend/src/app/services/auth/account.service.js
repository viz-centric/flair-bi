// import * as angular from 'angular';

// 'use strict';

// angular
//     .module('flairbiApp')
//     .factory('Account', Account);

Account.$inject = ['$resource'];

export const name = 'Account';
export function Account($resource) {
    var service = $resource('api/account', {}, {
        'get': {
            method: 'GET', params: {}, isArray: false,
            interceptor: {
                response: function (response) {
                    // expose response
                    return response;
                }
            }
        }
    });

    return service;
}


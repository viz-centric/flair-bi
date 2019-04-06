// import * as angular from 'angular';
// 'use strict';

// angular
//     .module('flairbiApp')
//     .factory('PasswordResetInit', PasswordResetInit);

PasswordResetInit.$inject = ['$resource'];

export const name = 'PasswordResetInit';
export function PasswordResetInit($resource) {
    var service = $resource('api/account/reset_password/init', {}, {});

    return service;
}
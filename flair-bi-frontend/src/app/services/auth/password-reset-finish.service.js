import * as angular from 'angular';

'use strict';

angular
    .module('flairbiApp')
    .factory('PasswordResetFinish', PasswordResetFinish);

PasswordResetFinish.$inject = ['$resource'];

function PasswordResetFinish($resource) {
    var service = $resource('api/account/reset_password/finish', {}, {});

    return service;
}

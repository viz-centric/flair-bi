// import * as angular from 'angular';
// 'use strict';

// angular
//     .module('flairbiApp')
//     .factory('LoginService', LoginService);

LoginService.$inject = ['$state'];

export const name = 'LoginService';
export function LoginService($state) {
    var service = {
        open: open
    };

    var modalInstance = null;

    var resetModal = function () {
        modalInstance = null;
    };

    return service;

    function open() {
        $state.go('login');
    }
}

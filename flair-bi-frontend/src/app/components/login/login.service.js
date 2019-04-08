import angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .factory('LoginService', LoginService);

LoginService.$inject = ['$state'];

function LoginService($state) {
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

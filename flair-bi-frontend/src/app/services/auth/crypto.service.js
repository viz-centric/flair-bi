import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .factory('CryptoService', CryptoService);

CryptoService.$inject = [];

function CryptoService() {
    var service = {
        UUIDv4: UUIDv4
    };

    return service;

    ////////////////

    function UUIDv4() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g,
            function (c) {
                return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16);
            }

        )
    }
}
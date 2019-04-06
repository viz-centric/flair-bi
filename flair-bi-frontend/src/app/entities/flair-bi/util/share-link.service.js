import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .factory('ShareLinkService', ShareLinkService);

ShareLinkService.$inject = ['$location'];

function ShareLinkService($location) {
    var service = {
        createLink: createLink
    };

    return service;

    ////////////////
    function createLink(path) {
        return $location.protocol() + '://' + $location.host() + ':' + $location.port() + '/#' + path;
    }
}
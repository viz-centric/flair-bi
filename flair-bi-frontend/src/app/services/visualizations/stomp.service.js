import angular from 'angular';

"use strict";

angular
    .module("flairbiApp")
    .service('StompClient', ['$location', function ($location) {
        var origin = location.origin;
        if ($location.protocol() === 'https') {
            origin = origin.replace('http://', 'https://');
        }
        var connectionUrl = origin + location.pathname + 'flair-ws';
        console.log('connectionUrl', connectionUrl);
        var sockClient = new SockJS(connectionUrl);
        return Stomp.over(sockClient);
    }]);

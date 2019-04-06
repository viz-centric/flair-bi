import * as angular from 'angular';
"use strict";

angular.module("flairbiApp").factory("proxyGrpcService", proxyGrpcService);

proxyGrpcService.$inject = [
    "$http",
    "stompClientService"
];

function proxyGrpcService(
    $http,
    stompClientService
) {
    function forwardCall(sourceId, body) {
        sendMsg(sourceId, body);
    }

    function sendMsg(sourceId, body) {
        console.log('sending message', body);
        stompClientService.send(
            "/flair-ws/fbi-engine-grpc/" +
            sourceId +
            "/query",
            {},
            JSON.stringify(body)
        );
    }

    function sampleDataCall(sourceId, body) {
        stompClientService.send(
            "/flair-ws/fbi-engine-grpc/" +
            sourceId +
            "/queryAll",
            {},
            JSON.stringify(body)
        );
    }

    return {
        forwardCall: forwardCall,
        sampleDataCall: sampleDataCall
    };
}
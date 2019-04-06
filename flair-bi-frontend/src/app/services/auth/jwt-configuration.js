import * as angular from 'angular';
"use strict";

angular.module("flairbiApp").config(Config);

Config.$inject = ["$httpProvider", "jwtOptionsProvider"];

function Config($httpProvider, jwtOptionsProvider) {
    jwtOptionsProvider.config({
        tokenGetter: [
            "AuthServerProvider",
            function (AuthServerProvider) {
                return AuthServerProvider.getToken();
            }
        ]
    });

    $httpProvider.interceptors.push("jwtInterceptor");
}
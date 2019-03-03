(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .config(httpConfig);

    httpConfig.$inject = ['$urlRouterProvider', '$httpProvider', 'httpRequestInterceptorCacheBusterProvider', '$urlMatcherFactoryProvider', '$locationProvider'];

    function httpConfig($urlRouterProvider, $httpProvider, httpRequestInterceptorCacheBusterProvider, $urlMatcherFactoryProvider, $location) {
        //Cache everything except rest api requests
        httpRequestInterceptorCacheBusterProvider.setMatchlist([/.*api.*/, /.*protected.*/], true);

        $urlRouterProvider.otherwise('/');

        $httpProvider.interceptors.push('errorHandlerInterceptor');
        $httpProvider.interceptors.push('authExpiredInterceptor');
        $httpProvider.interceptors.push('notificationInterceptor');
        // jhipster-needle-angularjs-add-interceptor JHipster will add new application http interceptor here

        $urlMatcherFactoryProvider.type('boolean', {
            name: 'boolean',
            decode: function (val) {
                return val === true || val === 'true';
            },
            encode: function (val) {
                return val ? 1 : 0;
            },
            equals: function (a, b) {
                return this.is(a) && a === b;
            },
            is: function (val) {
                return [true, false, 0, 1].indexOf(val) >= 0;
            },
            pattern: /bool|true|0|1/
        });
    }
})();

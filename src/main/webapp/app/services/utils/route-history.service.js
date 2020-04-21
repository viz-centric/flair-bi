(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('RouteHistoryService', RouteHistoryService);

    RouteHistoryService.$inject = ['$window'];

    function RouteHistoryService($window) {
        var service = {
            back: back
        };

        return service;

        ////////////////
        function back(){
            $window.history.back();
        } 
    }
})();

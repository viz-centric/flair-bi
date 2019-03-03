(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('proxyService', proxyService);

    proxyService.$inject = ['$http'];

    function proxyService($http) {
        var service = {
            forwardCall: forwardCall
        };

        return service;

        ////////////////
        function forwardCall(sourceId, body) {
            return $http({
                url: 'api/fbi-engine/' + sourceId + '/query',
                method: 'POST',
                data: body
            });
        }



    }
})();

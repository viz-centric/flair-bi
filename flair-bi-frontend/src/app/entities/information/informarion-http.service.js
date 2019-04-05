(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('informationHttpService', informationHttpService);

        informationHttpService.$inject = ['$http'];

    function informationHttpService($http) {
        var service = {
            query: query,
        };

        return service;

        ////////////////
        function query(isDesktop) {
            return $http({
                url: 'api/information/based-on-viewport/' + isDesktop,
                method: 'GET'
            });
        }

    }
})();

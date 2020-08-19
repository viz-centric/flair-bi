(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('headerPinFilterService', headerPinFilterService);

    headerPinFilterService.$inject = ['$http'];

    var favouriteFilter = false;

    function headerPinFilterService($http) {
        var service = {
            markPinFilter: markPinFilter,
            getPinFilter: getPinFilter
        };

        return service;

        ////////////////
        function markPinFilter(id, isPinFilter) {
            return $http({
                url: 'api/features/pinFilter/?id=' + id + '&pin=' + isPinFilter,
                method: 'PUT'
            });
        }

        function getPinFilter(id) {
            return $http({
                url: 'api/features/pinFilter/?pin=true&id=' + id,
                method: 'GET'
            });
        }
    }
})();
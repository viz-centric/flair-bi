(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('favouriteFilterService', favouriteFilterService);

    favouriteFilterService.$inject = ['$http'];

    var favouriteFilter = false;
    var pinFilter = false;

    function favouriteFilterService($http) {
        var service = {
            markFavouriteFilter: markFavouriteFilter,
            getFtavouriteFilter: getFtavouriteFilter,
            setFavouriteFilter: setFavouriteFilter,
            getFavouriteFilter: getFavouriteFilter,
            setPinFilter: setPinFilter,
            getPinFilter: getPinFilter
        };

        return service;

        ////////////////
        function markFavouriteFilter(id, isFavouriteFilter) {
            return $http({
                url: 'api/features/markFavouriteFilter/?favouriteFilter=' + isFavouriteFilter + '&id=' + id,
                method: 'PUT'
            });
        }

        function getFtavouriteFilter(id) {
            return $http({
                url: 'api/features/markFavouriteFilter/?favouriteFilter=true&id=' + id,
                method: 'GET'
            });
        }

        function setFavouriteFilter(flag) {
            favouriteFilter = flag
        }

        function getFavouriteFilter() {
            return favouriteFilter;
        }

        function setPinFilter(flag) {
            pinFilter = flag
        }

        function getPinFilter() {
            return pinFilter;
        }
    }
})();
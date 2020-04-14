(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .filter('cronstrue', cronstrueFilter);

    function cronstrueFilter() {
        return cronstrueFilter;

        ////////////////

        function cronstrueFilter(input) {
            return cronstrue.toString(input);
        }
    }
})();
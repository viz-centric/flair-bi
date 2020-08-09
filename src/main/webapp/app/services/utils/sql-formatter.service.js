(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('SqlFormatter', SqlFormatter);

    SqlFormatter.$inject = [];

    function SqlFormatter() {
        var service = {
            formatSql: formatSql
        };

        return service;

        ////////////////
        function formatSql(sqlQuery){
            return sqlQuery ? window.sqlFormatter.format(sqlQuery) : "";
        } 
    }
})();

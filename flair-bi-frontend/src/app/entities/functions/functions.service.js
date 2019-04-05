(function() {
    'use strict';
    angular
        .module('flairbiApp')
        .factory('Functions', Functions);

    Functions.$inject = ['$resource'];

    function Functions ($resource) {
        var resourceUrl =  'api/functions/:id';

        return $resource(resourceUrl, {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    if (data) {
                        data = angular.fromJson(data);
                    }
                    return data;
                }
            },
            'update': { method:'PUT' }
        });
    }
})();

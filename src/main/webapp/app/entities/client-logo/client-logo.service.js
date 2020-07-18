(function() {
    'use strict';
    angular
        .module('flairbiApp')
        .factory('ClientLogo', ClientLogo);

    ClientLogo.$inject = ['$resource'];

    function ClientLogo ($resource) {
        var resourceUrl =  'api/client-logos/:id';

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

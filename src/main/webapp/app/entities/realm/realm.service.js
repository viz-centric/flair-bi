(function() {
    'use strict';
    angular
        .module('flairbiApp')
        .factory('Realm', Realm);

    Realm.$inject = ['$resource'];

    function Realm ($resource) {
        var resourceUrl =  'api/realms/:id';

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

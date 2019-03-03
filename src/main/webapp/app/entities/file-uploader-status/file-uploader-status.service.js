(function() {
    'use strict';
    angular
        .module('flairbiApp')
        .factory('FileUploaderStatus', FileUploaderStatus);

    FileUploaderStatus.$inject = ['$resource'];

    function FileUploaderStatus ($resource) {
        var resourceUrl =  'api/file-uploader-statuses/:id';

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

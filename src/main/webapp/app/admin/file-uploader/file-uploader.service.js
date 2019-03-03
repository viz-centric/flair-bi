(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('uploadFileService', uploadFileService);

    uploadFileService.$inject = ['$http'];

    function uploadFileService($http) {
        var service = {
            uploadFile: uploadFile,
            getUploadedFiles:getUploadedFiles
        };

        return service;

        ////////////////
        function uploadFile(body,success, error) {
            return $http({
                url: 'api/file-upload',
                method: 'POST',
                data: body
            }).then(success, error);
        }

        function getUploadedFiles(){
            return $http({
                url: 'api/file-upload',
                method: 'GET'
            }).then(success, error);
        }
    }
})();

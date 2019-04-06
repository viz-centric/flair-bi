import * as angular from 'angular';

angular
    .module('flairbiApp')
    .factory('appPropertiesService', appPropertiesService);

appPropertiesService.$inject = ['$http'];

function appPropertiesService($http) {
    var service = {
        getMaxImageSize: getMaxImageSize,
        getProperties: getProperties
    };

    return service;

    ////////////////
    function getMaxImageSize() {
        return $http({
            url: 'api/max-image-size',
            method: 'GET'
        });
    }
    function getProperties() {
        return $http({
            url: 'api/properties',
            method: 'GET'
        });
    }

}

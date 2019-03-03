(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('screenDetectService', screenDetectService);

    screenDetectService.$inject = ['$http'];

    function screenDetectService($http) {
        var service = {
            isDesktop: isDesktop
        };

        return service;

        ////////////////
        function isDesktop(){
            if($(window).width()>990){
                return true;
            }else{
                return false;
            }
        } 
    }
})();

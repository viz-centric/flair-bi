(function () {
    /*jshint bitwise: false*/
    'use strict';

    angular
        .module('flairbiApp')
        .factory('ComponentDataService', ComponentDataService);

    function ComponentDataService() {
        var user = null;

        var service = {
            setUser: setUser,
            getUser: getUser
        };

        return service;

        function setUser(userTemp){
            user=userTemp;
        }

        function getUser(){
            return user;
        } 
    }
})();

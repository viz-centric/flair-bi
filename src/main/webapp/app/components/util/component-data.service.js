(function () {
    /*jshint bitwise: false*/
    'use strict';

    angular
        .module('flairbiApp')
        .factory('ComponentDataService', ComponentDataService);

    function ComponentDataService() {
        var userLogin = "";

        var service = {
            setUserLogin: setUserLogin,
            getUserLogin: getUserLogin
        };

        return service;

        function setUserLogin(login){
            userLogin=login;            
        }

        function getUserLogin(){
            return userLogin;
        } 
    }
})();

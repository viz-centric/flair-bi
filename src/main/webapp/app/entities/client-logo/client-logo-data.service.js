(function () {
    /*jshint bitwise: false*/
    'use strict';

    angular
        .module('flairbiApp')
        .factory('ClientLogoDataService', ClientLogoDataService);

    function ClientLogoDataService() {
        var clientLogo = null;

        var service = {
            setClientLogo: setClientLogo,
            getClientLogo: getClientLogo,
        };

        return service;

        function setClientLogo(clientLogoTemp){
            clientLogo = clientLogoTemp;
        }

        function getClientLogo(){
            return clientLogo;
        }
    }
})();

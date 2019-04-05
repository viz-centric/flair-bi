(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .factory("AuthServerProvider", AuthServerProvider);

    AuthServerProvider.$inject = ["$http", "$localStorage"];

    function AuthServerProvider($http, $localStorage) {
        var service = {
            getToken: getToken,
            hasValidToken: hasValidToken,
            login: login,
            logout: logout
        };

        return service;

        function getToken() {
            var token = $localStorage.authenticationToken;
            return token;
        }

        function hasValidToken() {
            var token = this.getToken();
            return !!token;
        }

        function login(credentials) {
            return $http
                .post("api/authenticate", credentials)
                .success(function(response) {
                    $localStorage.authenticationToken = response.id_token;
                    return response;
                });
        }

        function logout() {
            // logout from the server
            delete $localStorage.authenticationToken;
        }
    }
})();

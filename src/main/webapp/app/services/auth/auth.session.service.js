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
            return $localStorage.authenticationToken;
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
            return $http
                .get("api/logout")
                .success(function(response) {
                    delete $localStorage.authenticationToken;
                    return response;
                });
        }
    }
})();

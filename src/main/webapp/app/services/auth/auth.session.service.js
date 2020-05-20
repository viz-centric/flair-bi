(function () {
    "use strict";

    angular
        .module("flairbiApp")
        .factory("AuthServerProvider", AuthServerProvider);

    AuthServerProvider.$inject = ["$http", "$localStorage", '$q'];

    function AuthServerProvider($http, $localStorage, $q) {
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
                .then(function (response) {
                    $localStorage.authenticationToken = response.data.id_token;
                    return response;
                });
        }

        function logout() {
            console.log('logout requested');
            return $http
                .get("api/logout")
                .then(function (response) {
                    console.log('logout successful');
                    delete $localStorage.authenticationToken;
                    return response;
                });
        }
    }
})();

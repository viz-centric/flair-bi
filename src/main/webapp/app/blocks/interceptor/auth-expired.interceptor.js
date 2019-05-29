(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('authExpiredInterceptor', authExpiredInterceptor);

    authExpiredInterceptor.$inject = ['$rootScope', '$q', '$injector'];

    function authExpiredInterceptor($rootScope, $q, $injector) {
        var service = {
            responseError: responseError
        };

        return service;

        function responseError(response) {
            // If we have an unauthorized request we redirect to the login page
            // Don't do this check on the account API to avoid infinite loop
            if (response.status === 401 && angular.isDefined(response.data.path) && response.data.path.indexOf('/api/account') === -1) {
                var Auth = $injector.get('Auth');
                Auth.logout().then(afterLogout);
            }
            return $q.reject(response);
        }

        function afterLogout() {
            var to = $rootScope.toState;
            var params = $rootScope.toStateParams;
            var Auth = $injector.get('Auth');
            if (to.name !== 'accessdenied' && to.name !== 'login') {
                Auth.storePreviousState(to.name, params);
            }
            var LoginService = $injector.get('LoginService');
            LoginService.open();
        }
    }
})();

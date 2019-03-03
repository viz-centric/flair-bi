(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('Principal', Principal);

    Principal.$inject = ['$q', 'Account','AccountDispatch'];

    function Principal($q, Account,AccountDispatch) {
        var _identity,
            _authenticated = false;

        var service = {
            authenticate: authenticate,
            hasAnyAuthority: hasAnyAuthority,
            hasAuthority: hasAuthority,
            identity: identity,
            isAuthenticated: isAuthenticated,
            isIdentityResolved: isIdentityResolved,
            isInternalUser: isInternalUser
        };

        return service;

        function authenticate(identity) {
            _identity = identity;
            _authenticated = identity !== null;
        }

        function hasAnyAuthority(authorities) {
            if (!_authenticated || !_identity || !_identity.permissions) {
                return false;
            }

            for (var i = 0; i < authorities.length; i++) {
                if (_identity.permissions.indexOf(authorities[i]) !== -1) {
                    return true;
                }
            }

            return false;
        }

        function hasAuthority(authority) {
            if (!_authenticated) {
                return $q.when(false);
            }

            return this.identity().then(function (_id) {
                return _id.permissions && _id.permissions.indexOf(authority) !== -1;
            }, function () {
                return false;
            });
        }

        function isInternalUser(userType) {
            if (!_authenticated) {
                return $q.when(false);
            }

            return this.identity().then(function (_id) {
                return _id.userType === userType;
            }, function () {
                return false;
            });
        }

        function identity(force) {
            var deferred = $q.defer();

            if (force === true) {
                _identity = undefined;
            }

            // check and see if we have retrieved the identity data from the server.
            // if we have, reuse it by immediately resolving
            if (angular.isDefined(_identity)) {
                deferred.resolve(_identity);

                return deferred.promise;
            }

            // retrieve the identity data from the server, update the identity object, and then resolve.
            Account.get().$promise
                .then(getAccountThen)
                .catch(getAccountCatch);

            return deferred.promise;

            function getAccountThen(account) {
                AccountDispatch.saveAccount(account.data);
                _identity = account.data;
                _authenticated = true;
                deferred.resolve(_identity);
            }

            function getAccountCatch() {
                _identity = null;
                _authenticated = false;
                deferred.resolve(_identity);
            }
        }

        function isAuthenticated() {
            return _authenticated;
        }

        function isIdentityResolved() {
            return angular.isDefined(_identity);
        }
    }
})();

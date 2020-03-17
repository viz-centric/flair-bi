(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('Auth', Auth);

    Auth.$inject = ['$sessionStorage', '$q', '$translate', 'Principal', 'AuthServerProvider', 'Account', 'LoginService', 'Register', 'Activate', 'Password', 'PasswordResetInit', 'PasswordResetFinish'];

    function Auth($sessionStorage, $q, $translate, Principal, AuthServerProvider, Account, LoginService, Register, Activate, Password, PasswordResetInit, PasswordResetFinish) {
        var service = {
            activateAccount: activateAccount,
            changePassword: changePassword,
            createAccount: createAccount,
            getPreviousState: getPreviousState,
            login: login,
            logout: logout,
            resetPasswordFinish: resetPasswordFinish,
            resetPasswordInit: resetPasswordInit,
            resetPreviousState: resetPreviousState,
            storePreviousState: storePreviousState,
            updateAccount: updateAccount
        };

        return service;

        function activateAccount(key, callback) {
            var cb = callback || angular.noop;

            return Activate.get(key,
                function (response) {
                    return cb(response);
                },
                function (err) {
                    return cb(err);
                }.bind(this)).$promise;
        }

        function changePassword(newPassword, callback) {
            var cb = callback || angular.noop;

            return Password.save(newPassword, function () {
                return cb();
            }, function (err) {
                return cb(err);
            }).$promise;
        }

        function createAccount(account, callback) {
            var cb = callback || angular.noop;

            return Register.save(account,
                function () {
                    return cb(account);
                },
                function (err) {
                    this.logout();
                    return cb(err);
                }.bind(this)).$promise;
        }

        function login(credentials, callback) {
            var cb = callback || angular.noop;
            var deferred = $q.defer();

            AuthServerProvider.login(credentials)
                .then(loginThen)
                .catch(function (err) {
                    this.logout();
                    deferred.reject(err);
                    return cb(err);
                }.bind(this));

            function loginThen(data) {
                Principal.identity(true).then(function (account) {
                    // After the login the language will be changed to
                    // the language selected by the user during his registration
                    if (account !== null) {
                        $translate.use(account.langKey).then(function () {
                            $translate.refresh();
                        });
                    }
                    deferred.resolve(data);
                });
                return cb();
            }

            return deferred.promise;
        }


        function logout() {
            var promise = AuthServerProvider.logout();
            Principal.authenticate(null);
            return promise;
        }

        function resetPasswordFinish(keyAndPassword, callback) {
            var cb = callback || angular.noop;

            return PasswordResetFinish.save(keyAndPassword, function () {
                return cb();
            }, function (err) {
                return cb(err);
            }).$promise;
        }

        function resetPasswordInit(mail, callback) {
            var cb = callback || angular.noop;

            return PasswordResetInit.save(mail, function () {
                return cb();
            }, function (err) {
                return cb(err);
            }).$promise;
        }

        function updateAccount(account, callback) {
            var cb = callback || angular.noop;

            return Account.save(account,
                function () {
                    return cb(account);
                },
                function (err) {
                    return cb(err);
                }.bind(this)).$promise;
        }

        function getPreviousState() {
            var previousState = $sessionStorage.previousState;
            return previousState;
        }

        function resetPreviousState() {
            delete $sessionStorage.previousState;
        }

        function storePreviousState(previousStateName, previousStateParams) {
            var previousState = {
                "name": previousStateName,
                "params": previousStateParams
            };
            $sessionStorage.previousState = previousState;
        }
    }
})();

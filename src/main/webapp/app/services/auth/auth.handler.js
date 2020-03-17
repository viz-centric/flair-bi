(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('authHandler', authHandler);

    authHandler.$inject = ['$transitions', 'Principal', '$sessionStorage'];
    function authHandler($transitions, Principal, $sessionStorage) {
        var service = {
            initialize: initialize
        };

        return service;

        ////////////////
        function initialize() {
            var notAuthenticatedStates = {
                to: function (state) {
                    return state.data && state.data.notAuthenticated;
                }
            },
                authenticatedStates = {
                    to: function (state) {
                        return !state.data || (state.data && !state.data.public && !state.data.notAuthenticated);
                    }
                },
                externalStates = {
                    from: function (state) {
                        return (!state || !state.name) && $sessionStorage.previousState;
                    }
                },
                authorizedStates = {
                    to: function (state) {
                        return state.data &&
                            state.data.authorities &&
                            state.data.authorities.length > 0;
                    }
                };
            $transitions.onBefore(authenticatedStates, function (transition) {
                return wrapTransition(transition, statesAuth);
            })
            $transitions.onBefore(notAuthenticatedStates, function (transition) {
                return wrapTransition(transition, notAuthenticatedTransition);
            });
            $transitions.onBefore(externalStates, function (transition) {
                return wrapTransition(transition, recoverPreviousState);
            })
            $transitions.onBefore(authorizedStates, function (transition) {
                return wrapTransition(transition, authorizeTransition);
            });
        }

        function wrapTransition(transition, func) {
            if (Principal.isIdentityResolved()) {
                return func(transition, Principal.isAuthenticated());
            } else {
                return Principal.identity().then(function () {
                    return func(transition, Principal.isAuthenticated());
                });
            }
        }

        function statesAuth(transition, isAuthenticated) {
            var $state = transition.router.stateService;
            if (!isAuthenticated) {
                return $state.target('accessdenied');
            }
        }

        /**
         * 
         * @param {Transition} transition 
         * @param {Boolean} isAuthenticated 
         */
        function recoverPreviousState(transition, isAuthenticated) {
            // recover and clear previousState after external login redirect (e.g. oauth2)
            if (isAuthenticated) {
                var $sessionStorage = transition.injector().get('$sessionStorage');
                var previousState = $sessionStorage.previousState;
                delete $sessionStorage.previousState;
                $state.target(previousState.name, previousState.params);
            }
        }

        /**
         * 
         * @param {Transition} _transition 
         * @param {Boolean} isAuthenticated 
         */
        function notAuthenticatedTransition(_transition, isAuthenticated) {
            // prevent the navigation when logged in
            return !isAuthenticated;
        }

        /**
         * 
         * @param {Transition} transition 
         * @param {Boolean} isAuthenticated 
         */
        function authorizeTransition(transition, isAuthenticated) {
            var Principal = transition.injector().get('Principal'),
                LoginService = transition.injector().get('LoginService'),
                $sessionStorage = transition.injector().get('$sessionStorage'),
                $state = transition.router.stateService;

            if (!Principal.hasAnyAuthority(transition.$to().data.authorities)) {
                if (isAuthenticated) {
                    // user is signed in but not authorized for desired state
                    $state.target('accessdenied');
                } else {
                    // user is not authenticated. stow the state they wanted before you
                    // send them to the login service, so you can return them when you're done
                    var fromState = transition.$from();
                    if (fromState) {
                        var previousState = {
                            "name": fromState.name,
                            "params": fromState.params
                        };
                        $sessionStorage.previousState = previousState;
                    }
                    // now, send them to the signin state so they can log in
                    $state.target('accessdenied').then(function () {
                        LoginService.open();
                    });
                }
            }
        }
    }
})();
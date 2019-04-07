// import * as angular from 'angular';
// 'use strict';

// angular
//     .module('flairbiApp')
//     .controller('LoginController', LoginController);

LoginController.$inject = ['Auth', '$rootScope', '$state', 'appPropertiesService'];

export const name = 'LoginController';
export function LoginController(Auth, $rootScope, $state, appPropertiesService) {
    var vm = this;

    vm.authenticationError = false;
    vm.cancel = cancel;
    vm.credentials = {};
    vm.login = login;
    vm.password = null;
    vm.register = register;
    vm.rememberMe = true;
    vm.requestResetPassword = requestResetPassword;
    vm.username = null;
    vm.loading = false;

    activate();

    ////////////////

    function activate() { }

    function cancel() {
        vm.credentials = {
            username: null,
            password: null,
            rememberMe: true
        };
        vm.authenticationError = false;
    }

    function login(_) {
        vm.loading = true;
        Auth.login({
            username: vm.username,
            password: vm.password,
            rememberMe: vm.rememberMe
        }).then(function () {
            vm.authenticationError = false;
            if ($state.current.name === 'register' || $state.current.name === 'activate' ||
                $state.current.name === 'finishReset' || $state.current.name === 'requestReset' ||
                $state.current.name === 'login') {
                $state.go('home');
            }

            $rootScope.$broadcast('authenticationSuccess');
            getApplicationSettings();

            // previousState was set in the authExpiredInterceptor before being redirected to login modal.
            // since login is successful, go to stored previousState and clear previousState
            if (Auth.getPreviousState() && Auth.getPreviousState().name !== 'login') {
                var previousState = Auth.getPreviousState();
                Auth.resetPreviousState();
                $state.go(previousState.name, previousState.params);
            } else {
                // if there is not saved state go home
                $state.go('home');
            }
            vm.loading = false;
        }).catch(function () {
            vm.authenticationError = true;
            vm.loading = false;
        });
    }

    function register() {
        $state.go('register');
    }

    function requestResetPassword() {
        $state.go('requestReset');
    }

    function getApplicationSettings() {
        appPropertiesService.getProperties().then(onPropertiesServiceSuccess, onPropertiesServiceError);
    }

    function onPropertiesServiceSuccess(result) {
        $rootScope.appProperies = result.data;
    }

    function onPropertiesServiceError(_) {
    }
}
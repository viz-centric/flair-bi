import * as angular from 'angular';
import flairBiLogo from 'content/svgs/flair-logo.svg';
import oktaLogo from 'content/svgs/okta-logo-v2.svg';

'use strict';
angular
    .module('flairbiApp')
    .controller('LoginController', LoginController);

LoginController.$inject = ['$scope', 'Auth', '$rootScope', '$state', 'appPropertiesService'];

function LoginController($scope, Auth, $rootScope, $state, appPropertiesService) {
    var vm = this;
    vm.flairBiLogo = flairBiLogo;
    vm.oktaLogo = oktaLogo;
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
    vm.rememberMe = true;
    vm.setRememberMe = setRememberMe;

    activate();

    ////////////////

    function activate() {
    }

    function cancel() {
        vm.credentials = {
            username: null,
            password: null,
            rememberMe: vm.rememberMe
        };
        vm.authenticationError = false;
    }

    function login(event) {
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

    function onPropertiesServiceError(error) {
    }

    function setRememberMe() {
        vm.rememberMe = !vm.rememberMe;
    }
}

angular
    .module('flairbiApp')
    .controller('LoginController', LoginController);

LoginController.$inject = ['$scope', 'Auth', '$rootScope', '$state', 'appPropertiesService'];

function LoginController($scope, Auth, $rootScope, $state, appPropertiesService) {
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
    vm.rememberMe = true;
    vm.setRememberMe = setRememberMe;

    activate();

    ////////////////

    function activate() {
    }

    function cancel() {
        vm.credentials = {
            username: null,
            password: null,
            rememberMe: vm.rememberMe
        };
        vm.authenticationError = false;
    }

    function login(event) {
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

    function onPropertiesServiceError(error) {
    }

    function setRememberMe() {
        vm.rememberMe = !vm.rememberMe;
    }
}

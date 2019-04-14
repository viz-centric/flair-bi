import angular from 'angular';
import logo from 'content/svgs/flairbi-logo-no-text.svg'
'use strict';

angular
    .module('flairbiApp')
    .controller('TopNavBarController', TopNavBarController);

TopNavBarController.$inject = ['$scope', '$state', 'Auth', 'Principal', 'PERMISSIONS'];

function TopNavBarController($scope, $state, Auth, Principal, PERMISSIONS) {
    var vm = this;
    vm.logo = logo;
    vm.$state = $state;
    vm.logout = logout;
    vm.mobileNavidationSlide = false;
    vm.activateMobileNavigation = activateMobileNavigation;
    vm.administrationPermissions = [
        PERMISSIONS.READ_USER_MANAGEMENT,
        PERMISSIONS.READ_APPLICATION_METRICS,
        PERMISSIONS.READ_HEALTH_CHECKS,
        PERMISSIONS.READ_CONFIGURATION,
        PERMISSIONS.READ_AUDITS,
        PERMISSIONS.READ_LOGS,
        PERMISSIONS.READ_API,
        PERMISSIONS.READ_PERMISSION_MANAGEMENT
    ];
    vm.hasAnyOfAdministrationPermission = Principal.hasAnyAuthority(vm.administrationPermissions);
    activate();
    getAccount();

    function logout() {
        Auth.logout();
        $state.go('login');
    }

    function getAccount() {
        Principal.identity().then(function (account) {
            vm.account = account;
            vm.isAuthenticated = Principal.isAuthenticated;
        });
    }

    function activateMobileNavigation() {
        vm.mobileNavidationSlide = !vm.mobileNavidationSlide;
    }

    $scope.$on('authenticationSuccess', function () {
        getAccount();
    });

    ////////////////

    function activate() {
    }
}

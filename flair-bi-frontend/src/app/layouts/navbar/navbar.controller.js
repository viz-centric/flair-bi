// import * as angular from 'angular';
// 'use strict';

// angular
//     .module('flairbiApp')
//     .controller('NavbarController', NavbarController);

NavbarController.$inject = ['$scope', '$state', 'Auth',
    'Principal', 'ProfileService', 'LoginService',
    'Visualizations',
    'Views', '$stateParams', '$rootScope', 'ExecutorFactory', 'PERMISSIONS'
];

export const name = 'NavbarController';
export function NavbarController($scope, $state, Auth,
    Principal, ProfileService, LoginService,
    Visualizations,
    Views, $stateParams, $rootScope, ExecutorFactory, PERMISSIONS) {
    var vm = this;
    getAccount();
    vm.account = null;
    vm.isNavbarCollapsed = true;
    vm.permissions = PERMISSIONS;
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
    vm.$state = $state;
    vm.hasAnyOfAdministrationPermission = Principal.hasAnyAuthority(vm.administrationPermissions);

    $scope.$on('authenticationSuccess', function () {
        getAccount();
    });


    ProfileService.getProfileInfo().then(function (response) {
        vm.inProduction = response.inProduction;
        vm.swaggerEnabled = response.swaggerEnabled;
    });

    vm.logout = logout;
    vm.toggleNavbar = toggleNavbar;
    vm.collapseNavbar = collapseNavbar;

    function logout() {
        collapseNavbar();
        Auth.logout();
        $state.go('login');
    }

    function toggleNavbar() {
        vm.isNavbarCollapsed = !vm.isNavbarCollapsed;
    }

    function collapseNavbar() {
        vm.isNavbarCollapsed = true;
    }

    function getAccount() {
        Principal.identity().then(function (account) {
            vm.account = account;
            vm.isAuthenticated = Principal.isAuthenticated;
        });
    }

}
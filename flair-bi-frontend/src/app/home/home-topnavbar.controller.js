import angular from 'angular';
import logo from 'content/svgs/flairbi-logo-no-text.svg';

"use strict";

angular
    .module("flairbiApp")
    .controller("HomeTopNavBarController", HomeTopNavBarController);

HomeTopNavBarController.$inject = [
    "PERMISSIONS",
    "Principal",
    "$state",
    "$stateParams"
];

function HomeTopNavBarController(PERMISSIONS, Principal, $state, $stateParams) {
    var vm = this;

    vm.logo = logo;

    vm.search = search;
    vm.reset = reset;
    vm.showSearchCancel = showSearchCancel;
    vm.searchCriteria = $stateParams.searchCriteria;
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
    vm.hasAnyOfAdministrationPermission = Principal.hasAnyAuthority(
        vm.administrationPermissions
    );
    vm.floatSearch = floatSearch;
    vm.isSearchPage = isSearchPage;

    activate();

    ////////////////

    function activate() {
        if (vm.searchCriteria && isSearchPage()) {
            floatSearch();
        }
    }

    function isSearchPage() {
        if ($state.current.name === 'searched-results') {
            return true;
        } else {
            return false;
        }
    }

    function floatSearch() {
        $(".search-right-icon").addClass("search-right-icon-active");
        $(".home-header-search-box").show();
        $(".search-right-icon").hide();
    }

    function search() {
        $state.go('searched-results', {searchCriteria: vm.searchCriteria});
    }

    function reset() {
        vm.searchCriteria = null;
    }

    function showSearchCancel() {
        return !!vm.searchCriteria;
    }

    function activateMobileNavigation() {
        vm.mobileNavidationSlide = !vm.mobileNavidationSlide;
    }
}

(function () {
    "use strict";

    angular
        .module('flairbiApp')
        .component('homeTopNavComponent', {
            templateUrl: 'app/home/home-topnavbar.component.html',
            controller: HomeTopNavBarController,
            controllerAs: 'vm'
        });


    HomeTopNavBarController.$inject = [
        "PERMISSIONS",
        "Principal",
        "$state",
        "$stateParams",
        "$scope",
        "ClientLogoDataService"
    ];

    function HomeTopNavBarController(PERMISSIONS, Principal, $state, $stateParams,$scope,ClientLogoDataService) {
        var vm = this;

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

        vm.floatSearch = floatSearch;
        vm.isSearchPage = isSearchPage;

        vm.$onInit = function () {
            vm.hasAnyOfAdministrationPermission = Principal.hasAnyAuthority(
                vm.administrationPermissions
            );
            activate();
        }



        ////////////////

        function activate() {
            if (vm.searchCriteria && isSearchPage()) {
                floatSearch();
            }
            registerSetClientLogo();
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
            $(".home-header-search-box input").focus();
            $(".search-right-icon").hide();
        }

        function search() {
            $state.go('searched-results', { searchCriteria: vm.searchCriteria });
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

        function registerSetClientLogo() {
            var unsubscribe = $scope.$on('flairbiApp:set-client-logo', function () {
                vm.clientLogo = ClientLogoDataService.getClientLogo();
            });
            $scope.$on('$destroy', unsubscribe);
        }
    }
})();

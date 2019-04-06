import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .controller('ExplorationNavController', ExplorationNavController);

ExplorationNavController.$inject = ['$scope', '$state', 'Auth', 'Principal', 'ProfileService', 'LoginService',
    'Visualizations', 'Measures', 'Dimensions', 'Views', '$stateParams', '$rootScope', 'modalInfo', 'Datasources', 'Explorer'];

function ExplorationNavController($scope, $state, Auth, Principal, ProfileService, LoginService, Visualizations, Measures, Dimensions, Views, $stateParams, $rootScope, modalInfo,
    Datasources, Explorer) {
    var vm = this;
    initializeMetisMenu();
    getAccount();
    vm.account = null;
    vm.isNavbarCollapsed = true;
    $rootScope.fieldList = [];
    $scope.$on('authenticationSuccess', function () {
        getAccount();
    });

    ProfileService.getProfileInfo().then(function (response) {
        vm.inProduction = response.inProduction;
        vm.swaggerEnabled = response.swaggerEnabled;
    });

    vm.login = login;
    vm.logout = logout;
    vm.toggleNavbar = toggleNavbar;
    vm.collapseNavbar = collapseNavbar;
    vm.$state = $state;
    vm.viewId = $state.params.id;

    vm.dataSourceId = Number($state.params.sid);

    // loadVisualizations()
    // loadMeasures()
    // loadDimensions()

    if ($state.current.name == "flairbi") {
        if (window.location.href.indexOf('?') < 0) {
            window.location.href = window.location.href + '?load';
        }
    }

    $scope.addVisual = function (id) {
        $rootScope.$broadcast('buttonPressedEvent', id);
    }


    $rootScope.$on('$stateChangeStart',
        function (event, toState, toParams, fromState, fromParams, options) {
            if (toState.name == "flairbi") {
                var urlsplit = window.location.href.split('#');
                window.location.href = urlsplit[0] + '#/flairbi/' + toParams.id + '/' + toParams.sid;
                location.reload(true);
            }
        })

    if ($state.current.name == "flairbi") {
        vm.activateBuilder = 1;
    } else {
        vm.activateBuilder = 0;
    }

    $scope.refreshDim = function () {
        loadDimensions()
        location.reload(true);
    }

    $scope.refreshMes = function () {
        loadMeasures()
    }

    function loadVisualizations() {
        Visualizations.query(function (result) {
            vm.visualizations = result;
            vm.searchQuery = null;
        });
    }

    loadDatasources();

    function loadDatasources() {
        Datasources.query(function (result) {
            vm.datasources = result;
            vm.searchQuery = null;
        });
    }

    function loadMeasures() {
        Measures.query(function (result) {
            vm.measures = result;
            vm.searchQuery = null;
        });
    }

    function loadDimensions() {
        Dimensions.query(function (result) {
            vm.dimensions = result;
            vm.searchQuery = null;
        });
    }

    $scope.displayInfo = function (id) {
        $rootScope.dataExplorerSource = id;
        $scope.displayFields = vm.dimensions.length > 0 || vm.measures.length > 0 ? true : false;
        $scope.fields = [];
        for (var s = 0; s < vm.datasources.length; s++) {
            if (vm.datasources[s].id == id) {
                $scope.selectedSourceName = vm.datasources[s].name;
                break;
            }
        }
        for (s = 0; s < vm.dimensions.length; s++) {
            if (vm.dimensions[s].dimensionDatasource.id == id) {
                $scope.fields.push({ name: vm.dimensions[s].name.toUpperCase(), icon: "fa fa-tag", id: vm.dimensions[s].id });
            }
        }
        for (s = 0; s < vm.measures.length; s++) {
            if (vm.measures[s].measureDatasource.id == id) {
                $scope.fields.push({ name: vm.measures[s].name.toUpperCase(), icon: "fa fa-percent", id: vm.measures[s].id });
            }
        }
    }

    function login() {
        collapseNavbar();
        LoginService.open();
    }

    function logout() {
        collapseNavbar();
        Auth.logout();
        $state.go('home');
    }

    function toggleNavbar() {
        vm.isNavbarCollapsed = !vm.isNavbarCollapsed;
    }

    function collapseNavbar() {
        vm.isNavbarCollapsed = true;
    }

    function initializeMetisMenu() {
        $("#side-menu").metisMenu();
    }

    function getAccount() {
        Principal.identity().then(function (account) {
            vm.account = account;
            vm.isAuthenticated = Principal.isAuthenticated;
        });
    }

}
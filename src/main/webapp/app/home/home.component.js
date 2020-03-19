(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('homeComponent', {
            templateUrl: 'app/home/home.component.html',
            controller: HomeController,
            controllerAs: 'vm'
        });


    HomeController.$inject = ['$scope', 'Principal',
        '$state', 'Information', 'alertsService', 'screenDetectService', 'adminListService',
        'AccountDispatch', 'proxyGrpcService', 'AlertsDispatcherService',
        '$transitions'
    ];

    function HomeController($scope, Principal,
        $state, Information, alertsService, screenDetectService, adminListService,
        AccountDispatch, proxyGrpcService, AlertsDispatcherService,
        $transitions) {
        var vm = this;
        vm.account = null;
        vm.isAuthenticated = null;
        vm.recentlyCreatedViews = [];
        vm.expandTile = expandTile;
        vm.toggleAlerts = toggleAlerts;
        vm.isTileVisible = isTileVisible;
        vm.allReleaseAlerts = [];
        vm.reports = [];
        vm.alertTab = '';

        var tileMapping = {
            0: 'home',
            1: 'home.dashboards',
            2: 'home.views',
            3: 'home.datasources',
            4: 'home.reports',
            5: 'home.bookmarks',
            6: 'home',
            7: 'home.recentAccessViews',
            8: 'home.recentAccessBookmarks'
        },
            reverseTileMapping = reverse(tileMapping),
            tileUpdateHookUnsub = angular.noop,
            authenticationSuccessUnsub = angular.noop;


        function reverse(obj) {
            var newObj = {};
            for (var property in obj) {
                if (obj.hasOwnProperty(property)) {
                    newObj[obj[property]] = parseInt(property);
                }
            }
            return newObj;
        }

        function updateTile(state) {
            vm.currentTile = {
                id: reverseTileMapping[state.name],
                state: state.name
            };
        }

        vm.$onInit = function () {
            tileUpdateHookUnsub = $transitions.onEnter({ to: 'home.**' }, function (transition) {
                updateTile(transition.to());
            });
            authenticationSuccessUnsub = $scope.$on('authenticationSuccess', function () {
                getAccount();
            });
            updateTile($state.current);
            activate();
        }
        vm.$onDestroy = function () {
            tileUpdateHookUnsub();
            authenticationSuccessUnsub();
        };

        function toggleAlerts(alertTab) {
            vm.alertTab = alertTab;
            if (vm.alertTab == 'notifications') {
                getScheduledReports();
            } else {
                getReleaseAlerts();
            }
        }

        function expandTile(info) {
            var nextTile = {
                id: info.id || 0,
                state: tileMapping[info.id] || 'home'
            }
            vm.currentTile = vm.currentTile.id != nextTile.id ? nextTile : {
                id: 0,
                state: 'home'
            };
            $state.go(vm.currentTile.state);
        }


        function getAccount() {
            vm.account = AccountDispatch.getAccount();
            vm.isAuthenticated = Principal.isAuthenticated;
            vm.isAdmin = AccountDispatch.isAdmin();
        }

        function activate() {
            loadInformation();
            getAccount();
            vm.menuItems = adminListService.getHomeList();
            registerOnSetTotalReleaseAlerts();
        }

        function getReleaseAlerts() {
            alertsService.getAllReleaseAlerts().then(function (result) {
                vm.allReleaseAlerts = result.data;
                vm.totalReleaseAlerts = 0;
                vm.menuItems = adminListService.getHomeList();
            });
        }

        function getScheduledReports() {
            proxyGrpcService.getSchedulerReportsAndEngineData(3, 0);
        }

        function loadInformation() {
            vm.information = Information.query();
        }

        function isTileVisible(flag) {
            if (screenDetectService.isDesktop()) {
                return flag ? 'block' : 'none';
            } else {
                return !flag ? 'block' : 'none';
            }
        }

        function registerOnSetTotalReleaseAlerts() {
            var unsubscribe = $scope.$on(
                "flairbiApp:setTotalReleaseAlerts",
                function () {
                    vm.totalReleaseAlerts = AlertsDispatcherService.getReleaseTotalAlertsCount();
                }
            );
            $scope.$on("$destroy", unsubscribe);
        }


    }
})();

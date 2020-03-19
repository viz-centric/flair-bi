(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('homeComponent', {
            templateUrl: 'app/home/home.component.html',
            controller: HomeController,
            controllerAs: 'vm'
        });


    HomeController.$inject = ['$scope', 'Principal', 'LoginService',
        '$state', 'Information', 'alertsService', 'screenDetectService', 'adminListService',
        'AccountDispatch', 'proxyGrpcService', 'AlertsDispatcherService', 'ViewWatches'
    ];

    function HomeController($scope, Principal, LoginService,
        $state, Information, alertsService, screenDetectService, adminListService,
        AccountDispatch, proxyGrpcService, AlertsDispatcherService, ViewWatches) {
        var vm = this;
        vm.account = null;
        vm.isAuthenticated = null;
        vm.login = LoginService.open;
        vm.register = register;
        vm.recentlyCreatedViews = [];
        vm.expandTile = expandTile;
        vm.toggleAlerts = toggleAlerts;
        vm.isTileVisible = isTileVisible;
        vm.allReleaseAlerts = [];
        vm.reports = [];
        vm.alertTab = '';
        vm.expandFlairInsight = { id: 4 };

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
            reverseTileMapping = reverse(tileMapping);


        function reverse(obj) {
            var newObj = {};
            for (var property in obj) {
                if (obj.hasOwnProperty(property)) {
                    newObj[obj[property]] = parseInt(property);
                }
            }
            return newObj;
        }

        vm.$onInit = function () {
            vm.currentTile = {
                id: reverseTileMapping[$state.current.name],
                state: $state.current.name
            };
            vm.viewWatches = ViewWatches.query({
                page: 0,
                size: 5,
                sort: 'watchTime,desc'
            });
            activate();
        }

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
            $scope.$on('authenticationSuccess', function () {
                getAccount();
            });

            getAccount();
            angular.element($("#on-recently-box1")).triggerHandler("click");
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

        function register() {
            $state.go('register');
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

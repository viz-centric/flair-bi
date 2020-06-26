(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller("DashboardOverviewController", DashboardOverviewController);

    DashboardOverviewController.$inject = [
        "$scope",
        "$rootScope",
        "$state",
        "$stateParams",
        "previousState",
        "DataUtils",
        "entity",
        "Dashboards",
        "Views",
        "AccountDispatch",
        "paginationConstants",
    ];

    function DashboardOverviewController(
        $scope,
        $rootScope,
        $state,
        $stateParams,
        previousState,
        DataUtils,
        entity,
        Dashboards,
        Views,
        AccountDispatch,
        paginationConstants
    ) {
        var vm = this;

        vm.dashboards = entity;
        vm.selectedDashboard = entity;
        vm.previousState = previousState.name;
        vm.byteSize = DataUtils.byteSize;
        vm.openFile = DataUtils.openFile;
        vm.views = [];
        vm.showWaterMark = true;
        vm.loadPage = loadPage;
        vm.page = 1;
        vm.itemsPerPage = 10;



        activate();

        function activate() {
            loadAll();
            var unsubscribe = $rootScope.$on("flairbiApp:viewDelete", function(
                event,
                result
            ) {
                loadAll();
            });
            $scope.$on("$destroy", unsubscribe);


            vm.canDeleteDashboard = AccountDispatch.hasAuthority(
                "DELETE_" + vm.selectedDashboard.id + "_DASHBOARD"
            );

            vm.canRequestDashboardRelease = AccountDispatch.hasAuthority(
                "REQUEST-PUBLISH_" + vm.selectedDashboard.id + "_DASHBOARD"
            );

            vm.canEdit = AccountDispatch.hasAuthority(
                "WRITE_" + vm.selectedDashboard.id + "_DASHBOARD"
            );

            var unsub = $rootScope.$on("flairbiApp:dashboardsUpdate", function(
                event,
                result
            ) {
                vm.dashboards = result;
            });
            $scope.$on("$destroy", unsub);
        }

        function loadAll() {
            Views.query(
                {
                    viewDashboard: $stateParams.id,
                    page: vm.page - 1,
                    size: vm.itemsPerPage,
                    paginate: true
                },
                function(result,headers) {
                    vm.views = result;
                    vm.showWaterMark = vm.views.length > 0;
                    vm.totalItems = headers('X-Total-Count');
                }
            );
        }

        function loadPage(page) {
            vm.page = page;
            loadAll();
        }
    }
})();

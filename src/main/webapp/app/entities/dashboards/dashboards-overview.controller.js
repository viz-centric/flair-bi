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
        "Principal",
        "AccountDispatch"
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
        Principal,
        AccountDispatch
    ) {
        var vm = this;

        vm.dashboards = entity;
        vm.selectedDashboard = entity;
        vm.previousState = previousState.name;
        vm.byteSize = DataUtils.byteSize;
        vm.openFile = DataUtils.openFile;
        vm.views = [];
        vm.showWaterMark = true;

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
                    viewDashboard: $stateParams.id
                },
                function(result) {
                    vm.views = result;
                    vm.showWaterMark = vm.views.length > 0;
                }
            );
        }
    }
})();

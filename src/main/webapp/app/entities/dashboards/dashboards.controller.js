(function () {
    "use strict";

    angular
        .module("flairbiApp")
        .controller("DashboardsController", DashboardsController);

    DashboardsController.$inject = [
        "DataUtils",
        "Dashboards",
        "PERMISSIONS"
    ];

    function DashboardsController(
        DataUtils,
        Dashboards,
        PERMISSIONS
    ) {
        var vm = this;

        vm.dashboards = [];
        vm.openFile = DataUtils.openFile;
        vm.byteSize = DataUtils.byteSize;
        vm.fSearchQuery = "Sales";
        vm.permissions = PERMISSIONS;
        vm.showWaterMark = true;

        loadAll();

        function loadAll() {
            Dashboards.query(function (result) {
                vm.dashboards = result;
                vm.showWaterMark = vm.dashboards.length > 0;
                vm.searchQuery = null;
            });
        }
    }
})();

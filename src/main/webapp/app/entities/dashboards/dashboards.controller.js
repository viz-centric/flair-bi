(function () {
    "use strict";

    angular
        .module("flairbiApp")
        .controller("DashboardsController", DashboardsController);

    DashboardsController.$inject = [
        "DataUtils",
        "Dashboards",
        "PERMISSIONS",
        "paginationConstants"
    ];

    function DashboardsController(
        DataUtils,
        Dashboards,
        PERMISSIONS,
        paginationConstants
    ) {
        var vm = this;

        vm.dashboards = [];
        vm.openFile = DataUtils.openFile;
        vm.byteSize = DataUtils.byteSize;
        vm.fSearchQuery = "Sales";
        vm.permissions = PERMISSIONS;
        vm.showWaterMark = true;

        vm.loadPage = loadPage;
        vm.page = 1;
        vm.itemsPerPage = 10;

        loadAll();

        function loadAll() {

            Dashboards.query({
                page: vm.page - 1,
                size: vm.itemsPerPage
            }, function (result, headers) {
                vm.dashboards = result;
                vm.showWaterMark = vm.dashboards.length > 0;
                vm.searchQuery = null;

                vm.totalItems = headers('X-Total-Count');
                vm.queryCount = vm.totalItems;
            });
        }

        function loadPage(page) {
            vm.page = page;
            loadAll();
        }
    }
})();

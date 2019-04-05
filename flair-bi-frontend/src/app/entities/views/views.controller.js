(function() {
    "use strict";

    angular.module("flairbiApp").controller("ViewsController", ViewsController);

    ViewsController.$inject = [
        "$scope",
        "$state",
        "$stateParams",
        "DataUtils",
        "Views",
        "Dashboards",
        "$rootScope"
    ];

    function ViewsController(
        $scope,
        $state,
        $stateParams,
        DataUtils,
        Views,
        Dashboards,
        $rootScope
    ) {
        var vm = this;

        vm.views = [];

        vm.openFile = DataUtils.openFile;
        vm.byteSize = DataUtils.byteSize;

        if ($stateParams.data) {
            vm.selectedDashboard = $stateParams.data;
        } else {
            vm.selectedDashboard = null;
        }

        loadAll();

        function loadAll() {
            Views.query(function(result) {
                vm.views = result;
                vm.searchQuery = null;
            });
        }

        $scope.deleteDashboard = function(id) {
            for (var i = 0; i < vm.views.length; i++) {
                if (id == vm.views[i].viewDashboard.id) {
                    var viewExists = 1;
                    break;
                }
            }

            if (viewExists > 0) {
                $rootScope.$emit("viewExists");
            } else {
                $state.go("dashboards.delete", { id: id });
            }
        };
    }
})();

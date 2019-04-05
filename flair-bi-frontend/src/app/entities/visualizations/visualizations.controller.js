(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller("VisualizationsController", VisualizationsController);

    VisualizationsController.$inject = [
        "$scope",
        "$state",
        "Visualizations",
        "PERMISSIONS"
    ];

    function VisualizationsController(
        $scope,
        $state,
        Visualizations,
        PERMISSIONS
    ) {
        var vm = this;

        vm.visualizations = [];
        vm.permissions = PERMISSIONS;

        loadAll();

        function loadAll() {
            Visualizations.query(function(result) {
                vm.visualizations = result;
                vm.searchQuery = null;
            });
        }
    }
})();

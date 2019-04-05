(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller(
            "DatasourceConstraintController",
            DatasourceConstraintController
        );

    DatasourceConstraintController.$inject = ["DatasourceConstraint"];

    function DatasourceConstraintController(DatasourceConstraint) {
        var vm = this;

        vm.datasourceConstraints = [];

        loadAll();

        function loadAll() {
            DatasourceConstraint.query(function(result) {
                vm.datasourceConstraints = result;
                vm.searchQuery = null;
            });
        }
    }
})();

(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller(
            "DatasourceConstraintHeaderController",
            DatasourceConstraintHeaderController
        );

    DatasourceConstraintHeaderController.$inject = ["$stateParams"];

    function DatasourceConstraintHeaderController($stateParams) {
        var vm = this;
        vm.id = $stateParams.id;
    }
})();

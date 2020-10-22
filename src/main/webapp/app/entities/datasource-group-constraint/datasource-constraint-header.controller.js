(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller(
            "DatasourceGroupConstraintHeaderController",
            DatasourceGroupConstraintHeaderController
        );

    DatasourceGroupConstraintHeaderController.$inject = ["$state"];

    function DatasourceGroupConstraintHeaderController($state) {
        var vm = this;
        vm.isNewConstraint = $state.current.name.indexOf("new") > 0;
    }
})();

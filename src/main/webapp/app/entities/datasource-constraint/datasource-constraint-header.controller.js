(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller(
            "DatasourceConstraintHeaderController",
            DatasourceConstraintHeaderController
        );

    DatasourceConstraintHeaderController.$inject = ["$state"];

    function DatasourceConstraintHeaderController($state) {
        var vm = this;
        vm.isNewConstraint = $state.current.name.indexOf("new")>0?true:false;
    }
})();

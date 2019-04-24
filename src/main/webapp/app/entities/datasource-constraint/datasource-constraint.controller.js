(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller(
            "DatasourceConstraintController",
            DatasourceConstraintController
        );

    DatasourceConstraintController.$inject = ["DatasourceConstraint","$translate","$rootScope"];

    function DatasourceConstraintController(DatasourceConstraint,$translate,$rootScope) {
        var vm = this;

        vm.datasourceConstraints = [];

        loadAll();

        function loadAll() {
            DatasourceConstraint.query(function(result) {
                vm.datasourceConstraints = result;
                vm.searchQuery = null;
            },function(){
                $rootScope.showErrorSingleToast({
                    text: $translate.instant('flairbiApp.datasourceConstraint.errorFetching')
                });
            });
        }
    }
})();

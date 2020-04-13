(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller(
            "DatasourceConstraintController",
            DatasourceConstraintController
        );

    DatasourceConstraintController.$inject = ["DatasourceConstraint","$translate","$rootScope","$stateParams"];

    function DatasourceConstraintController(DatasourceConstraint,$translate,$rootScope,$stateParams) {
        var vm = this;

        vm.datasourceConstraints = [];
        vm.login = $stateParams.login;

        loadAll();

        function loadAll() {
            DatasourceConstraint.query({
                'user.login': vm.login
            }, function (result) {
                vm.datasourceConstraints = result;
                vm.searchQuery = null;
            }, function () {
                $rootScope.showErrorSingleToast({
                    text: $translate.instant('flairbiApp.datasourceConstraint.errorFetching')
                });
            });
        }
    }
})();

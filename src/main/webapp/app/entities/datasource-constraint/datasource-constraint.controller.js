(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller(
            "DatasourceConstraintController",
            DatasourceConstraintController
        );

    DatasourceConstraintController.$inject = ["DatasourceConstraint","$translate","$rootScope","$stateParams","RouteHistoryService"];

    function DatasourceConstraintController(DatasourceConstraint,$translate,$rootScope,$stateParams,RouteHistoryService) {
        var vm = this;

        vm.datasourceConstraints = [];
        vm.login = $stateParams.login;
        vm.back = back;

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

        function back() {
            RouteHistoryService.back();
        }
    }
})();

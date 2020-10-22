(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller(
            "DatasourceGroupConstraintController",
            DatasourceGroupConstraintController
        );

    DatasourceGroupConstraintController.$inject = ["DatasourceGroupConstraint","$translate","$rootScope","$stateParams","RouteHistoryService"];

    function DatasourceGroupConstraintController(DatasourceGroupConstraint,$translate,$rootScope,$stateParams,RouteHistoryService) {
        var vm = this;

        vm.datasourceGroupConstraints = [];
        vm.login = $stateParams.login;
        vm.back = back;

        loadAll();

        function loadAll() {
            DatasourceGroupConstraint.query({
                'user.login': vm.login
            }, function (result) {
                vm.datasourceGroupConstraints = result;
                vm.searchQuery = null;
            }, function () {
                $rootScope.showErrorSingleToast({
                    text: $translate.instant('flairbiApp.datasourceGroupConstraint.errorFetching')
                });
            });
        }

        function back() {
            RouteHistoryService.back();
        }
    }
})();

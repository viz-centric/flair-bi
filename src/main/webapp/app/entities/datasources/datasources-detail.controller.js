(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller("DatasourcesDetailController", DatasourcesDetailController);

    DatasourcesDetailController.$inject = [
        "$scope",
        "$rootScope",
        "$stateParams",
        "previousState",
        "entity",
        "Datasources",
        "Service"
    ];

    function DatasourcesDetailController(
        $scope,
        $rootScope,
        $stateParams,
        previousState,
        entity,
        Datasources,
        Service
    ) {
        var vm = this;

        vm.datasources = entity;
        vm.previousState = previousState.name;

        var unsubscribe = $rootScope.$on(
            "flairbiApp:datasourcesUpdate",
            function(event, result) {
                vm.datasources = result;
            }
        );
        $scope.$on("$destroy", unsubscribe);
    }
})();

(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller("ViewsDetailController", ViewsDetailController);

    ViewsDetailController.$inject = [
        "$scope",
        "$rootScope",
        "$state",
        "$stateParams",
        "previousState",
        "DataUtils",
        "entity",
        "Views",
        "Dashboards",
        "$window"
    ];

    function ViewsDetailController(
        $scope,
        $rootScope,
        $state,
        $stateParams,
        previousState,
        DataUtils,
        entity,
        Views,
        Dashboards,
        $window
    ) {
        var vm = this;

        vm.views = entity;
        vm.previousState = previousState.name;
        vm.byteSize = DataUtils.byteSize;
        vm.openFile = DataUtils.openFile;
        vm.dashboardId=$stateParams.id;

        var unsubscribe = $rootScope.$on("flairbiApp:viewsUpdate", function(
            event,
            result
        ) {
            vm.views = result;
        });
        $scope.$on("$destroy", unsubscribe);
        $scope.moveToOverview = function(info) {
            $window.history.back();
        };
    }
})();

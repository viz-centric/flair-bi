(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller(
            "ViewRequestPublishController",
            ViewRequestPublishController
        );

    ViewRequestPublishController.$inject = [
        "$scope",
        "entity",
        "$stateParams",
        "Views",
        "$uibModalInstance",
        "$window",
        "$translate",
        "$rootScope"
    ];
    function ViewRequestPublishController(
        $scope,
        entity,
        $stateParams,
        Views,
        $uibModalInstance,
        $window,
        $translate,
        $rootScope
    ) {
        var vm = this;

        vm.view = entity;
        vm.confirmRelease = confirmRelease;
        vm.clear = clear;

        activate();

        ////////////////

        function activate() {}

        function clear() {
            $uibModalInstance.dismiss("cancel");
            $window.history.back();
        }

        function confirmRelease(identifier) {
            Views.requestRelease(
                { id: identifier },
                { comment: vm.releaseComment },
                function() {
                    $scope.$emit("flairbiApp:viewRequestRelease", identifier);
                    $uibModalInstance.close({ dashboardId: $stateParams.id });
                    $window.history.back();
                    var info = {text:$translate.instant('flairbiApp.views.releaseRequest'),title: "Requested"}
                    $rootScope.showSuccessToast(info);
                }
            );
        }
    }
})();

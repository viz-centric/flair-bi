(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller(
            "FeatureBookmarkDetailController",
            FeatureBookmarkDetailController
        );

    FeatureBookmarkDetailController.$inject = [
        "$scope",
        "$rootScope",
        "$stateParams",
        "previousState",
        "entity",
        "FeatureBookmark",
        "FeatureCriteria",
        "User",
        "Datasources"
    ];

    function FeatureBookmarkDetailController(
        $scope,
        $rootScope,
        $stateParams,
        previousState,
        entity,
        FeatureBookmark,
        FeatureCriteria,
        User,
        Datasources
    ) {
        var vm = this;

        vm.featureBookmark = entity;
        vm.previousState = previousState.name;

        var unsubscribe = $rootScope.$on(
            "flairbiApp:featureBookmarkUpdate",
            function(event, result) {
                vm.featureBookmark = result;
            }
        );
        $scope.$on("$destroy", unsubscribe);
    }
})();

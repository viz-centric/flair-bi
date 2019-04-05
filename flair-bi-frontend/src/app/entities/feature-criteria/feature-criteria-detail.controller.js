(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller(
            "FeatureCriteriaDetailController",
            FeatureCriteriaDetailController
        );

    FeatureCriteriaDetailController.$inject = [
        "$scope",
        "$rootScope",
        "$stateParams",
        "previousState",
        "entity",
        "FeatureCriteria",
        "Feature",
        "FeatureBookmark"
    ];

    function FeatureCriteriaDetailController(
        $scope,
        $rootScope,
        $stateParams,
        previousState,
        entity,
        FeatureCriteria,
        Feature,
        FeatureBookmark
    ) {
        var vm = this;

        vm.featureCriteria = entity;
        vm.previousState = previousState.name;

        var unsubscribe = $rootScope.$on(
            "flairbiApp:featureCriteriaUpdate",
            function(event, result) {
                vm.featureCriteria = result;
            }
        );
        $scope.$on("$destroy", unsubscribe);
    }
})();

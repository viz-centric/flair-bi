(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller("FeatureCriteriaController", FeatureCriteriaController);

    FeatureCriteriaController.$inject = ["FeatureCriteria"];

    function FeatureCriteriaController(FeatureCriteria) {
        var vm = this;

        vm.featureCriteria = [];

        loadAll();

        function loadAll() {
            FeatureCriteria.query(function(result) {
                vm.featureCriteria = result;
                vm.searchQuery = null;
            });
        }
    }
})();

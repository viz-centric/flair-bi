(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller("HierarchyDialogController", HierarchyDialogController);

    HierarchyDialogController.$inject = [
        "$scope",
        "entity",
        "dimensions",
        "Hierarchies",
        "$uibModalInstance"
    ];

    function HierarchyDialogController(
        $scope,
        entity,
        dimensions,
        Hierarchies,
        $uibModalInstance
    ) {
        var vm = this;

        vm.clear = clear;
        vm.save = save;
        vm.filterDimensions = filterDimensions;
        vm.hierarchy=sortedDrilldowns(entity);
        vm.dimensions = dimensions;
        vm.addDrilldown = addDrilldown;
        vm.removeDrilldown = removeDrilldown;
        vm.sortedDrilldowns=sortedDrilldowns;

        vm.validation = validation;

        activate();

        ////////////////

        function activate() {}

        function clear() {
            $uibModalInstance.dismiss("cancel");
        }

        function save() {
            vm.isSaving = true;
            if (vm.hierarchy.id) {
                Hierarchies.update(vm.hierarchy, onSaveSuccess, onSaveError);
            } else {
                Hierarchies.save(vm.hierarchy, onSaveSuccess, onSaveError);
            }
        }

        function onSaveSuccess(result) {
            $scope.$emit("flairbiApp:hierarchyUpdate", result);
            $uibModalInstance.close(result);
            vm.isSaving = false;
        }

        function onSaveError() {
            vm.isSaving = false;
        }

        function validation() {
            return (
                vm.hierarchy.drilldown.filter(function(item) {
                    return item.feature === null;
                }).length === 0
            );
        }

        function addDrilldown() {
            if (vm.hierarchy.drilldown.length < 5) {
                vm.hierarchy.drilldown.push({
                    feature: null,
                    order: vm.hierarchy.drilldown.length
                });
            }
        }

        function removeDrilldown(drilldown) {
            var index = vm.hierarchy.drilldown.indexOf(drilldown);
            if (index > -1) {
                vm.hierarchy.drilldown.splice(index, 1);
            }
        }

        function filterDimensions(item) {
            return (
                vm.hierarchy.drilldown.filter(function(el) {
                    return el.feature && el.feature.name === item.name;
                }).length === 0
            );
        }

        function sortedDrilldowns(hierarchy){
            hierarchy.drilldown.sort(function(a, b) {
                return a.order - b.order;
            });
            return hierarchy;
        }
    }
})();

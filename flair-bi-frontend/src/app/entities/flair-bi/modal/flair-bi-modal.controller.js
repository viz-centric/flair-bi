(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller("FlairBiModalController", FlairBiModalController);

    FlairBiModalController.$inject = [
        "$uibModalInstance",
        "visual",
        "view",
        "Features",
        "Visualmetadata"
    ];

    function FlairBiModalController(
        $uibModalInstance,
        visual,
        view,
        Features,
        Visualmetadata
    ) {
        var vm = this;

        vm.validate = validate;
        vm.save = save;
        vm.clear = clear;
        vm.view = view;

        activate();

        ////////////////

        function activate() {
            vm.visual = visual;
            vm.visual.titleProperties.titleText =
                vm.visual.titleProperties.titleText.trim() == ""
                    ? vm.visual.metadataVisual.name
                    : vm.visual.titleProperties.titleText;
            vm.visual.visualBuildId = vm.visual.visualBuildId || vm.visual.id;
            vm.features = Features.query({
                datasource: vm.view.viewDashboard.dashboardDatasource.id
            });
        }

        function clear() {
            $uibModalInstance.dismiss("cancel");
        }

        function save() {
            vm.isSaving = true;
            if (vm.visual.id) {
                Visualmetadata.update(
                    {
                        viewId: vm.view.id,
                        visualMetadata: vm.visual
                    },
                    onSaveSuccess,
                    onSaveError
                );
            } else {
                Visualmetadata.save(
                    {
                        viewId: vm.view.id,
                        visualMetadata: vm.visual
                    },
                    onSaveSuccess,
                    onSaveError
                );
            }
        }

        function onSaveSuccess(result) {
            $uibModalInstance.close({
                result: result,
                buildId: vm.visual.visualBuildId
            });
            vm.isSaving = false;
            vm.visual = result;
        }

        function onSaveError(error) {
            vm.isSaving = false;
        }

        function validate() {}
    }
})();

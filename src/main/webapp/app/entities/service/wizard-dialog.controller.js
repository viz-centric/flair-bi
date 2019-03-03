(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller("WizardDialogController", WizardDialogController);

    WizardDialogController.$inject = [
        "$uibModalInstance",
        "ConnectionTypes",
        "$translate",
        "$rootScope",
        "Datasources"
    ];

    function WizardDialogController(
        $uibModalInstance,
        ConnectionTypes,
        $translate,
        $rootScope,
        Datasources
    ) {
        var vm = this;

        activate();

        vm.connectionType = null;
        vm.service = null;
        vm.clear = clear;
        vm.handleFinish = handleFinish;

        vm.datasources = {
            queryPath: "/api/queries",
            lastUpdated: new Date()
        };

        ////////////////

        function activate() {
            vm.connectionTypes = ConnectionTypes.query();

            vm.connectionTypes.$promise
                .catch(function (data) {
                    $rootScope.showErrorSingleToast({
                        text: $translate.instant('flairbiApp.service.error.connection_types.all')
                    })
                });
        }

        function clear() {
            $uibModalInstance.dismiss("cancel");
        }

        function handleFinish(result) {
            $uibModalInstance.close(result);
        }
    }
})();

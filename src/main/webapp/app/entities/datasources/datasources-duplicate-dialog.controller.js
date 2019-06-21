(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller("DatasourcesDuplicateDialogController", DatasourcesDuplicateDialogController);

    DatasourcesDuplicateDialogController.$inject = [
        "$timeout",
        "$scope",
        "$uibModalInstance",
        "datasource"
    ];

    function DatasourcesDuplicateDialogController(
        $timeout,
        $scope,
        $uibModalInstance,
        datasource
    ) {
        var vm = this;

        vm.datasource = datasource;
        vm.onDelete = onDelete;
        vm.onEdit = onEdit;
        vm.onClose = onClose;

        function onClose() {
            $uibModalInstance.dismiss('cancel');
        }

        function onEdit() {
            $uibModalInstance.close({result:'edit'});
        }

        function onDelete() {
            $uibModalInstance.close({result:'delete'});
        }

    }
})();

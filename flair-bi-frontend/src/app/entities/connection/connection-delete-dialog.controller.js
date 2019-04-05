(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller(
            "ConnectionDeleteDialogController",
            ConnectionDeleteDialogController
        );

    ConnectionDeleteDialogController.$inject = [
        "$uibModalInstance",
        "entity",
        "Connections",
        "$stateParams",
        "Datasources"
    ];

    function ConnectionDeleteDialogController(
        $uibModalInstance,
        entity,
        Connections,
        $stateParams,
        Datasources
    ) {
        var vm = this;

        vm.connection = entity;
        vm.clear = clear;
        vm.confirmDelete = confirmDelete;
        vm.toggleCollapse = toggleCollapse;

        activate();

        function activate() {
            vm.deleteInfo = Connections.deleteInfo({
                linkId: vm.connection.linkId
            });
        }

        function clear() {
            $uibModalInstance.dismiss("cancel");
        }

        function toggleCollapse(entity) {
            vm["is" + entity + "Collapsed"] = !vm["is" + entity + "Collapsed"];
        }

        function deleteDatasources() {
            Datasources.delete(
                { connectionName: vm.connection.linkId },
                function(res) {
                    $uibModalInstance.close(true);
                },
                function(err) {}
            );
        }

        function confirmDelete(id) {
            Connections.delete(
                { id: id, serviceId: $stateParams.id },
                function() {
                    deleteDatasources();
                }
            );
        }
    }
})();

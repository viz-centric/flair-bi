import angular from 'angular';

angular.module('flairbiApp')
    .controller('ConnectionDialogController', ConnectionDialogController);

ConnectionDialogController.$inject = [
    "entity",
    "$uibModalInstance",
    "Connections",
    "$stateParams"
];
function ConnectionDialogController(
    entity,
    $uibModalInstance,
    Connections,
    $stateParams
) {
    var vm = this;
    vm.connection = entity;
    vm.clear = clear;
    vm.save = save;

    activate();

    ////////////////

    function activate() { }

    function clear() {
        $uibModalInstance.dismiss("cancel");
    }

    function save() {
        vm.isSaving = true;
        if (vm.connection.id) {
            Connections.update(
                { serviceId: $stateParams.id },
                vm.connection,
                function (res) {
                    $uibModalInstance.close(res);
                    vm.isSaving = false;
                },
                function (err) {
                    vm.isSaving = false;
                }
            );
        } else {
            Connections.save(
                { serviceId: $stateParams.id },
                vm.connection,
                function (res) {
                    $uibModalInstance.close(res);
                    vm.isSaving = false;
                },
                function (err) {
                    vm.isSaving = false;
                }
            );
        }
    }
}
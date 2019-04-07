ConnectionsController.$inject = [
    "Connections",
    "$stateParams",
    "$rootScope",
    "$translate"
];
export const name = 'ConnectionsController';
export function ConnectionsController(
    Connections,
    $stateParams,
    $rootScope,
    $translate
) {
    var vm = this;
    vm.connections = [];

    vm.serviceId = $stateParams.id;

    activate();

    ////////////////

    function activate() {
        vm.connections = Connections.query();

        vm.connections
            .$promise
            .catch(function (data) {
                $rootScope.showErrorSingleToast({
                    text: $translate.instant('flairbiApp.service.error.connections.all')
                })
            });
    }
}


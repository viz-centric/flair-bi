import angular from 'angular';

angular.module('flairbiApp')
    .controller('ConnectionsController', ConnectionsController);

ConnectionsController.$inject = [
    "Connections",
    "$stateParams",
    "$rootScope",
    "$translate"
];
function ConnectionsController(
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


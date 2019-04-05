(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller("DataConnectionController", DataConnectionController);

    DataConnectionController.$inject = [
        "ConnectionTypes",
        "$translate",
        "$rootScope",
        "Datasources",
        "$scope"
    ];

    function DataConnectionController(
        ConnectionTypes,
        $translate,
        $rootScope,
        Datasources,
        $scope
    ) {
        var vm = this;

        activate();

        vm.connectionType = null;
        vm.service = null;
        vm.clear = clear;
        vm.step=0;

        vm.datasources = {
            queryPath: "/api/queries",
            lastUpdated: new Date()
        };

        ////////////////

        function activate() {
            registerNextStep();
            registerPreviousStep();
            vm.connectionTypes = ConnectionTypes.query();
            vm.connectionProperties = {};
            vm.connectionTypes.$promise
            .catch(function (data) {
                $rootScope.showErrorSingleToast({
                    text: $translate.instant('flairbiApp.service.error.connection_types.all')
                })
            });
        }

        function nextStep(){
            vm.step++;
        }

        function previousStep(){
            vm.step--;
        }

        function registerNextStep() {
            var unsubscribe = $scope.$on(
                "flairbiApp:data-connection:next-page",
                function() {
                    nextStep();
                }
            );
            $scope.$on("$destroy", unsubscribe);
        }

        function registerPreviousStep() {
            var unsubscribe = $scope.$on(
                "flairbiApp:data-connection:previous-page",
                function() {
                    previousStep();
                }
            );
            $scope.$on("$destroy", unsubscribe);
        }

    }
})();

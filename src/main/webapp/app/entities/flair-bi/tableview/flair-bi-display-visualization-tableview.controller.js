(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('FlairBiDisplayVisualizationTableviewController', FlairBiDisplayVisualizationTableviewController);
    FlairBiDisplayVisualizationTableviewController.$inject = ['$scope',
        "$rootScope",
        "$stateParams",
        "proxyGrpcService",
        "stompClientService",
        "AuthServerProvider",
        "schedulerService",
        "REPORTMANAGEMENTCONSTANTS",
        "visualizationRenderService",
        "Visualmetadata"
    ];

    function FlairBiDisplayVisualizationTableviewController($scope,
        $rootScope,
        $stateParams,
        proxyGrpcService,
        stompClientService,
        AuthServerProvider,
        schedulerService,
        REPORTMANAGEMENTCONSTANTS,
        visualizationRenderService,
        Visualmetadata) {
        var vm = this;
        vm.id = $stateParams.schedulerId;
        vm.chartType = $stateParams.chartType;
        vm.tableData = [];
        vm.tablekey = [];
        vm.visualizationId;
        vm.reportData;
        //  vm.visualMetadata = new VisualWrap(visualMetadata);
        vm.dateFormat = REPORTMANAGEMENTCONSTANTS.dateTime;
        activate();
        ///////////////

        function activate() {

            Visualmetadata.get({
                id: $stateParams.visualisationId
            }, function (v) {
                vm.visualMetadata = v;

                schedulerService.getReportLogByMetaId($stateParams.schedulerId)
                    .then(
                        function (response) {
                            vm.reportData = response.data.reportLog;
                            var info = {
                                text: 'Report executed',
                                title: 'Success'
                            };
                            vm.visualizationId = vm.reportData.visualizationId.replace("threshold_alert_:", "");
                            connectWebSocket();

                            proxyGrpcService.forwardCall($stateParams.datasourceId, {
                                visualMetadata: v,
                                queryDTO: response.data.reportLog.query,
                                type: 'share-link',
                                validationType: 'REQUIRED_FIELDS'
                            }, $stateParams.viewId);
                        },
                        function (error) {
                            var info = {
                                text: 'A Webhook with this name already exists',
                                title: "Error"
                            };
                            $rootScope.showErrorSingleToast(info);
                        });
            });


        }

        function connectWebSocket() {
            stompClientService.connect(
                { token: AuthServerProvider.getToken() },
                function (frame) {
                    stompClientService.subscribe("/user/exchange/metaData/" + $stateParams.visualisationId, onExchangeMetadata);
                    stompClientService.subscribe("/user/exchange/metaDataError", onExchangeMetadataError);
                }
            );

            $scope.$on("$destroy", function (event) {
                stompClientService.disconnect();
            });
        }

        function onExchangeMetadataError(data) {
            console.log("error " + data)
        }


        function onExchangeMetadata(data) {
            var metaData = JSON.parse(data.body);
            if (vm.chartType === "table") {
                createHeader(metaData.data[0]);
                addDataInTable(metaData.data);

            }
            else {
                var contentId = "content-" + $stateParams.schedulerId;
                visualizationRenderService.setMetaData(
                    vm.visualMetadata,
                    metaData,
                    contentId
                );
            }
        }
        function createHeader(cols) {
            $("#table-view-col-" + vm.id + "").empty();
            var row = $("#table-view-col-" + vm.id + "");
            angular.forEach(cols, function (value, key) {
                row.append("<th>" + key + "</th>");
            });
        }

        function addDataInTable(data) {
            $("#table-view-" + vm.id + " > tbody").empty();
            var tBody = $("#table-view-" + vm.id + " > tbody");
            angular.forEach(data, function (row, index) {
                var tr = $("<tr></tr>");
                angular.forEach(row, function (value, key) {
                    tr.append("<td>" + value + "</td>");
                });
                tBody.append(tr);
            });
        }

    }
})();

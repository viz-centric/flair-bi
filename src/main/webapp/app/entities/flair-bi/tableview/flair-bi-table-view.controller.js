(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('FlairBiTableviewController', FlairBiTableviewController);

    FlairBiTableviewController.$inject = ['$scope',
        "$rootScope",
        "$stateParams",
        "proxyGrpcService",
        "stompClientService",
        "AuthServerProvider",
        "schedulerService"
    ];

    function FlairBiTableviewController($scope,
        $rootScope,
        $stateParams,
        proxyGrpcService,
        stompClientService,
        AuthServerProvider,
        schedulerService) {
        var vm = this;
        vm.tableData = [];
        vm.tablekey = [];
        activate();
        ///////////////

        function activate() {

            schedulerService.getReportLogByMetaId($stateParams.id)
                .then(
                    function (response) {
                        var info = {
                            text: 'Report will be execute now',
                            title: 'Success'
                        };
                        connectWebSocket();

                        proxyGrpcService.forwardCall($stateParams.datasource, {
                            queryDTO: response.data.reportLog.query
                        });
                    },
                    function (error) {
                        var info = {
                            text: 'error occured while cancelling scheduled report',
                            title: "Error"
                        };
                        $rootScope.showErrorSingleToast(info);
                    });
        }

        function connectWebSocket() {
            stompClientService.connect(
                { token: AuthServerProvider.getToken() },
                function (frame) {
                    stompClientService.subscribe("/user/exchange/metaData", onExchangeMetadata);
                    stompClientService.subscribe("/user/exchange/metaDataError", onExchangeMetadataError);
                }
            );

            $scope.$on("$destroy", function (event) {
                stompClientService.disconnect();
            });
        }

        function onExchangeMetadataError(data) {
        }


        function onExchangeMetadata(data) {
            var metaData = JSON.parse(data.body);
            createHeader(metaData.data[0]);
            addDataInTable(metaData.data);


        }
        function createHeader(cols){
            $("#table-view-col").empty();
            var row=$("#table-view-col");
            angular.forEach(cols, function(value, key){
                 row.append("<th>"+key+"</th>");
            });
        }

        function addDataInTable(data){
            $("#table-view > tbody").empty();
            var tBody=$("#table-view > tbody");
            angular.forEach(data, function(row, index){
                var tr=$("<tr></tr>");
                angular.forEach(row, function(value, key){
                     tr.append("<td>"+value+"</td>");
                });
                tBody.append(tr);
            });
        }

    }
})();

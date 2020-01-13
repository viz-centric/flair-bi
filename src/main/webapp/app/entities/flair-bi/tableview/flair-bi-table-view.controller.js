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
            console.log('flair-bi fullscreen controller connect web socket');
            stompClientService.connect(
                { token: AuthServerProvider.getToken() },
                function (frame) {
                    console.log('flair-bi fullscreen controller connected web socket');
                    stompClientService.subscribe("/user/exchange/metaData", onExchangeMetadata);
                    stompClientService.subscribe("/user/exchange/metaDataError", onExchangeMetadataError);
                }
            );

            $scope.$on("$destroy", function (event) {
                console.log('flair-bi fullscreen destorying web socket');
                stompClientService.disconnect();
            });
        }

        function onExchangeMetadataError(data) {
            console.log('controller on metadata error', data);
        }


        function onExchangeMetadata(data) {
            console.log('controller on metadata', data);
            var metaData = JSON.parse(data.body);
            vm.tableData = metaData.data;
            vm.tablekey = Object.keys(metaData.data[0]);
            var str = "";
            str += "<div class='table-responsive'><table id='chartData' class='table table-condensed table-striped table-bordered table-responsive'><tr><thead>";

            for (var index = 0; index < vm.tablekey.length; index++) {

                str += "<th>" + vm.tablekey[index] + "</th>";
            }
            str += "</tr></thead><tbody>";

            for (var index = 0; index < vm.tableData.length; index++) {
                str += "<tr>";
                for (var j = 0; j < vm.tablekey.length; j++) {

                    str += "<td>" + vm.tableData[index][vm.tablekey[j]] + "</td>";
                }

                str += "</tr>";
            }
            str += "</tbody></table></div>";
            $("#content-table-view").html('')
            $("#content-table-view").append(str)

        }
    }
})();

(function () {
    "use strict";

    angular.module("flairbiApp").factory("proxyGrpcService", proxyGrpcService);

    proxyGrpcService.$inject = [
        "stompClientService"
    ];

    function proxyGrpcService(
        stompClientService
    ) {
        function forwardCall(sourceId, body, viewId) {
            sendMsg(sourceId, body, viewId);
        }

        function forwardCallV2(sourceId, body) {
            sendMsgV2(sourceId, body);
        }

        function sendMsg(sourceId, body, viewId) {
            console.log('sending message', body);
            stompClientService.send(
                "/flair-ws/fbi-engine-grpc/" +
                sourceId +
                "/query/" +
                viewId,
                {},
                JSON.stringify(body)
            );
        }

        function sendMsgV2(sourceId, body) {
            console.log('sending message', body);
            stompClientService.send(
                "/flair-ws/fbi-engine-grpc/" +
                sourceId +
                "/query",
                {},
                JSON.stringify(body)
            );
        }

        function queryAll(body) {
            stompClientService.send(
                "/flair-ws/fbi-engine-grpc/queryAll",
                {},
                JSON.stringify(body)
            );
        }

        function getSchedulerReportsAndEngineData(pageSize, page) {
            stompClientService.send('/flair-ws/fbi-engine-grpc/scheduled-reports/' + pageSize + '/' + page, {});
        }

        return {
            forwardCall: forwardCall,
            forwardCallV2: forwardCallV2,
            queryAll: queryAll,
            getSchedulerReportsAndEngineData: getSchedulerReportsAndEngineData
        };
    }
})();

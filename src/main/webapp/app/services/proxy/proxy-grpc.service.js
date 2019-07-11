(function() {
    "use strict";

    angular.module("flairbiApp").factory("proxyGrpcService", proxyGrpcService);

    proxyGrpcService.$inject = [
        "$http",
        "stompClientService"
    ];

    function proxyGrpcService(
        $http,
        stompClientService
    ) {
        function forwardCall(sourceId, body) {
            sendMsg(sourceId, body);
        }

        function sendMsg(sourceId, body) {
            console.log('sending message', body);
            stompClientService.send(
                    "/flair-ws/fbi-engine-grpc/" +
                    sourceId +
                    "/query",
                {},
                JSON.stringify(body)
            );
        }

        function queryAll(body){
            stompClientService.send(
                "/flair-ws/fbi-engine-grpc/queryAll",
                {},
                JSON.stringify(body)
            );
        }

        function getSchedulerReportsAndEngineData(pageSize,page) {
            stompClientService.send('/flair-ws/fbi-engine-grpc/scheduled-reports/'+pageSize+'/'+page,{});
        }

        return {
            forwardCall: forwardCall,
            queryAll: queryAll,
            getSchedulerReportsAndEngineData:getSchedulerReportsAndEngineData
        };
    }
})();

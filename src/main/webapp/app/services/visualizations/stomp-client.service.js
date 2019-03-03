(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .factory("stompClientService", stompClientService);

    stompClientService.$inject = ['StompClient'];

    function stompClientService(StompClient) {
        var stompClient = StompClient;
        var messageQueue = [];

        init();

        function isConnected() {
            return stompClient.ws.readyState === 1;
        }

        function send(url, header, body) {
            if (!isConnected()) {
                addToMessageQueue(url, header, body);
            } else {
                console.log('STOMP send');
                stompClient.send(url, header, body);
            }
        }

        function subscribe(url, handler) {
            console.log('STOMP subscribe');
            stompClient.subscribe(url, function (data) {
                console.log('STOMP subscribed handler');
                handler(data);
            });
        }

        function connect(params, connectionHandler) {
            console.log('STOMP connect');
            stompClient.connect(params, function (data) {
                console.log('STOMP connected handler');
                connectionHandler(data);
                executeQueue();
            });
        }

        function addToMessageQueue(url, header, body) {
            console.log('STOMP adding to message queue');
            messageQueue.push({
                url: url,
                header: header,
                body: body
            });
        }

        function disconnect() {
            console.log('STOMP disconnect');
            stompClient.disconnect();
        }

        function executeQueue() {
            if (!isConnected()) {
                return;
            }

            console.log('STOMP executing queue len:', messageQueue.length);

            var localMessageQueue = messageQueue.concat();
            messageQueue = [];
            for (var i in localMessageQueue) {
                var message = localMessageQueue[i];
                send(message.url, message.header, message.body);
            }
        }

        function init() {
            stompClient.debug = null;
        }

        return {
            connect: connect,
            subscribe: subscribe,
            disconnect: disconnect,
            send: send
        };
    }
})();

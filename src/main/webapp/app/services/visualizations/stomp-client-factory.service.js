(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .factory('StompClientFactory', ['$location', function ($location) {

            function create() {
                var origin = location.origin;
                if ($location.protocol() === 'https') {
                    origin = origin.replace('http://', 'https://');
                }
                var connectionUrl = origin + location.pathname + 'flair-ws';
                console.log('StompClient connectionUrl', connectionUrl);
                var sockClient = new SockJS(connectionUrl);
                var client = Stomp.over(sockClient);
                client.debug = null;
                return client;
            }

            return {
                create: create
            };
        }]);

})();

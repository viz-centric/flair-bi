(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .service('StompClient', function () {
            var connectionUrl = location.origin + location.pathname + 'flair-ws';
            var sockClient = new SockJS(connectionUrl);
            return Stomp.over(sockClient);
        })

})();

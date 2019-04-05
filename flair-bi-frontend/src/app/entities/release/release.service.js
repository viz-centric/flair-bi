(function (){
    "use strict";
    angular.module('flairbiApp').factory('Release', Release);

    Release.$inject = ['$resource'];

    function Release($resource){
        var resourceUrl = "api/releases/:id";

        return $resource(
            resourceUrl,
            {},
            {
                query: {method: 'GET', isArray: true},
                get: {
                    method: "GET",
                    transformResponse: function(data){
                        if(data){
                            data = angular.fromJson(data);
                        }
                        return data;
                    }
                },
                update: { method: "PUT" },
                approve:
                { method : "PUT",
                  url: "api/releases/:id/approve"}
                ,
                reject: {
                    url: "api/releases/:id/reject",
                    method: "PUT"}
            });

    }
})();

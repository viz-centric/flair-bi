(function() {
    "use strict";

    angular.module("flairbiApp").factory("Constraints", Constraints);

    Constraints.$inject = ["$resource"];

    function Constraints($resource) {
        var resourceUrl = "api/constraints/:id";

        return $resource(
            resourceUrl,
            {},
            {
                query: {
                    method: "GET",
                    isArray: true
                }
            }
        );
    }
})();

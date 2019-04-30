import angular from 'angular';


angular.module('flairbiApp').factory('Constraints', Constraints);

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

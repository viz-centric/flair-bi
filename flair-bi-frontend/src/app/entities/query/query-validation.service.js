(function() {
    "use strict";
    angular.module("flairbiApp").factory("QueryValidationService", QueryValidationService);

    QueryValidationService.$inject = [];

    function QueryValidationService() {

        return {
            getQueryValidationError: getQueryValidationError
        };

        function getQueryValidationError(error) {
            if (!error) {
                return null;
            }

            var errorObject = JSON.parse(error || '{}');
            if (errorObject.errorCode) {
                var features = errorObject.features || [];
                return {
                    msgKey: 'error.query.' + errorObject.errorCode,
                    params: {
                        features: features.join(', ')
                    }
                };
            }

            return {
                msgKey: 'error.query.validation.generic'
            };
        }
    }
})();

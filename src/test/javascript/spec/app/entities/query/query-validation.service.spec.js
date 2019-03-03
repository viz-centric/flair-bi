'use strict';

describe('Service Tests', function () {

    describe("QueryValidation service", function () {
        var QueryValidationService;

        beforeEach(module("flairbiApp"));

        beforeEach(angular.mock.inject(function (_QueryValidationService_) {
            QueryValidationService = _QueryValidationService_;
        }));

        describe('when query validation error handler called', function () {

            it('should return null if no argument provided', function () {
                var result = QueryValidationService.getQueryValidationError(null);
                expect(result).toBeNull();
            });

            it('should return default error if empty error json provided', function () {
                var result = QueryValidationService.getQueryValidationError('{}');
                expect(result.msgKey).toBe('error.query.validation.generic');
            });

            it('should return custom error if custom error json provided', function () {
                var result = QueryValidationService.getQueryValidationError('{"errorCode":"test"}');
                expect(result.msgKey).toBe('error.query.test');
                expect(result.params.features).toBe('');
            });

            it('should return custom error with features if custom error json provided with features', function () {
                var result = QueryValidationService.getQueryValidationError('{"errorCode":"test","features":["one","two"]}');
                expect(result.msgKey).toBe('error.query.test');
                expect(result.params.features).toBe('one, two');
            });

        });



    });

});

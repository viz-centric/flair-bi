'use strict';

describe('Controller Tests', function () {

    var $controller, $rootScope, Features, AlertService, stompClientService;

    beforeEach(function () {
        angular.mock.inject(function (_$controller_, _$rootScope_, _Features_, _AlertService_, _stompClientService_) {
            $controller = _$controller_;
            $rootScope = _$rootScope_;
            Features = _Features_;
            AlertService = _AlertService_;
            stompClientService = _stompClientService_;
        });

        spyOn(Features, 'query');
    });

    describe('when metadata handler gets triggered', function () {

        describe('and error occurs', function () {

            it('should show generic error if empty body is supplied', function () {

                mockStompClient(null, {
                    body: JSON.stringify({})
                });

                spyOn(AlertService, 'error').and.callFake(function (errorCode) {
                    expect(errorCode).toEqual('error.query.validation.generic');
                });

                $controller('FlairBiController', createControlleParams($rootScope.$new()));
            });

            it('should show generic error for error code INVALID_ARGUMENT', function () {

                mockStompClient(null, {
                    body: JSON.stringify({
                        code: 'INVALID_ARGUMENT'
                    })
                });

                spyOn(AlertService, 'error').and.callFake(function (errorCode) {
                    expect(errorCode).toEqual('error.query.validation.generic');
                });

                $controller('FlairBiController', createControlleParams($rootScope.$new()));
            });

            it('should show specific error for error code INVALID_ARGUMENT and errorCode parameter', function () {

                mockStompClient(null, {
                    body: JSON.stringify({
                        code: 'INVALID_ARGUMENT',
                        description: JSON.stringify({
                            errorCode: 'test'
                        })
                    })
                });

                spyOn(AlertService, 'error').and.callFake(function (errorCode, params) {
                    expect(errorCode).toEqual('error.query.test');
                    expect(params.features).toEqual('');
                });

                $controller('FlairBiController', createControlleParams($rootScope.$new()));
            });

            it('should show specific error for error code INVALID_ARGUMENT and errorCode parameter and features', function () {

                mockStompClient(null, {
                    body: JSON.stringify({
                        code: 'INVALID_ARGUMENT',
                        description: JSON.stringify({
                            errorCode: 'test',
                            features: ['State', 'City']
                        })
                    })
                });

                spyOn(AlertService, 'error').and.callFake(function (errorCode, params) {
                    expect(errorCode).toEqual('error.query.test');
                    expect(params.features).toEqual('State, City');
                });

                $controller('FlairBiController', createControlleParams($rootScope.$new()));
            });

        });
    });

    function mockStompClient(response, errorResponse) {
        spyOn(stompClientService, 'connect').and.callFake(function (params, success) {
            success();
        });

        spyOn(stompClientService, 'subscribe').and.callFake(function (url, handler) {
            if (errorResponse && url === '/user/exchange/metaDataError') {
                handler(errorResponse);
            }
            if (response && url === '/user/exchange/metaData') {
                handler(response);
            }
        });
    }

    function createControlleParams($scope) {
        return {
            $scope: $scope,
            entity: {
                viewDashboard: {
                    dashboardDatasource: {
                        id: 1
                    }
                }
            },
            states: {},
            featureEntities: [],
            datasource: {},
            configuration: {}
        };
    }

});

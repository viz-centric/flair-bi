'use strict';

describe('Controller Tests', function () {

    var $controller, $rootScope, Visualmetadata, $q, Features, $httpBackend, visualMetaData, VisualDispatchService;

    describe('conditionTabController', function () {
        beforeEach(function () {
            angular.mock.inject(function (_$controller_, _$rootScope_, _Features_, _Visualmetadata_, _$q_,
                                          _$httpBackend_, _VisualDispatchService_) {
                $controller = _$controller_;
                $rootScope = _$rootScope_;
                Visualmetadata = _Visualmetadata_;
                Features = _Features_;
                $q = _$q_;
                $httpBackend = _$httpBackend_;
                VisualDispatchService = _VisualDispatchService_;
            });

            visualMetaData = {
                id: 'visualid',
                getQueryParameters: function () {
                    return {
                        id: 'queryid'
                    };
                }
            };

            VisualDispatchService.setVisual({
                visual: {}
            });
        });

        describe('when validation runs', function () {

            beforeEach(function () {
                $httpBackend.whenGET(/i18n\/en\/home.json/).respond(200, '');
                $httpBackend.whenGET(/i18n\/en\/global.json/).respond(200, '');
                $httpBackend.whenGET(/.*/g).respond(200, '');

            });

            it('should show query when validation succeeds', function () {

                var controller = $controller('conditionTabController', createControlleParams($rootScope.$new()));

                expectValidationCall({
                    validationResultType: 'SUCCESS',
                    rawQuery: 'raw query',
                    error: null
                }, 200);

                var resultPromise = controller.validate();

                $httpBackend.flush(1);

                expect(resultPromise.$$state.status).toBe(1);
                expect(controller.query).toBe('raw query');
                expect(controller.isValidated).toBeTruthy();
                expect(controller.queryValidationError).toBeNull();
            });

            it('should show query when validation fails', function () {

                var controller = $controller('conditionTabController', createControlleParams($rootScope.$new()));

                expectValidationCall({
                    validationResultType: 'INVALID',
                    rawQuery: 'raw query',
                    error: JSON.stringify({
                        errorCode: 'test',
                        features: [
                            'one', 'two'
                        ]
                    })
                }, 200);

                var resultPromise = controller.validate();

                $httpBackend.flush(1);

                expect(resultPromise.$$state.status).toBe(2);
                expect(controller.query).toBe('raw query');
                expect(controller.isValidated).toBeFalsy();
                expect(controller.queryValidationError).toBe('error.query.test');
            });

            it('should show query when request fails', function () {

                var controller = $controller('conditionTabController', createControlleParams($rootScope.$new()));

                expectValidationCall({
                    validationResultType: 'INVALID',
                    rawQuery: 'raw query',
                    error: JSON.stringify({
                        errorCode: 'test',
                        features: [
                            'one', 'two'
                        ]
                    })
                }, 500);

                var resultPromise = controller.validate();

                $httpBackend.flush(1);

                expect(resultPromise.$$state.status).toBe(2);
                expect(controller.query).toBeNull();
                expect(controller.isValidated).toBeFalsy();
                expect(controller.queryValidationError).toBe('error.query.failed');
            });

        });

        describe('when save is invoked', function () {

            beforeEach(function () {
                $httpBackend.whenGET(/i18n\/en\/home.json/).respond(200, '');
                $httpBackend.whenGET(/i18n\/en\/global.json/).respond(200, '');
                $httpBackend.whenGET(/.*/g).respond(200, '');

            });

            it('should run validation first and then save', function () {

                var controller = $controller('conditionTabController', createControlleParams($rootScope.$new()));

                expectValidationCall({
                    validationResultType: 'SUCCESS',
                    rawQuery: 'raw query',
                    error: null
                }, 200);

                var saveDataConstraingsEventDispatched = false;
                $rootScope.$on('flairbiApp:saveDataConstraints', function () {
                    saveDataConstraingsEventDispatched = true;
                });

                var saveDataConstraints = null;
                spyOn(VisualDispatchService, 'saveDataConstraints').and.callFake(function(data) {
                    saveDataConstraints = data;
                });

                // expect(VisualDispatchService.saveDataConstraints.calledWith(controller.conditionExpression)).toBeTruthy();

                controller.save();
                $httpBackend.flush(1);

                expect(controller.isSaving).toBeTruthy();
                expect(saveDataConstraints).toBe(controller.conditionExpression);
                expect(saveDataConstraingsEventDispatched).toBeTruthy();
                expect(controller.isValidated).toBeTruthy();
            });


        });
    });

    function createControlleParams($scope) {
        return {
            $scope: $scope,
            features: {
                $promise: $q.defer().promise
            },
            $uibModalInstance: {
                close: function () {
                },
                dismiss: function () {
                }
            },
            visualMetaData: visualMetaData,
            conditionExpression: {
                id: 'conditionalid'
            },
            datasource: {
                id: 'datasourceid'
            }
        };
    }

    function expectValidationCall(response, status) {
        $httpBackend.whenPOST(
            /api\/visualmetadata\/validate.*/g, {
                datasourceId: 'datasourceid',
                queryDTO: {
                    id: 'queryid'
                },
                visualMetadataId: 'visualid',
                conditionExpression: {
                    id: 'conditionalid'
                }
            })
            .respond(status, response);
    }

});

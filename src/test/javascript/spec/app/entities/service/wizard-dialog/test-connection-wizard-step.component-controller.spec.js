'use strict';

describe('Controller Tests', function() {

    describe('TestConnectionWizardStepController', function() {
        var $scope, $rootScope, $httpBackend, $componentController;

        beforeEach(inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $httpBackend = $injector.get('$httpBackend');
            $componentController = $injector.get('$componentController');
            $scope = $rootScope.$new();
        }));


        describe('when create datasource is clicked', function() {

            it('should move to the next wizard step if all rest calls are successful', function() {

                $httpBackend.whenGET(/.*json/).respond(200, '');
                $httpBackend.whenGET(/.*html/).respond(200, '');
                $httpBackend.whenGET(/api\/account/).respond(200, '');
                $httpBackend.whenPOST(/api\/datasources/).respond(200, {id:201});
                $httpBackend.whenPOST(/api\/connection\/features\/201/).respond(200,
                    '{"data":[{"transaction_date":"1/2/09 6:17","product":"Product1","price":1200,"payment_type":"Mastercard","name":"carolina","city":"Basildon","state":"England","country":"United Kingdom","account_created":"1/2/09 6:00","last_login":"1/2/09 6:08","latitude":51.5,"longitude":-1.11666667}],"metadata":{"transaction_date":"varchar","country":"varchar","product":"varchar","payment_type":"varchar","city":"varchar","price":"int4","last_login":"varchar","latitude":"float4","name":"varchar","account_created":"varchar","state":"varchar","longitude":"float4"}}');

                var controller = createController();

                controller.createDataSource();

                $httpBackend.flush();

                expect(controller.datasources.datasourceId).toBe(201);

            });
        });

        function createController() {
            var locals = {
                '$scope': $scope,
                '$rootScope': $rootScope,
                WizardHandler: {
                    wizard: function () {
                        return {
                            next: function () {}
                        }
                    }
                }
            };
            var bindings = {
                connection: {},
                connectionType: {},
                selectedConnection: {},
                datasources: {},
                features: {}
            };
            return $componentController('testConnectionWizardStep', locals, bindings);
        }

    });

});

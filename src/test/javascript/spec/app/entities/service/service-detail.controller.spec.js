'use strict';

describe('Controller Tests', function() {

    describe('Service Management Detail Controller', function() {
        var $scope, $rootScope, $httpBackend;
        var MockEntity, MockPreviousState, MockService, MockDatasources;
        var createController, controller;

        beforeEach(inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $httpBackend = $injector.get('$httpBackend');
            $scope = $rootScope.$new();
            MockEntity = jasmine.createSpy('MockEntity');
            MockPreviousState = jasmine.createSpy('MockPreviousState');
            MockService = jasmine.createSpy('MockService');
            MockDatasources = jasmine.createSpy('MockDatasources');
            

            var locals = {
                '$scope': $scope,
                '$rootScope': $rootScope,
                'entity': MockEntity,
                'previousState': MockPreviousState,
                'Service': MockService,
                'Datasources': MockDatasources
            };
            createController = function() {
                controller = $injector.get('$controller')("ServiceDetailController", locals);
            };
        }));


        describe('Root Scope Listening', function() {
            it('Unregisters root scope listener upon scope destruction', function() {
                var eventType = 'flairbiApp:serviceUpdate';

                createController();
                expect($rootScope.$$listenerCount[eventType]).toEqual(1);

                $scope.$destroy();
                expect($rootScope.$$listenerCount[eventType]).toBeUndefined();
            });
        });

        describe('when controller is created', function () {

            describe('connection types should be fetched', function () {

                beforeEach(function () {
                    $httpBackend.whenGET(/.*json/).respond(200, '');
                    $httpBackend.whenGET(/.*html/).respond(200, '');
                    $httpBackend.whenGET(/api\/account/).respond(200, '');
                });

                it('successfully', function () {

                    createController();
                    $httpBackend.whenGET(/api\/connection-type/g).respond(200, [
                        {id: 1, name: 'nm', bundleClass:'bundle'},
                        {id: 2, name: 'nm2', bundleClass:'bundle2'}
                    ]);

                    $httpBackend.flush();

                    expect(controller.connectionTypes[0].id).toBe(1);
                    expect(controller.connectionTypes[0].name).toBe('nm');
                    expect(controller.connectionTypes[0].bundleClass).toBe('bundle');

                    expect(controller.connectionTypes[1].id).toBe(2);
                    expect(controller.connectionTypes[1].name).toBe('nm2');
                    expect(controller.connectionTypes[1].bundleClass).toBe('bundle2');
                });

                it('unsuccessfully', function () {

                    createController();
                    spyOn($rootScope, 'showErrorSingleToast');

                    $httpBackend.whenGET(/api\/connection-type/g).respond(500, []);
                    $httpBackend.flush();

                    expect(controller.connectionTypes.length).toBe(0);
                    expect($rootScope.showErrorSingleToast).toHaveBeenCalledTimes(1);
                });

            });


        });
    });

});

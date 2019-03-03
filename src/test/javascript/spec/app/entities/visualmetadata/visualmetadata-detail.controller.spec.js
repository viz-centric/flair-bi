'use strict';

describe('Controller Tests', function() {

    describe('Visualmetadata Management Detail Controller', function() {
        var $scope, $rootScope;
        var MockEntity, MockPreviousState, MockVisualmetadata, MockVisualizations;
        var createController;

        beforeEach(inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $scope = $rootScope.$new();
            MockEntity = jasmine.createSpy('MockEntity');
            MockPreviousState = jasmine.createSpy('MockPreviousState');
            MockVisualmetadata = jasmine.createSpy('MockVisualmetadata');
            MockVisualizations = jasmine.createSpy('MockVisualizations');
            

            var locals = {
                '$scope': $scope,
                '$rootScope': $rootScope,
                'entity': MockEntity,
                'previousState': MockPreviousState,
                'Visualmetadata': MockVisualmetadata,
                'Visualizations': MockVisualizations
            };
            createController = function() {
                $injector.get('$controller')("VisualmetadataDetailController", locals);
            };
        }));


        describe('Root Scope Listening', function() {
            it('Unregisters root scope listener upon scope destruction', function() {
                var eventType = 'flairbiApp:visualmetadataUpdate';

                createController();
                expect($rootScope.$$listenerCount[eventType]).toEqual(1);

                $scope.$destroy();
                expect($rootScope.$$listenerCount[eventType]).toBeUndefined();
            });
        });
    });

});

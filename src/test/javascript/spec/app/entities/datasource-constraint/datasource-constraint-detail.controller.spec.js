'use strict';

describe('Controller Tests', function() {

    describe('DatasourceConstraint Management Detail Controller', function() {
        var $scope, $rootScope;
        var MockEntity, MockPreviousState, MockDatasourceConstraint, MockUser, MockDatasources;
        var createController;

        beforeEach(inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $scope = $rootScope.$new();
            MockEntity = jasmine.createSpy('MockEntity');
            MockPreviousState = jasmine.createSpy('MockPreviousState');
            MockDatasourceConstraint = jasmine.createSpy('MockDatasourceConstraint');
            MockUser = jasmine.createSpy('MockUser');
            MockDatasources = jasmine.createSpy('MockDatasources');
            

            var locals = {
                '$scope': $scope,
                '$rootScope': $rootScope,
                'entity': MockEntity,
                'previousState': MockPreviousState,
                'DatasourceConstraint': MockDatasourceConstraint,
                'User': MockUser,
                'Datasources': MockDatasources
            };
            createController = function() {
                $injector.get('$controller')("DatasourceConstraintDetailController", locals);
            };
        }));


        describe('Root Scope Listening', function() {
            it('Unregisters root scope listener upon scope destruction', function() {
                var eventType = 'flairbiApp:datasourceConstraintUpdate';

                createController();
                expect($rootScope.$$listenerCount[eventType]).toEqual(1);

                $scope.$destroy();
                expect($rootScope.$$listenerCount[eventType]).toBeUndefined();
            });
        });
    });

});

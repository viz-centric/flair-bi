'use strict';

describe('Controller Tests', function() {

    describe('Dashboards Management Detail Controller', function() {
        var $scope, $rootScope;
        var MockEntity, MockPreviousState, MockDashboards, MockViews, MockDatasources;
        var createController;

        beforeEach(inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $scope = $rootScope.$new();
            MockEntity = jasmine.createSpy('MockEntity');
            MockPreviousState = jasmine.createSpy('MockPreviousState');
            MockDashboards = jasmine.createSpy('MockDashboards');
            MockViews = jasmine.createSpy('MockViews');
            MockDatasources = jasmine.createSpy('MockDatasources');
            

            var locals = {
                '$scope': $scope,
                '$rootScope': $rootScope,
                'entity': MockEntity,
                'previousState': MockPreviousState,
                'Dashboards': MockDashboards,
                'Views': MockViews,
                'Datasources': MockDatasources
            };
            createController = function() {
                $injector.get('$controller')("DashboardsDetailController", locals);
            };
        }));


        describe('Root Scope Listening', function() {
            it('Unregisters root scope listener upon scope destruction', function() {
                var eventType = 'flairbiApp:dashboardsUpdate';

                createController();
                expect($rootScope.$$listenerCount[eventType]).toEqual(1);

                $scope.$destroy();
                expect($rootScope.$$listenerCount[eventType]).toBeUndefined();
            });
        });
    });

});

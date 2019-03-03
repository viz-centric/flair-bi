'use strict';

describe('Controller Tests', function() {

    describe('FeatureBookmark Management Detail Controller', function() {
        var $scope, $rootScope;
        var MockEntity, MockPreviousState, MockFeatureBookmark, MockFeatureCriteria, MockUser, MockDatasources;
        var createController;

        beforeEach(inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $scope = $rootScope.$new();
            MockEntity = jasmine.createSpy('MockEntity');
            MockPreviousState = jasmine.createSpy('MockPreviousState');
            MockFeatureBookmark = jasmine.createSpy('MockFeatureBookmark');
            MockFeatureCriteria = jasmine.createSpy('MockFeatureCriteria');
            MockUser = jasmine.createSpy('MockUser');
            MockDatasources = jasmine.createSpy('MockDatasources');
            

            var locals = {
                '$scope': $scope,
                '$rootScope': $rootScope,
                'entity': MockEntity,
                'previousState': MockPreviousState,
                'FeatureBookmark': MockFeatureBookmark,
                'FeatureCriteria': MockFeatureCriteria,
                'User': MockUser,
                'Datasources': MockDatasources
            };
            createController = function() {
                $injector.get('$controller')("FeatureBookmarkDetailController", locals);
            };
        }));


        describe('Root Scope Listening', function() {
            it('Unregisters root scope listener upon scope destruction', function() {
                var eventType = 'flairbiApp:featureBookmarkUpdate';

                createController();
                expect($rootScope.$$listenerCount[eventType]).toEqual(1);

                $scope.$destroy();
                expect($rootScope.$$listenerCount[eventType]).toBeUndefined();
            });
        });
    });

});

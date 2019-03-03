'use strict';

describe('Controller Tests', function() {

    describe('FeatureCriteria Management Detail Controller', function() {
        var $scope, $rootScope;
        var MockEntity, MockPreviousState, MockFeatureCriteria, MockFeature, MockFeatureBookmark;
        var createController;

        beforeEach(inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $scope = $rootScope.$new();
            MockEntity = jasmine.createSpy('MockEntity');
            MockPreviousState = jasmine.createSpy('MockPreviousState');
            MockFeatureCriteria = jasmine.createSpy('MockFeatureCriteria');
            MockFeature = jasmine.createSpy('MockFeature');
            MockFeatureBookmark = jasmine.createSpy('MockFeatureBookmark');
            

            var locals = {
                '$scope': $scope,
                '$rootScope': $rootScope,
                'entity': MockEntity,
                'previousState': MockPreviousState,
                'FeatureCriteria': MockFeatureCriteria,
                'Feature': MockFeature,
                'FeatureBookmark': MockFeatureBookmark
            };
            createController = function() {
                $injector.get('$controller')("FeatureCriteriaDetailController", locals);
            };
        }));


        describe('Root Scope Listening', function() {
            it('Unregisters root scope listener upon scope destruction', function() {
                var eventType = 'flairbiApp:featureCriteriaUpdate';

                createController();
                expect($rootScope.$$listenerCount[eventType]).toEqual(1);

                $scope.$destroy();
                expect($rootScope.$$listenerCount[eventType]).toBeUndefined();
            });
        });
    });

});

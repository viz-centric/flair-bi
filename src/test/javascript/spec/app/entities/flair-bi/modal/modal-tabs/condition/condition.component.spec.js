'use strict';

describe('Component Tests', function() {

    describe('conditionComponent component', function() {
        var $scope, component,$rootScope,$componentController;

        beforeEach(inject(function (_$rootScope_,_$componentController_) {
            $rootScope = _$rootScope_;
            $scope = $rootScope.$new();
            $componentController=_$componentController_;
            component = $componentController("conditionComponent", {
                $scope: $scope
            });
        }));

        describe('when conditionComponent is created', function () {
                it('verify whether load function is called with parameters', function () {
                    component.features=[{id: 706, name: "State"},{id: 707, name: "City"}];
                    component.datasourceId=501;
                    spyOn(component, 'load').and.callThrough();
                    component.load("", "State");
                    expect(component.load).toHaveBeenCalled();
                });
        });
    });
});

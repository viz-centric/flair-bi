'use strict';

describe('Controller Tests', function() {

    describe('HomeTopNavBarController Controller', function() {
        var $scope, $rootScope, $controller, controller,$state,state = 'searched-results',searchCriteria='test';

        beforeEach(inject(function (_$controller_, _$rootScope_,_$state_) {
            $rootScope = _$rootScope_;
            $controller = _$controller_;
            $scope = $rootScope.$new();
            $state =_$state_;
            controller = $controller("HomeTopNavBarController", {
                $scope: $scope
            });
        }));

        describe('when HomeTopNavBarController is created', function () {

                it('should return false when url is not searched-results', function () {
                    expect(controller.isSearchPage()).toBe(false);
                });
                
                it('verify search method whether it has been called or not with searchCriteria', function () {
                    controller.searchCriteria=searchCriteria;
                    spyOn($state, 'go');
                    controller.search();
                    expect($state.go).toHaveBeenCalledWith(state, {searchCriteria: searchCriteria});
                });

                it('searchCriteria should be null when reset is called ', function () {
                    controller.reset();
                    expect(controller.searchCriteria).toBeNull();
                });
        });
    });
});

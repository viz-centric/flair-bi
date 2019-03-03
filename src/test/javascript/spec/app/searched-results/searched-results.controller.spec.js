'use strict';

describe('Controller Tests', function() {

    describe('searched views and dashbaords SearchedResultsController', function() {
        var $scope, $rootScope, $controller, controller, $httpBackend;

        beforeEach(inject(function (_$controller_, _$rootScope_, _$httpBackend_,Views) {
            $rootScope = _$rootScope_;
            $controller = _$controller_;
            $scope = $rootScope.$new();
            $httpBackend = _$httpBackend_;

            controller = $controller("SearchedResultsController", {
                $scope: $scope
            });
        }));

        describe('when controller is created', function () {

            describe('searched results should be fetched', function () {

                beforeEach(function () {
                    $httpBackend.whenGET(/.*json/).respond(200, '');
                    $httpBackend.whenGET(/.*html/).respond(200, '');
                    $httpBackend.whenGET(/api\/account/).respond(200, '');
                });

                it('successfully', function () {
                    $httpBackend.expectGET(/api\/views?.*/g).respond(200, '[]');
                    $httpBackend.expectGET(/api\/dashboards?.*/g).respond(200, '[]');
                    $httpBackend.flush();
                });
                it('unsuccessfully', function () {

                    spyOn($rootScope, 'showErrorSingleToast');
                    $httpBackend.expectGET(/api\/views?.*/g).respond(500, '[]');
                    $httpBackend.expectGET(/api\/dashboards?.*/g).respond(500, '[]');
                    $httpBackend.flush();
                    expect($rootScope.showErrorSingleToast).toHaveBeenCalledTimes(2);
                });

            });


        });
    });

});

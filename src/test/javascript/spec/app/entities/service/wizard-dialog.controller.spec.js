'use strict';

describe('Controller Tests', function () {

    describe('WizardDialogController', function () {
        var $scope, $rootScope, $controller, controller, $httpBackend;
        var MockConnectionTypes;

        beforeEach(inject(function (_$controller_, _$rootScope_, _$httpBackend_) {
            $rootScope = _$rootScope_;
            $controller = _$controller_;
            $scope = $rootScope.$new();
            $httpBackend = _$httpBackend_;
            MockConnectionTypes = jasmine.createSpy('ConnectionTypes');

            controller = $controller("WizardDialogController", {
                $scope: $scope,
                $uibModalInstance: {}
            });
        }));

        describe('when controller is created', function () {

            describe('connection types should be fetched', function () {

                beforeEach(function () {
                    $httpBackend.whenGET(/.*json/).respond(200, '');
                    $httpBackend.whenGET(/.*html/).respond(200, '');
                    $httpBackend.whenGET(/api\/account/).respond(200, '');
                });

                it('successfully', function () {

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

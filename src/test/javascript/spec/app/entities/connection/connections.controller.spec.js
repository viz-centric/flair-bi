'use strict';

describe('Controller Tests', function () {

    describe('ConnectionsController', function () {
        var $scope, $rootScope, $controller, controller, $httpBackend;

        beforeEach(inject(function (_$controller_, _$rootScope_, _$httpBackend_) {
            $rootScope = _$rootScope_;
            $controller = _$controller_;
            $scope = $rootScope.$new();
            $httpBackend = _$httpBackend_;

            controller = $controller("ConnectionsController", {
                $scope: $scope
            });
        }));

        describe('when controller is created', function () {

            describe('connections should be fetched', function () {

                beforeEach(function () {
                    $httpBackend.whenGET(/.*json/).respond(200, '');
                    $httpBackend.whenGET(/.*html/).respond(200, '');
                    $httpBackend.whenGET(/api\/account/).respond(200, '');
                });

                it('successfully', function () {

                    $httpBackend.whenGET(/api\/connection/g).respond(200, [
                            {id: 1, username: 'user'},
                            {id: 2, username: 'test'}
                        ]);

                    $httpBackend.flush();

                    expect(controller.connections[0].id).toBe(1);
                    expect(controller.connections[0].username).toBe('user');

                    expect(controller.connections[1].id).toBe(2);
                    expect(controller.connections[1].username).toBe('test');
                });

                it('unsuccessfully', function () {

                    spyOn($rootScope, 'showErrorSingleToast');

                    $httpBackend.whenGET(/api\/connection/g).respond(500, []);
                    $httpBackend.flush();

                    expect(controller.connections.length).toBe(0);
                    expect($rootScope.showErrorSingleToast).toHaveBeenCalledTimes(1);
                });

            });


        });
    });

});

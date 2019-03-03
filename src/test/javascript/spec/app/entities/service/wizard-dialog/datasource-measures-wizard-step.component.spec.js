'use strict';

describe('Component Tests', function () {

    describe('datasourceWizardStep component', function () {
        var $scope, component, $rootScope, $componentController, $httpBackend, body;

        beforeEach(inject(function (_$rootScope_, _$componentController_, _$httpBackend_) {
            $rootScope = _$rootScope_;
            $scope = $rootScope.$new();
            $componentController = _$componentController_;
            $httpBackend = _$httpBackend_;
            component = $componentController("datasourceWizardStep", {
                $scope: $scope
            });
        }));

        describe('when datasourceWizardStep is created', function () {

            beforeEach(function () {
                $httpBackend.whenGET(/.*json/).respond(200, '');
                $httpBackend.whenGET(/.*html/).respond(200, '');
                $httpBackend.whenGET(/api\/account/).respond(200, '');
            });

            it('should change datasources name when setDataSource method is called', function () {
                component.datasources = {};
                component.setDataSource("State");
                expect(component.datasources.name).toBe('State');
            });

            describe('when search is called', function () {

                beforeEach(function () {
                    body = {
                        searchTerm: 'some text',
                        connectionLinkId: 'linkid'
                    };
                    component.connection = {
                        linkId: 'linkid'
                    };
                    component.selectedConnection = {};
                    component.datasources = {
                        name: 'old name'
                    };
                    component.datasource = 'old datasource';
                });


                it('should set table names from server when calling search', function () {
                    $httpBackend.whenPOST(/api\/datasources\/listTables/, body).respond(200, {tableNames: ['table1', 'table2']});

                    component.search('some text');

                    $httpBackend.flush();

                    expect(component.tables).toEqual(['table1', 'table2']);
                    expect(component.datasources.name).toBe('old name');
                    expect(component.datasource).toBe('old datasource');
                });

                it('should clear table names if no tables come from server', function () {
                    $httpBackend.whenPOST(/api\/datasources\/listTables/, body).respond(200, {tableNames: []});

                    component.search('some text');

                    $httpBackend.flush();

                    expect(component.tables).toEqual([]);
                    expect(component.datasources.name).toBe('some text');
                    expect(component.datasource).toBe('some text');
                });

                it('should show error if request was unsuccessful', function () {
                    spyOn($rootScope, 'showErrorSingleToast');
                    $httpBackend.whenPOST(/api\/datasources\/listTables/, body).respond(400, {});
                    component.search('some text');
                    $httpBackend.flush();
                    expect($rootScope.showErrorSingleToast).toHaveBeenCalledTimes(1);
                });

            });


        });
    });
});

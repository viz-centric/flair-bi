'use strict';

describe('Component Tests', function () {

    describe('testConnectionWizardStep', function () {

        var TEMPLATE = '<wizard><wz-step wz-title="Test connection"><test-connection-wizard-step connection="connection" connection-type="connectionType" datasources="datasources"\n' +
            '                    selected-connection="selectedConnection" features="features"></test-connection-wizard-step></wz-step></wizard>';

        var $scope, $httpBackend, element, bindings;

        beforeEach(module('flairbiApp'));
        beforeEach(module('templates'));

        beforeEach(function() {
            inject(function($injector) {
                $scope = $injector.get('$rootScope').$new();
                $httpBackend = $injector.get('$httpBackend');
            });
        });

        beforeEach(function () {
            $httpBackend.whenGET(/.*json/).respond(200, '');
            $httpBackend.whenGET(/.*html/).respond(200, '');
            $httpBackend.whenGET(/api\/account/).respond(200, '');
        });


        beforeEach(function () {
            bindings = {
                connectionType: {},
                connection: {},
                datasources: {},
                selectedConnection: {},
                features: {}
            };
            element = compile(bindings);
        });

        describe('when test connection button is clicked', function () {

            it('should show success message on success', function() {
                $httpBackend.whenPOST(/api\/query\/test/).respond(200, {success:true});

                var testConnectionButton = findIn(element, 'div.test-connection-button > button');
                testConnectionButton[0].click();

                expect(findIn(element, 'div .test-connection-col > div:nth-child(2)').hasClass('ng-hide')).toBeFalsy();
                expect(findIn(element, 'div .test-connection-col > div:nth-child(3)').hasClass('ng-hide')).toBeTruthy();
                expect(findIn(element, 'div .test-connection-col > div:nth-child(4)').hasClass('ng-hide')).toBeTruthy();

                $httpBackend.flush();

                expect(findIn(element, 'div .test-connection-col > div:nth-child(2)').hasClass('ng-hide')).toBeTruthy();
                expect(findIn(element, 'div .test-connection-col > div:nth-child(3)').hasClass('ng-hide')).toBeTruthy();
                expect(findIn(element, 'div .test-connection-col > div:nth-child(4)').hasClass('ng-hide')).toBeFalsy();
            });

            it('should show failure message on error', function() {
                $httpBackend.whenPOST(/api\/query\/test/).respond(400, {success:true});

                var testConnectionButton = findIn(element, 'div.test-connection-button > button');
                testConnectionButton[0].click();

                expect(findIn(element, 'div .test-connection-col > div:nth-child(2)').hasClass('ng-hide')).toBeFalsy();
                expect(findIn(element, 'div .test-connection-col > div:nth-child(3)').hasClass('ng-hide')).toBeTruthy();
                expect(findIn(element, 'div .test-connection-col > div:nth-child(4)').hasClass('ng-hide')).toBeTruthy();

                $httpBackend.flush();

                expect(findIn(element, 'div .test-connection-col > div:nth-child(2)').hasClass('ng-hide')).toBeTruthy();
                expect(findIn(element, 'div .test-connection-col > div:nth-child(3)').hasClass('ng-hide')).toBeFalsy();
                expect(findIn(element, 'div .test-connection-col > div:nth-child(4)').hasClass('ng-hide')).toBeTruthy();
            });

            it('should show failure message on success but failed flag', function() {
                $httpBackend.whenPOST(/api\/query\/test/).respond(200, {success:false});

                var testConnectionButton = findIn(element, 'div.test-connection-button > button');
                testConnectionButton[0].click();

                expect(findIn(element, 'div .test-connection-col > div:nth-child(2)').hasClass('ng-hide')).toBeFalsy();
                expect(findIn(element, 'div .test-connection-col > div:nth-child(3)').hasClass('ng-hide')).toBeTruthy();
                expect(findIn(element, 'div .test-connection-col > div:nth-child(4)').hasClass('ng-hide')).toBeTruthy();

                $httpBackend.flush();

                expect(findIn(element, 'div .test-connection-col > div:nth-child(2)').hasClass('ng-hide')).toBeTruthy();
                expect(findIn(element, 'div .test-connection-col > div:nth-child(3)').hasClass('ng-hide')).toBeFalsy();
                expect(findIn(element, 'div .test-connection-col > div:nth-child(4)').hasClass('ng-hide')).toBeTruthy();
            });

        });

        function compile(bindings) {
            angular.extend($scope, bindings);
            return AngularTest.compileDirective($scope, TEMPLATE);
        }

        function findIn(element, selector) {
            return AngularTest.findIn(element, selector);
        }

    });

});

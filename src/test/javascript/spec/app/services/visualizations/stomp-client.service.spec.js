'use strict';

describe('Service Tests', function () {
    beforeEach(module('flairbiApp'));

    describe('stompClientService', function () {
        var service, StompClient;

        beforeEach(module('flairbiApp', function($provide) {
            $provide.service('StompClient', function() {
                this.ws = {
                    readyState: 1
                };
                this.send = function () {
                    console.log('send!');
                };
                this.connect = function (params, handler) {
                    handler();
                }
            });
        }));

        beforeEach(inject(function (_stompClientService_, _StompClient_) {
            service = _stompClientService_;
            StompClient = _StompClient_;
        }));

        describe('when calling send', function () {

            it('should queue message if not connected yet', function () {
                StompClient.ws = {
                    readyState: 0
                };
                spyOn(StompClient, 'send').and.callThrough();

                service.send('url', {}, {});

                expect(StompClient.send).toHaveBeenCalledTimes(0);
            });

            it('should send message instantly if connected', function () {
                StompClient.ws = {
                    readyState: 1
                };
                spyOn(StompClient, 'send').and.callThrough();

                service.send('url', {}, {});

                expect(StompClient.send).toHaveBeenCalledTimes(1);
            });

            it('should execute message queue after connected', function () {
                StompClient.ws = {
                    readyState: 0
                };
                spyOn(StompClient, 'send').and.callThrough();

                service.send('url1', {}, {});
                service.send('url2', {}, {});

                expect(StompClient.send).toHaveBeenCalledTimes(0);

                var connected = false;
                service.connect({}, function () {
                    StompClient.ws = {
                        readyState: 1
                    };
                    connected = true;
                });

                expect(connected).toBeTruthy();
                expect(StompClient.send).toHaveBeenCalledTimes(2);
            });

        });
    });

});

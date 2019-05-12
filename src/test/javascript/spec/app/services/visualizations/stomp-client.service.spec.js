'use strict';

describe('Service Tests', function () {
    beforeEach(module('flairbiApp'));

    describe('stompClientService', function () {
        var service, StompClient;

        beforeEach(inject(function (_stompClientService_, _StompClientFactory_) {
            service = _stompClientService_;
            StompClient = _StompClientFactory_;
        }));

        describe('when calling send', function () {

            it('should queue message if not connected yet', function () {
                spyOn(StompClient, 'create').and.returnValue(createStompClient(0));
                spyOn(StompClient, 'send').and.callThrough();

                service.send('url', {}, {});

                expect(StompClient.send).toHaveBeenCalledTimes(0);
            });

            it('should send message instantly if connected', function () {
                spyOn(StompClient, 'create').and.returnValue(createStompClient(1));
                spyOn(StompClient, 'send').and.callThrough();

                service.send('url', {}, {});

                expect(StompClient.send).toHaveBeenCalledTimes(1);
            });

            it('should execute message queue after connected', function () {
                spyOn(StompClient, 'create').and.returnValue(createStompClient(0));
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

    function createStompClient(readyState) {
        return {
            ws: {
                readyState: readyState
            },
            send: function () {
                console.log('send!');
            },
            connect: function (params, handler) {
                handler();
            }
        };
    }

});

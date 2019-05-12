import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .controller('FlairBiFullscreenController', FlairBiFullscreenController);

FlairBiFullscreenController.$inject = ['$scope',
    'visualMetadata',
    'VisualWrap',
    "datasource",
    "visualizationRenderService",
    "$stateParams",
    "proxyGrpcService",
    "filterParametersService",
    "stompClientService",
    "AuthServerProvider"
];

function FlairBiFullscreenController($scope,
                                     visualMetadata,
                                     VisualWrap,
                                     datasource,
                                     visualizationRenderService,
                                     $stateParams,
                                     proxyGrpcService,
                                     filterParametersService,
                                     stompClientService,
                                     AuthServerProvider) {
    var vm = this;

    vm.visualMetadata = new VisualWrap(visualMetadata);
    vm.datasource = datasource;
    activate();

    ////////////////

    function activate() {
        connectWebSocket();
        proxyGrpcService.forwardCall(vm.datasource.id, {
            queryDTO: vm.visualMetadata.getQueryParameters(filterParametersService.get(), filterParametersService.getConditionExpression()),
            visualMetadata: vm.visualMetadata,
            type:'share-link'
        });
    }

    function connectWebSocket() {
        console.log('flair-bi fullscreen controller connect web socket');
        stompClientService.connect(
            { token: AuthServerProvider.getToken() },
            function(frame) {
                console.log('flair-bi fullscreen controller connected web socket');
                stompClientService.subscribe("/user/exchange/metaData", onExchangeMetadata);
                stompClientService.subscribe("/user/exchange/metaDataError", onExchangeMetadataError);
            }
        );

        $scope.$on("$destroy", function (event) {
            console.log('flair-bi fullscreen destorying web socket');
            stompClientService.disconnect();
        });
    }

    function onExchangeMetadataError(data) {
        console.log('controller on metadata error', data);
    }

    function onExchangeMetadata(data) {
        console.log('controller on metadata', data);
        var metaData = JSON.parse(data.body);
        var contentId = "content-" + $stateParams.id;
        visualizationRenderService.setMetaData(
            vm.visualMetadata,
            metaData,
            contentId
        );
    }

}

(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('FlairBiFullscreenController', FlairBiFullscreenController);

    FlairBiFullscreenController.$inject = ['$scope',
        'visualMetadata',
        'featureEntities',
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
        featureEntities,
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
        vm.features = featureEntities;
        vm.dimensions = featureEntities.filter(function (item) {
            return item.featureType === "DIMENSION";
        });
        vm.datasource = datasource;
        vm.addFilterInQueryDTO = addFilterInQueryDTO;
        activate();

        ////////////////

        function activate() {
            if ($stateParams.filters) {
                addFilterInQueryDTO();
            }
            connectWebSocket();
            proxyGrpcService.forwardCall(vm.datasource.id, {
                queryDTO: vm.visualMetadata.getQueryParameters(filterParametersService.get(), filterParametersService.getConditionExpression()),
                visualMetadata: vm.visualMetadata,
                type: 'share-link',
                validationType: 'REQUIRED_FIELDS'
            }, $stateParams.viewId);
        }

        function connectWebSocket() {
            console.log('flair-bi fullscreen controller connect web socket');
            stompClientService.connect(
                { token: AuthServerProvider.getToken() },
                function (frame) {
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
            var contentId = "content-" + $stateParams.visualisationId;
            visualizationRenderService.setMetaData(
                vm.visualMetadata,
                metaData,
                contentId
            );
        }
        function findDimension(dimension) {
            return vm.dimensions.filter(function (item) {
                return item.name === dimension;
            })
        }
        function addFilterInQueryDTO() {
            var filters = JSON.parse($stateParams.filters);
            var filterKey = Object.keys(filters);
            var filterParameters = filterParametersService.getSelectedFilter();

            filterKey.forEach(element => {
                var dimension = element.replace(":date-range", "");
                var validDimension = findDimension(dimension);
                if (validDimension && validDimension.length > 0) {
                    if (element.endsWith(":date-range")) {

                        filterParameters["date-range|" + dimension] = filters[element];

                        filterParameters["date-range|" + dimension]._meta = {
                            dataType: validDimension[0].type,
                            valueType: 'dateRangeValueType'
                        };
                        filterParametersService.save(filterParameters);
                    }
                    else {
                        filterParameters[element] = filters[element];
                        filterParameters[element]._meta = {
                            dataType: validDimension[0].type,
                            valueType: 'castValueType'
                        };
                        filterParametersService.save(filterParameters);
                    }
                }
            });
        }

    }
})();

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
        "AuthServerProvider",
        "DYNAMIC_DATE_RANGE_CONFIG",
        "DateUtils"
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
        AuthServerProvider,
        DYNAMIC_DATE_RANGE_CONFIG,
        DateUtils) {
        var vm = this;

        vm.visualMetadata = new VisualWrap(visualMetadata);
        vm.features = featureEntities;
        vm.dimensions = featureEntities.filter(function (item) {
            return item.featureType === "DIMENSION";
        });
        vm.datasource = datasource;
        vm.addFilterInQueryDTO = addFilterInQueryDTO;
        vm.dynamicDateRangeConfig = DYNAMIC_DATE_RANGE_CONFIG;
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
        function getStartDateRange() {
            var date = new Date();
            var config = vm.currentDynamicDateRangeConfig;
            if (config.toDate) {
                date = moment(date).startOf(config.toDate).toDate();
                return date;
            }
            return null;
        }
        function getStartDateRangeInterval(filterTime) {

            var activeFilter = vm.dynamicDateRangeConfig.filter(function (item) {
                return item.title === vm.currentDynamicDateRangeConfig;
            });

            var config = vm.currentDynamicDateRangeConfig;
            if (config.toDate) {
                return null;
            } else if (activeFilter[0].isCustom) {
                return filterTime + ' ' + activeFilter[0].unit;
            } else if (activeFilter[0].period.days) {
                return activeFilter[0].period.days + ' days';
            } else if (activeFilter[0].period.months) {
                return activeFilter[0].period.months + ' months';
            }
            return null;
        }


        function addDateRangeFilter(date, dimension) {
            var filterParameters = filterParametersService.getSelectedFilter();
            delete filterParameters[dimension.name];
            if (!filterParameters[dimension.name]) {
                filterParameters[dimension.name] = [];
            }
            filterParameters[dimension.name].push(date);
            filterParameters[dimension.name]._meta = {
                dataType: dimension.type,
                valueType: 'dateRangeValueType'
            };
            filterParametersService.save(filterParameters);
        }

        function addFilterInQueryDTO() {
            var filters = JSON.parse($stateParams.filters);
            var filterKey = Object.keys(filters);
            var filterParameters = filterParametersService.getSelectedFilter();

            filterKey.forEach(element => {
                var validDimension = findDimension(element);
                if (validDimension && validDimension.length > 0) {

                    if (Array.isArray(filters[element])) {
                        filterParameters[element] = filters[element];
                        filterParameters[element]._meta = {
                            dataType: validDimension[0].type,
                            valueType: 'castValueType'
                        };
                        filterParametersService.save(filterParameters);
                    }
                    else {
                        if (filters[element].type == "date-range") {
                            filterParameters[element] = filters[element].value;

                            filterParameters[element]._meta = {
                                dataType: validDimension[0].type,
                                valueType: 'dateRangeValueType'
                            };
                            filterParametersService.save(filterParameters);
                        }
                        else if (filters[element].type == "custom-date") {
                            vm.currentDynamicDateRangeConfig = filters[element].value[0];
                            var startDateRange = getStartDateRange();
                            var startDate;
                            if (startDateRange) {
                                startDate = DateUtils.formatDate(DateUtils.resetTimezone(DateUtils.strToDate(startDateRange)));
                            } else {
                                var startDateRangeInterval = getStartDateRangeInterval(filters[element].value[1]);
                                startDate = "__FLAIR_INTERVAL_OPERATION(NOW(), '-', '" + startDateRangeInterval + "')";
                            }
                            var endDate = '__FLAIR_NOW()';
                            if (startDate) {
                                startDate = DateUtils.resetTimezoneDate(startDate);
                                addDateRangeFilter(startDate, validDimension[0]);
                            }
                            if (endDate) {
                                endDate = DateUtils.resetTimezoneDate(endDate);
                                addDateRangeFilter(endDate, validDimension[0]);
                            }
                        }
                    }

                }
            });
        }
    }
})();

(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('FlairBiFullscreenController', FlairBiFullscreenController);

    FlairBiFullscreenController.$inject = ['$scope',
        'visualMetadata',
        'featureEntities',
        'entity',
        'VisualWrap',
        "datasource",
        "visualizationRenderService",
        "$stateParams",
        "proxyGrpcService",
        "filterParametersService",
        "stompClientService",
        "AuthServerProvider",
        "DYNAMIC_DATE_RANGE_CONFIG",
        "DateUtils",
        "favouriteFilterService",
        "$rootScope",
        "$window",
        "VisualizationUtils",
        "ExportService",
        "D3Utils",
    ];

    function FlairBiFullscreenController($scope,
        visualMetadata,
        featureEntities,
        entity,
        VisualWrap,
        datasource,
        visualizationRenderService,
        $stateParams,
        proxyGrpcService,
        filterParametersService,
        stompClientService,
        AuthServerProvider,
        DYNAMIC_DATE_RANGE_CONFIG,
        DateUtils,
        favouriteFilterService,
        $rootScope,
        $window,
        VisualizationUtils,
        ExportService,
        D3Utils) {
        var vm = this;

        vm.visualMetadata = new VisualWrap(visualMetadata);
        vm.features = featureEntities;
        vm.dimensions = featureEntities.filter(function (item) {
            return item.featureType === "DIMENSION";
        });
        vm.datasource = datasource;
        vm.view = entity;
        vm.addFilterInQueryDTO = addFilterInQueryDTO;
        vm.dynamicDateRangeConfig = DYNAMIC_DATE_RANGE_CONFIG;
        vm.onFiltersOpen = onFiltersOpen;
        vm.exportData = exportData;
        vm.sideBarTab = "filters";
        vm.isExport = false;
        activate();

        ////////////////

        function activate() {
            $('body').css('overflow-y', "hidden");
            vm.isExport = filterParametersService.getParameterByName("isExport", $window.location.href);
            if ($stateParams.filters) {
                addFilterInQueryDTO();
            } else {
                filterParametersService.clear();
            }
            const applied = filterParametersService.applyViewFeatureCriteria(vm.view.viewFeatureCriterias, featureEntities);
            filterParametersService.applyDefaultFilters(applied, featureEntities);
            if (vm.isExport) {
                VisualizationUtils.setPropertyValue(vm.visualMetadata.properties, 'Limit');
            }
            connectWebSocket();
        }

        function connectWebSocket() {
            console.log('flair-bi fullscreen controller connect web socket');
            stompClientService.connect({
                    token: AuthServerProvider.getToken()
                },
                function (frame) {
                    console.log('flair-bi fullscreen controller connected web socket');
                    stompClientService.subscribe("/user/exchange/metaData/" + $stateParams.visualisationId, onExchangeMetadata);
                    stompClientService.subscribe("/user/exchange/metaDataError", onExchangeMetadataError);
                }
            );

            $scope.$on("$destroy", function (event) {
                console.log('flair-bi fullscreen destorying web socket');
                stompClientService.disconnect();
            });
        }

        function onExchangeMetadataError(data) {
            angular.element("#loader-spinner").hide();
            console.log('controller on metadata error', data);
        }

        function onExchangeMetadata(data) {
            console.log('controller on metadata', data);
            var metaData = data.body === "" ? {
                data: []
            } : JSON.parse(data.body);
            if (data.headers.request === "share-link-filter") {
                $rootScope.$broadcast(
                    "flairbiApp:filters-meta-Data",
                    metaData.data,
                    favouriteFilterService.getFavouriteFilter()
                );
            } else {
                vm.visualMetadata.data = metaData.data;
                createVisualisation();
                angular.element("#loader-spinner").hide();
            }
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
            vm.activeFilter = activeFilter;

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

        function getStartDateRangeTimeUnit(filterTime) {

            var activeFilter = vm.dynamicDateRangeConfig.filter(function (item) {
                return item.title === vm.currentDynamicDateRangeConfig;
            });

            var config = vm.currentDynamicDateRangeConfig;
            if (config.toDate) {
                return null;
            } else if (activeFilter[0].isCustom && activeFilter[0].startDay) {
                return "'" + activeFilter[0].startDayUnit + "'";
            }
            return null;
        }


        function addDateRangeFilter(date, dimension) {
            var filterParameters = filterParametersService.getSelectedFilter();
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
                vm.dimensions.map(function (item, index) {
                    if (item.name === element) {
                        vm.dimensionPosition = index;
                    };
                })
                var validDimension = findDimension(element);
                if (validDimension && validDimension.length > 0) {

                    if (Array.isArray(filters[element])) {
                        filterParameters[element] = filters[element];
                        filterParameters[element]._meta = {
                            dataType: validDimension[0].type,
                            valueType: 'castValueType'
                        };
                        filterParametersService.save(filterParameters);

                        var myFilters = filterParametersService.get()[element] || filterParametersService.get()[element.toLowerCase()];

                        vm.dimensions[vm.dimensionPosition].selected = []
                        if (myFilters && myFilters.length > 0) {
                            vm.dimensions[vm.dimensionPosition].selected = myFilters.map(function (item) {
                                var newItem = {};
                                newItem['text'] = item;
                                return newItem;
                            });
                        }
                    } else {
                        if (filters[element].type == "date-range") {
                            filterParameters[element] = filters[element].value;

                            filterParameters[element]._meta = {
                                dataType: validDimension[0].type,
                                valueType: 'dateRangeValueType'
                            };
                            filterParametersService.save(filterParameters);
                            vm.dimensions[vm.dimensionPosition].metadata = {}
                            vm.dimensions[vm.dimensionPosition].selected = filters[element].value[0]
                            vm.dimensions[vm.dimensionPosition].selected2 = filters[element].value[1]
                            vm.dimensions[vm.dimensionPosition].metadata.currentDynamicDateRangeConfig = null;
                            vm.dimensions[vm.dimensionPosition].metadata.dateRangeTab = 1;
                            vm.dimensions[vm.dimensionPosition].metadata.customDynamicDateRange = 0;
                        } else if (filters[element].type == "custom-date") {
                            vm.currentDynamicDateRangeConfig = filters[element].value[0];
                            var startDateRange = getStartDateRange();
                            var startDate;
                            if (startDateRange) {
                                startDate = DateUtils.formatDate(DateUtils.resetTimezone(DateUtils.strToDate(startDateRange)));
                            } else {
                                var startDateRangeInterval = getStartDateRangeInterval(filters[element].value[1]);
                                const timeUnit = getStartDateRangeTimeUnit() || '';
                                startDate = "__FLAIR_INTERVAL_OPERATION(NOW(" + timeUnit + "), '-', '" + startDateRangeInterval + "')";
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
                            vm.dimensions[vm.dimensionPosition].metadata = {}
                            vm.dimensions[vm.dimensionPosition].metadata.currentDynamicDateRangeConfig = vm.activeFilter[0];
                            vm.dimensions[vm.dimensionPosition].metadata.dateRangeTab = 2;
                            vm.dimensions[vm.dimensionPosition].metadata.customDynamicDateRange = 0;

                        }
                    }


                }
            });
        }

        function onFiltersOpen() {
            $rootScope.updateWidget = {};
            vm.isOpen = !vm.isOpen;
            $rootScope.$broadcast("flairbiApp:toggleFilters-on");

            var isIframe = filterParametersService.getParameterByName("ifIframe", $window.location.href);
            if (isIframe) {
                var url = filterParametersService.removeURLParameter($window.location.href, "ifIframe");
                $window.open(url, '_blank');
            } else {
                if (vm.isOpen) {
                    showSideBar();
                    $('#slider').css('display', 'block');
                    createVisualisation();
                } else {
                    $('.widget-container-share-link').css('width', '100%').css('width', '-=16px');
                    $('#slider').css('display', 'none');
                    createVisualisation()
                }
            }
        }

        function showSideBar() {

            var wg = $(".widget-container-share-link").width();
            var sb = $("#slider").width();
            $(".widget-container-share-link").width(wg - sb - 1);
            createVisualisation();
        }

        function createVisualisation() {
            var contentId = "content-" + $stateParams.visualisationId;
            var metaData = {};
            metaData.data = vm.visualMetadata.data;
            visualizationRenderService.setMetaData(
                vm.visualMetadata,
                metaData,
                contentId,
                false,
                true
            );
        }

        function exportData() {
            var csv = transformToCsv(vm.visualMetadata.data);
            ExportService.exportCSV(vm.visualMetadata.titleProperties.titleText + ".csv", csv);
        }

        function transformToCsv(data) {
            var csv = [];

            var features = VisualizationUtils.getDimensionsAndMeasures(vm.visualMetadata.fields),
                measures = features.measures,
                measuresList = D3Utils.getNames(measures),
                footer = [],
                values = [],
                header = [];

            data.forEach(function (item, index) {
                values = [];
                header = [];
                for (var key in item) {
                    if (Object.prototype.hasOwnProperty.call(item, key)) {
                        var val = item[key] === null ? "null" : item[key];
                        if (index == 0) {
                            header.push(key);
                        }
                        values.push(val);
                    }
                }
                if (header.length > 0) {
                    csv.push(header);
                }
                csv.push(values);
            });

            csv[0].forEach(key => {
                if (measuresList.indexOf(key) !== -1) {
                    var sum = getTotal(data, key)
                    footer.push(sum);
                } else {
                    footer.push("");
                }
            });
            csv.push(footer);
            return csv;
        }

        function getTotal(data, key) {
            var sum = 0;
            data.forEach(element => {
                sum += element[key];
            });
            return parseFloat(sum).toFixed(2);
        }

    }
})();
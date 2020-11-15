(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .directive('visualizationRenderGrpc', Directive);

    Directive.$inject = [];

    function Directive() {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            bindToController: true,
            controller: VisualizationRenderGrpcController,
            controllerAs: 'vm',
            link: link,
            restrict: 'A',
            scope: {
                canBuild: '=',
                data: '=',
                widget: '@',
                id: '@',
                drilldowns: '=',
                datasource: '='
            }
        };
        return directive;

        function link(scope, element, attrs) { }
    }

    VisualizationRenderGrpcController.$inject = [
        '$scope',
        '$rootScope',
        'GenerateStackedverticalbarChart',
        'GenerateStackedhorizontalbarChart',
        'GenerateClusteredverticalbarChart',

        'GenerateClusteredhorizontalbarChart',
        'GenerateLineChart',
        'GeneratePieChart',
        'GenerateDoughnutChart',
        'GenerateComboChart',
        'GenerateGaugePlot',
        'GenerateInfoGraphic',
        'GenerateKPI',
        'GenerateTable',
        'GenerateMap',
        'GenerateScatterPlot',
        'GenerateTreemap',
        'GenerateHeatmap',
        'GenerateBoxplot',
        'GenerateTextObject',
        'GenerateBulletChart',
        'GenerateChordDiagram',
        'GenerateWordCloud',
        'GenerateSankey',
        'GeneratePivotTable',
        'GenerateDateRange',
        'GeneratePieGridChart',
        'GenerateNumberGridChart',
        'GenerateIframe',
        'proxyGrpcService',
        'filterParametersService',
        '$log',
        '$timeout',
        '$stateParams',
        'Visualmetadata'
    ];
    /* @ngInject */
    function VisualizationRenderGrpcController(
        $scope,
        $rootScope,
        GenerateStackedverticalbarChart,
        GenerateStackedhorizontalbarChart,
        GenerateClusteredverticalbarChart,

        GenerateClusteredhorizontalbarChart,
        GenerateLineChart,
        GeneratePieChart,
        GenerateDoughnutChart,
        GenerateComboChart,
        GenerateGaugePlot,
        GenerateInfoGraphic,
        GenerateKPI,
        GenerateTable,
        GenerateMap,
        GenerateScatterPlot,
        GenerateTreemap,
        GenerateHeatmap,
        GenerateBoxplot,
        GenerateTextObject,
        GenerateBulletChart,
        GenerateChordDiagram,
        GenerateWordCloud,
        GenerateSankey,
        GeneratePivotTable,
        GenerateDateRange,
        GeneratePieGridChart,
        GenerateNumberGridChart,
        GenerateIframe,
        proxyGrpcService,
        filterParametersService,
        $log,
        $timeout,
        $stateParams,
        Visualmetadata
    ) {

        var vm = this;
        var widgets = [];
        var timeout = null;
        activate();

        function activate() {
            vm.id = vm.id || 'no-id-defined';
            vm.canBuild = vm.canBuild || false;

            widgets.GenerateStackedverticalbarChart = GenerateStackedverticalbarChart;
            widgets.GenerateStackedhorizontalbarChart = GenerateStackedhorizontalbarChart;
            widgets.GenerateClusteredverticalbarChart = GenerateClusteredverticalbarChart;

            widgets.GenerateClusteredhorizontalbarChart = GenerateClusteredhorizontalbarChart;
            widgets.GenerateLineChart = GenerateLineChart;
            widgets.GeneratePieChart = GeneratePieChart;
            widgets.GenerateDoughnutChart = GenerateDoughnutChart;
            widgets.GenerateComboChart = GenerateComboChart;
            widgets.GenerateGaugePlot = GenerateGaugePlot;
            widgets.GenerateInfoGraphic = GenerateInfoGraphic;
            widgets.GenerateMap = GenerateMap;
            widgets.GenerateScatterPlot = GenerateScatterPlot;
            widgets.GenerateKPI = GenerateKPI;
            widgets.GenerateTable = GenerateTable;
            widgets.GenerateTreemap = GenerateTreemap;
            widgets.GenerateHeatmap = GenerateHeatmap;
            widgets.GenerateBoxplot = GenerateBoxplot;
            widgets.GenerateTextObject = GenerateTextObject;
            widgets.GenerateBulletChart = GenerateBulletChart;
            widgets.GenerateChordDiagram = GenerateChordDiagram;
            widgets.GenerateWordCloud = GenerateWordCloud;
            widgets.GenerateSankey = GenerateSankey;
            widgets.GeneratePivotTable = GeneratePivotTable;
            widgets.GenerateDateRange = GenerateDateRange;
            widgets.GeneratePieGridChart = GeneratePieGridChart;
            widgets.GenerateNumberGridChart = GenerateNumberGridChart;
            widgets.GenerateIframe = GenerateIframe;
            registerCanBuildChange();
            registerFilterEvent();
            registerResizeWidgetEvent();
            registerUpdateWidgetEvent();
            registerRefreshWidgetEvent();
            registerIdChanges();
            registerTimeout();
        }

        function registerTimeout() {
            $scope.$on('$destroy', () => {
                clearDeferred();
            });
        }

        function registerCanBuildChange() {
            $scope.$watch(function () {
                return vm.canBuild;
            }, function (newVal, oldVal) {
                if (vm.canBuild) {
                    deferred(() => {
                        build(true);
                    });
                }
            });
        }


        function registerIdChanges() {
            $scope.$watch(function () {
                return vm.id;
            }, function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    vm.id = newVal;
                    registerResizeWidgetEvent();
                    registerUpdateWidgetEvent();
                    registerRefreshWidgetEvent();
                }
            });
        }

        function clearDeferred() {
            if (timeout) {
                $timeout.cancel(timeout);
            }
        }

        function deferred(func, delay) {
            delay = delay || 500
            clearDeferred();
            timeout = $timeout(func, delay);
        }

        /**
         * Build current visualization with data and filters
         *
         * @param {Boolean} forceQuery : if querying for data must be done
         */
        function build(forceQuery) {
            if (forceQuery) {
                angular.element("#loader-spinner").show();
                proxyGrpcService.forwardCall(vm.datasource.id, {
                    queryDTO: vm.data.getQueryParameters(filterParametersService,
                        filterParametersService.getConditionExpression(),
                        $rootScope.activePage.activePageNo),
                    visualMetadata: vm.data,
                    validationType: 'REQUIRED_FIELDS',
                    actionType: $stateParams.isExport ? 'EXPORT' : null,
                    type : $stateParams.id ? null : 'share-link'
                }, $stateParams.id ? $stateParams.id : $stateParams.viewId);

            } else {
                if (!vm.data.data) {
                    proxyGrpcService.forwardCall(vm.data.views.viewDashboard.dashboardDatasources.id, {
                        queryDTO: vm.data.getQueryParameters(filterParametersService,
                            filterParametersService.getConditionExpression(),
                            $rootScope.activePage.activePageNo),
                        visualmetadata: vm.data,
                        validationType: 'REQUIRED_FIELDS'
                    });
                } else {
                    createWidget(vm.data);
                }
            }
        }

        function createWidget(visualMetadata) {
            var widgetId = '#' + vm.id;
            var el = $(widgetId);
            var width = el.width(),
                height = el.height();
            var panel = $('.grid-stack');

            if (vm.data.isSaved) {
                widgets[vm.widget].build(
                    visualMetadata,
                    el,
                    panel
                );
            }
            else {
                Visualmetadata.get({
                    id: vm.data.id
                }, function (v) {
                    v.data = vm.data.data;
                    widgets[vm.widget].build(
                        v,
                        el,
                        panel
                    );
                });
            }
        }

        function onForwardCallSuccess(result) {
        }

        function onForwardCallError(reason) {

        }

        function registerUpdateWidgetEvent() {
            var unsubscribe = $scope.$on('update-widget-' + vm.id, function (event, result) {
                if (vm.canBuild && vm.data.isSaved) {
                    if (result) {
                        vm.data.fields = result;
                        build(true);
                    }
                    else {
                        build(true);
                    }
                }
            });

            $scope.$on('$destroy', unsubscribe);
        }

        function registerRefreshWidgetEvent() {
            var unsubscribe = $scope.$on('refresh-widget-' + vm.id, function (event, result) {
                if (vm.canBuild) {
                    if (vm.data.data) {
                        build(false);
                    }
                    else {
                        build(true);
                    }
                }
            });

            $scope.$on('$destroy', unsubscribe);
        }

        function registerFilterEvent() {
            var unsubscribeFilter = $scope.$on('flairbiApp:filter', function (event) {
                if (vm.canBuild) {
                    deferred(() => {
                        build(true);
                    });
                }
            });

            $scope.$on('$destroy', unsubscribeFilter);
        }

        function registerResizeWidgetEvent() {
            var unsubscribe = $scope.$on('resize-widget-' + vm.id, function () {
                $timeout(function () {
                    if (vm.canBuild) {
                        build();
                    }
                }, 500);
            });

            $scope.$on('$destroy', unsubscribe);

        }

    }
})();

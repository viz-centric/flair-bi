(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .directive('visualizationRender', Directive);

    Directive.$inject = [];

    function Directive() {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            bindToController: true,
            controller: VisualizationRenderController,
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

    VisualizationRenderController.$inject = [
        '$scope',
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
        'GenerateIframe',
        'GenerateDateRange',
        'GeneratePieGridChart',
        'GenerateNumberGridChart',
        'proxyService',
        'filterParametersService',
        '$log',
        '$timeout'
    ];
    /* @ngInject */
    function VisualizationRenderController(
        $scope,
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
        GenerateIfram,
        GenerateDateRange,
        GeneratePieGridChart,
        GenerateNumberGridChart,
        proxyService,
        filterParametersService,
        $log,
        $timeout
    ) {

        var vm = this;
        var widgets = [];
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
            widgets.GenerateIframe = GenerateIframe;
            widgets.GeneratePieGridChart = GeneratePieGridChart;
            widgets.GenerateNumberGridChart = GenerateNumberGridChart;
            registerCanBuildChange();
            registerFilterEvent();
            registerResizeWidgetEvent();
            registerUpdateWidgetEvent();


        }

        function registerCanBuildChange() {
            $scope.$watch(function () {
                return vm.canBuild;
            }, function (newVal, oldVal) {
                if (vm.canBuild) {
                    build(true);
                }
            });
        }


        /**
         * Build current visualization with data and filters
         *
         * @param {Boolean} forceQuery : if querying for data must be done
         */
        function build(forceQuery) {
            if (forceQuery) {
                proxyService.forwardCall(vm.datasource.id, {
                    queryDTO: vm.data.getQueryParameters(filterParametersService,
                        filterParametersService.getConditionExpression()),
                    visualMetadata: vm.data
                })
                    .then(onForwardCallSuccess, onForwardCallError);
            } else {
                if (!vm.data.data) {
                    proxyService.forwardCall(vm.data.views.viewDashboard.dashboardDatasources.id, {
                        queryDTO: vm.data.getQueryParameters(filterParametersService,
                            filterParametersService.getConditionExpression()),
                        visualmetadata: vm.data
                    })
                        .then(onForwardCallSuccess, onForwardCallError);
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
            var widget = widgets[vm.widget];

            widgets[vm.widget].build(
                visualMetadata,
                el,
                panel
            );
        }

        function onForwardCallSuccess(result) {
            vm.data.data = result.data.data;
            createWidget(vm.data);
        }

        function onForwardCallError(reason) {

        }

        function registerUpdateWidgetEvent() {
            var unsubscribe = $scope.$on('update-widget-' + vm.id, function (event, result) {
                if (vm.canBuild) {
                    build(true);
                }
            });

            $scope.$on('$destroy', unsubscribe);
        }

        function registerFilterEvent() {
            var unsubscribeFilter = $scope.$on('flairbiApp:filter', function (event) {
                if (vm.canBuild) {
                    build(true);
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

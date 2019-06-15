(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('notificationSetComponent', {
            templateUrl: 'app/home/notification-set.component.html',
            controller: notificationSetController,
            controllerAs: 'vm'
        });

    notificationSetController.$inject = ['$scope', '$state', 'alertsService', 'stompClientService', 'AuthServerProvider', 'schedulerService', 'Visualmetadata', 'VisualizationUtils', 'D3Utils'];

    function notificationSetController($scope, $state, alertsService, stompClientService, AuthServerProvider, schedulerService, Visualmetadata, VisualizationUtils, D3Utils) {
        var vm = this;
        vm.pageSize = 5;
        vm.setPage = setPage;
        vm.nextPage = nextPage;
        vm.prevPage = prevPage;
        vm.range = range;
        vm.noOfPages = 1;
        vm.currentPage = 0;
        vm.count = 0;
        vm.pagedItems = [];
        vm.visualmetadata = [];
        var index = 0;

        active();

        function active() {
            // vm.alerts=vm.releaseAlert.alerts;
            // vm.count=vm.releaseAlert.count;
            vm.pagedItems = []
           
            connectWebSocket();
            getScheduledReportsCount();
        }

        function getSchedulerReportsAndEngineData(pageSize, page) {
            index = 0;
            schedulerService.getSchedulerReportsAndEngineData(pageSize, page);
        }

        function onGetReleaseAlertsError(error) {

        }

        function range(start, end) {
            var ret = [];
            if (!end) {
                end = start;
                start = 0;
            }
            for (var i = start; i < end; i++) {
                ret.push(i);
            }
            return ret;
        };

        function prevPage() {
            if (vm.currentPage > 0) {
                vm.currentPage--;
                getSchedulerReportsAndEngineData(vm.pageSize, vm.currentPage);
            }
        };

        function nextPage() {
            if (vm.currentPage < vm.noOfPages - 1) {
                vm.currentPage++;
                getSchedulerReportsAndEngineData(vm.pageSize, vm.currentPage);
            }
        };

        function setPage(n) {
            vm.currentPage = n;
            getSchedulerReportsAndEngineData(vm.pageSize, vm.currentPage);
        };
        function connectWebSocket() {
            stompClientService.connect(
                { token: AuthServerProvider.getToken() },
                function (frame) {
                    vm.pagedItems = [];
                    stompClientService.subscribe("/user/exchange/scheduledReports", onExchangeMetadata);
                    stompClientService.subscribe("/user/exchange/metaDataError", onExchangeMetadataError);
                }
            );

            $scope.$on("$destroy", function (event) {
                vm.pagedItems = [];
                stompClientService.disconnect();
            });
        }

        function onExchangeMetadataError(data) {
        }

        function onExchangeMetadata(data) {
            var metaData = JSON.parse(data.body);
            var container = d3.select("#notification_accordion");

            var isExpand;
            $("#notification_accordion").html('');
            Visualmetadata.get({
                id: metaData.report_line_item.visualizationid

            }).
                $promise.then(
                    function (response) {
                        var obj = {};
                        index = index + 1
                        if (parseInt(index) <= 3) {
                            isExpand = 'panel-collapse collapse in'
                        }
                        else {
                            isExpand = 'panel-collapse collapse'
                        }
                        obj.data = JSON.parse(metaData.queryResponse).data;
                        obj.title = metaData.report.title_name;
                        obj.property = response.properties;
                        obj.visualization = metaData.report_line_item.visualization;
                        obj.visualizationid = metaData.report_line_item.visualizationid;
                        var features = VisualizationUtils.getDimensionsAndMeasuresForNotification(response.fields),
                            dimensions = features.dimensions,
                            measures = features.measures,
                            colorSet = D3Utils.getDefaultColorset();

                        vm.visualmetadata.push(response);
                        var notification = container.append('div')
                            .classed('panel', true)
                            .classed('panel-default', true)
                            .attr('id', 'panel_' + metaData.report_line_item.visualizationid)

                        var title = ' <div class="panel-heading">' +
                            '<h4 class="panel-title">' +
                            '<a data-toggle="collapse" data-parent="#notification_accordion" href="#' + metaData.report_line_item.visualizationid + '"' +
                            'class="collapsed" aria-expanded="false">' + metaData.report.title_name +
                            ' </a>' +
                            '</h4>' +
                            '</div>' +
                            '<div id="' + metaData.report_line_item.visualizationid + '" class="' + isExpand + '">' +
                            '<div class="panel-body">' +

                            '<svg height="200" width="280" id="svg_' + metaData.report_line_item.visualizationid + '"></svg>' +
                            '<div class="notification_details">' +
                            '<div >' +
                            '<a role="button" class="btn btn-link"  href="' + metaData.report.share_link
                            + '" target="_blank">View Widget</a>' +
                            '<a role="button" class="btn btn-link" href="' + metaData.report.build_url + '" target="_blank">View Dashboard</a>' +

                            '</div>' +
                            '<div class="text-truncate" title="' + metaData.report.mail_body + '">' +
                            metaData.report.mail_body +

                            '</div>' +
                            '<div class="custom_tooltip">' +
                            '</div>' +

                            ' </div>' +
                            '   </div>';

                        if (obj.visualization == "Info graphic" || obj.visualization == "KPI") {
                            var title = ' <div class="panel-heading">' +
                                '<h4 class="panel-title">' +
                                '<a data-toggle="collapse" data-parent="#notification_accordion" href="#' + metaData.report_line_item.visualizationid + '"' +
                                'class="collapsed" aria-expanded="false">' + metaData.report.title_name +
                                ' </a>' +
                                '</h4>' +
                                '</div>' +
                                '<div id="' + metaData.report_line_item.visualizationid + '" class="' + isExpand + '">' +
                                '<div style="width: 280px; height: 200px;" class="panel-body" id=div_' + metaData.report_line_item.visualizationid + '>' +
                                ' </div>' +
                                '<div class="notification_details">' +
                                '<div >' +
                                '<a role="button" class="btn btn-link"  href="' + metaData.report.share_link
                                + '" target="_blank">View Widget</a>' +
                                '<a role="button" class="btn btn-link" href="' + metaData.report.build_url + '" target="_blank">View Dashboard</a>' +

                                '</div>' +
                                '<div class="text-truncate" title="' + metaData.report.mail_body + '">' +
                                metaData.report.mail_body +

                                '</div>' +
                                '<div class="custom_tooltip">' +
                                '</div>' +

                                ' </div>' +
                                '   </div>';
                            '   </div>';
                            $("#panel_" + metaData.report_line_item.visualizationid).append(title)
                        }
                        else {
                            $("#panel_" + metaData.report_line_item.visualizationid).append(title)
                        }


                        var result = {};
                        if (obj.visualization == "Clustered Vertical Bar Chart" || obj.visualization == "Clustered Horizontal Bar Chart" || obj.visualization == "Stacked Horizontal Bar Chart" || obj.visualization == "Stacked Vertical Bar Chart") {

                            result['dimension'] = D3Utils.getNames(dimensions);
                            result['measure'] = D3Utils.getNames(measures);
                            result['showXaxis'] = false;
                            result['showYaxis'] = false;
                            result['xAxisColor'] = VisualizationUtils.getPropertyValue(obj.property, 'X Axis Colour');
                            result['yAxisColor'] = VisualizationUtils.getPropertyValue(obj.property, 'Y Axis Colour');
                            result['showXaxisLabel'] = false;
                            result['showYaxisLabel'] = false;
                            result['showLegend'] = false;
                            result['legendPosition'] = VisualizationUtils.getPropertyValue(obj.property, 'Legend position').toLowerCase();
                            result['showGrid'] = false

                            result['displayName'] = metaData.report_line_item.dimension[0];

                            result['showValues'] = [];
                            result['displayNameForMeasure'] = [];
                            result['fontStyle'] = [];
                            result['fontWeight'] = [];
                            result['fontSize'] = [];
                            result['numberFormat'] = [];
                            result['textColor'] = [];
                            result['displayColor'] = [];
                            result['borderColor'] = [];

                            for (var i = 0; i < measures.length; i++) {

                                result['showValues'].push(false);
                                result['displayNameForMeasure'].push(
                                    VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name') ||
                                    metaData.report_line_item.measure[i]
                                );
                                result['fontStyle'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
                                result['fontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
                                result['fontSize'].push(parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size')));
                                result['numberFormat'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
                                result['textColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
                                var displayColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour');
                                result['displayColor'].push((displayColor == null) ? colorSet[i] : displayColor);
                                var borderColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Border colour');
                                result['borderColor'].push((borderColor == null) ? colorSet[i] : borderColor);
                            }
                            obj.config = result;
                            d3.select('#svg_' + obj.visualizationid).html('');
                            var svg = d3.select('#svg_' + obj.visualizationid)

                            if (obj.visualization == "Clustered Vertical Bar Chart") {
                                var clusteredverticalbar = flairVisualizations.clusteredverticalbar()
                                    .config(obj.config)
                                    .tooltip(true)
                                    .notification(true)
                                    .print(true);

                                svg.datum(obj.data)
                                    .call(clusteredverticalbar);
                            }
                            else if (obj.visualization == "Clustered Horizontal Bar Chart") {
                                var clusteredhorizontalbar = flairVisualizations.clusteredhorizontalbar()
                                    .config(obj.config)
                                    .tooltip(true)
                                    .notification(true)
                                    .print(true);

                                svg.datum(obj.data)
                                    .call(clusteredhorizontalbar);
                            }
                            else if (obj.visualization == "Stacked Vertical Bar Chart") {
                                var stackedverticalbar = flairVisualizations.stackedverticalbar()
                                    .config(obj.config)
                                    .tooltip(true)
                                    .notification(true)
                                    .print(true);

                                svg.datum(obj.data)
                                    .call(stackedverticalbar);
                            }
                            else if (obj.visualization == "Stacked Horizontal Bar Chart") {
                                var stackedhorizontalbar = flairVisualizations.stackedhorizontalbar()
                                    .config(obj.config)
                                    .tooltip(true)
                                    .notification(true)
                                    .print(true);

                                svg.datum(obj.data)
                                    .call(stackedhorizontalbar);
                            }

                        }
                        if (obj.visualization == "Line Chart") {

                            result['dimension'] = D3Utils.getNames(dimensions);
                            result['measure'] = D3Utils.getNames(measures);
                            result['showXaxis'] = false;
                            result['showYaxis'] = false;
                            result['xAxisColor'] = VisualizationUtils.getPropertyValue(obj.property, 'X Axis Colour');
                            result['yAxisColor'] = VisualizationUtils.getPropertyValue(obj.property, 'Y Axis Colour');
                            result['showXaxisLabel'] = false;
                            result['showYaxisLabel'] = false;
                            result['showLegend'] = false;
                            result['legendPosition'] = VisualizationUtils.getPropertyValue(obj.property, 'Legend position').toLowerCase();
                            result['showGrid'] = false

                            result['displayName'] = metaData.report_line_item.dimension[0];

                            result['showValues'] = [];
                            result['displayNameForMeasure'] = [];
                            result['fontStyle'] = [];
                            result['fontWeight'] = [];
                            result['fontSize'] = [];
                            result['numberFormat'] = [];
                            result['textColor'] = [];
                            result['displayColor'] = [];
                            result['borderColor'] = [];
                            result['lineType'] = [];
                            result['pointType'] = [];

                            for (var i = 0; i < measures.length; i++) {

                                result['showValues'].push(false);
                                result['displayNameForMeasure'].push(
                                    VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name') ||
                                    metaData.report_line_item.measure[i]
                                );
                                result['fontStyle'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
                                result['fontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
                                result['fontSize'].push(parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size')));
                                result['numberFormat'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
                                result['textColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
                                var displayColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour');
                                result['displayColor'].push((displayColor == null) ? colorSet[i] : displayColor);
                                var borderColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Border colour');
                                result['borderColor'].push((borderColor == null) ? colorSet[i] : borderColor);
                                result['lineType'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Line Type').toLowerCase());
                                result['pointType'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Line Chart Point type'));
                            }
                            obj.config = result;
                            d3.select('#svg_' + obj.visualizationid).html('');
                            var svg = d3.select('#svg_' + obj.visualizationid)


                            var line = flairVisualizations.line()
                                .config(obj.config)
                                .tooltip(true)
                                .notification(true)
                                .print(true);

                            svg.datum(obj.data)
                                .call(line);
                        }
                        if (obj.visualization == "Combo Chart") {

                            result['dimension'] = D3Utils.getNames(dimensions);
                            result['measure'] = D3Utils.getNames(measures);
                            result['showXaxis'] = false;
                            result['showYaxis'] = false;
                            result['xAxisColor'] = VisualizationUtils.getPropertyValue(obj.property, 'X Axis Colour');
                            result['yAxisColor'] = VisualizationUtils.getPropertyValue(obj.property, 'Y Axis Colour');
                            result['showXaxisLabel'] = false;
                            result['showYaxisLabel'] = false;
                            result['showLegend'] = false;
                            result['legendPosition'] = VisualizationUtils.getPropertyValue(obj.property, 'Legend position').toLowerCase();
                            result['showGrid'] = false

                            result['displayName'] = metaData.report_line_item.dimension[0];

                            result['showValues'] = [];
                            result['displayNameForMeasure'] = [];
                            result['fontStyle'] = [];
                            result['fontWeight'] = [];
                            result['fontSize'] = [];
                            result['numberFormat'] = [];
                            result['textColor'] = [];
                            result['displayColor'] = [];
                            result['borderColor'] = [];
                            result['lineType'] = [];
                            result['pointType'] = [];
                            result['comboChartType'] = [];

                            for (var i = 0; i < measures.length; i++) {

                                result['showValues'].push(false);
                                result['displayNameForMeasure'].push(
                                    VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name') ||
                                    metaData.report_line_item.measure[i]
                                );
                                result['fontStyle'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
                                result['fontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
                                result['fontSize'].push(parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size')));
                                result['numberFormat'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
                                result['textColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
                                var displayColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour');
                                result['displayColor'].push((displayColor == null) ? colorSet[i] : displayColor);
                                var borderColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Border colour');
                                result['borderColor'].push((borderColor == null) ? colorSet[i] : borderColor);
                                result['lineType'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Line Type').toLowerCase());
                                result['pointType'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Line Chart Point type'));
                                result['comboChartType'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Combo chart type'));
                            }
                            obj.config = result;
                            d3.select('#svg_' + obj.visualizationid).html('');
                            var svg = d3.select('#svg_' + obj.visualizationid)


                            var combo = flairVisualizations.combo()
                                .config(obj.config)
                                .tooltip(true)
                                .notification(true)
                                .print(true);

                            svg.datum(obj.data)
                                .call(combo);
                        }
                        if (obj.visualization == "Pie Chart") {
                            result['dimension'] = D3Utils.getNames(dimensions);
                            result['measure'] = D3Utils.getNames(measures);
                            result['legend'] = false
                            result['legendPosition'] = VisualizationUtils.getPropertyValue(obj.property, 'Legend position').toLowerCase();
                            result['valueAs'] = VisualizationUtils.getPropertyValue(obj.property, 'Show value as').toLowerCase();
                            result['valueAsArc'] = VisualizationUtils.getPropertyValue(obj.property, 'Value as Arc');
                            result['valuePosition'] = VisualizationUtils.getPropertyValue(obj.property, 'Value position').toLowerCase();

                            obj.config = result;
                            d3.select('#svg_' + obj.visualizationid).html('');
                            var svg = d3.select('#svg_' + obj.visualizationid)

                            var pie = flairVisualizations.pie()
                                .config(obj.config)
                                .tooltip(true)
                                .notification(true)
                                .print(false)

                            svg.datum(obj.data)
                                .call(pie);
                        }
                        if (obj.visualization == "Doughnut Chart") {
                            result['dimension'] = D3Utils.getNames(dimensions);
                            result['measure'] = D3Utils.getNames(measures);
                            result['legend'] = false
                            result['legendPosition'] = VisualizationUtils.getPropertyValue(obj.property, 'Legend position').toLowerCase();
                            result['valueAs'] = VisualizationUtils.getPropertyValue(obj.property, 'Show value as').toLowerCase();
                            result['valueAsArc'] = VisualizationUtils.getPropertyValue(obj.property, 'Value as Arc');
                            result['valuePosition'] = VisualizationUtils.getPropertyValue(obj.property, 'Value position').toLowerCase();

                            result['dimensionDisplayName'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Display name') || result['dimension'][0];
                            result['measureDisplayName'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Display name') || result['measure'][0];

                            result['fontSize'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font size');
                            result['fontStyle'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font style');
                            result['fontWeight'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font weight');
                            result['showLabel'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Show Labels');
                            result['fontColor'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Colour of labels');

                            obj.config = result;
                            d3.select('#svg_' + obj.visualizationid).html('');
                            var svg = d3.select('#svg_' + obj.visualizationid)

                            var doughnut = flairVisualizations.doughnut()
                                .config(obj.config)
                                .tooltip(true)
                                .notification(true)
                                .print(false)

                            svg.datum(obj.data)
                                .call(doughnut);
                        }
                        if (obj.visualization == "Info graphic") {
                            result['dimension'] = D3Utils.getNames(dimensions);
                            result['measure'] = D3Utils.getNames(measures);

                            result['chartType'] = VisualizationUtils.getPropertyValue(obj.property, 'Info graphic Type').toLowerCase();
                            var displayColor = VisualizationUtils.getFieldPropertyValue(measures[0], 'Display colour');
                            result['chartDisplayColor'] = (displayColor == null) ? colorSet[0] : displayColor;
                            var borderColor = VisualizationUtils.getFieldPropertyValue(measures[0], 'Border colour');
                            result['chartBorderColor'] = (borderColor == null) ? colorSet[1] : borderColor;

                            result['kpiDisplayName'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Display name') || result['dimension'][0];
                            result['kpiAlignment'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Text alignment');
                            result['kpiBackgroundColor'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Background Colour');
                            result['kpiNumberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Number format');
                            result['kpiFontStyle'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font style');
                            result['kpiFontWeight'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font weight');
                            result['kpiFontSize'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font size');
                            result['kpiColor'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Text colour');
                            result['kpiColorExpression'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Text colour expression');
                            result['kpiIcon'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Icon name');
                            result['kpiIconFontWeight'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Icon Font weight');
                            result['kpiIconColor'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Icon colour');
                            result['kpiIconExpression'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Icon Expression');

                            obj.config = result;
                            d3.select('#div_' + obj.visualizationid).html('');
                            var svg = d3.select('#div_' + obj.visualizationid)

                            var infographics = flairVisualizations.infographics()
                                .config(obj.config)
                                .notification(true)
                                .tooltip(true)
                                .print(true)

                            svg.datum(obj.data)
                                .call(infographics);
                        }
                        if (obj.visualization == "KPI") {
                            result['measure'] = D3Utils.getNames(measures);
                            result['kpiDisplayName'] = [];
                            result['kpiAlignment'] = [];
                            result['kpiBackgroundColor'] = [];
                            result['kpiNumberFormat'] = [];
                            result['kpiFontStyle'] = [];
                            result['kpiFontWeight'] = [];
                            result['kpiFontSize'] = [];
                            result['kpiColor'] = [];
                            result['kpiColorExpression'] = [];
                            result['kpiIcon'] = [];
                            result['kpiIconFontWeight'] = [];
                            result['kpiIconColor'] = [];
                            result['kpiIconExpression'] = [];
                            result['FontSizeforDisplayName'] = [];

                            for (var i = 0; i < measures.length; i++) {

                                result['kpiDisplayName'].push(
                                    VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name') ||
                                    result['measure'][i]
                                );
                                result['kpiAlignment'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text alignment'));
                                result['kpiBackgroundColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Background Colour'));
                                result['kpiNumberFormat'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
                                result['kpiFontStyle'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
                                result['kpiFontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
                                result['kpiFontSize'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size'));
                                result['kpiColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
                                result['kpiColorExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour expression'));
                                result['kpiIcon'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon name'));
                                result['kpiIconFontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon Font weight'));
                                result['kpiIconColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon colour'));
                                result['kpiIconExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon Expression'));
                                result['FontSizeforDisplayName'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size for diplay name'));
                            }

                            obj.config = result;
                            d3.select('#div_' + obj.visualizationid).html('');
                            var svg = d3.select('#div_' + obj.visualizationid)

                            var infographics = flairVisualizations.kpi()
                                .config(obj.config)
                                .print(true)

                            svg.datum(obj.data)
                                .call(infographics);
                        }
                        if (obj.visualization == "Scatter plot") {

                            result['dimension'] = D3Utils.getNames(dimensions);
                            result['measure'] = D3Utils.getNames(measures);
                            result['showXaxis'] = false;
                            result['showYaxis'] = false;
                            result['xAxisColor'] = VisualizationUtils.getPropertyValue(obj.property, 'X Axis Colour');
                            result['yAxisColor'] = VisualizationUtils.getPropertyValue(obj.property, 'Y Axis Colour');
                            result['showXaxisLabel'] = false;
                            result['showYaxisLabel'] = false;
                            result['showLegend'] = false;
                            result['legendPosition'] = VisualizationUtils.getPropertyValue(obj.property, 'Legend position').toLowerCase();
                            result['showGrid'] = false

                            result['displayName'] = metaData.report_line_item.dimension[0];

                            result['showValues'] = [];
                            result['displayNameForMeasure'] = [];
                            result['fontStyle'] = [];
                            result['fontWeight'] = [];
                            result['fontSize'] = [];
                            result['numberFormat'] = [];
                            result['textColor'] = [];
                            result['displayColor'] = [];
                            result['borderColor'] = [];
                            result['lineType'] = [];
                            result['pointType'] = [];

                            for (var i = 0; i < measures.length; i++) {

                                result['showValues'].push(false);
                                result['displayNameForMeasure'].push(
                                    VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name') ||
                                    metaData.report_line_item.measure[i]
                                );
                                result['fontStyle'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
                                result['fontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
                                result['fontSize'].push(parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size')));
                                result['numberFormat'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
                                result['textColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
                                var displayColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour');
                                result['displayColor'].push((displayColor == null) ? colorSet[i] : displayColor);
                                var borderColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Border colour');
                                result['borderColor'].push((borderColor == null) ? colorSet[i] : borderColor);

                            }
                            obj.config = result;
                            d3.select('#svg_' + obj.visualizationid).html('');
                            var svg = d3.select('#svg_' + obj.visualizationid)

                            var scatter = flairVisualizations.scatter()
                                .config(obj.config)
                                .tooltip(true)
                                .notification(true)
                                .print(true);

                            svg.datum(obj.data)
                                .call(scatter);
                        }
                        if (obj.visualization == "Gauge plot") {

                            result['measures'] = D3Utils.getNames(measures);
                            result['gaugeType'] = VisualizationUtils.getPropertyValue(obj.property, 'Gauge Type').toLowerCase();

                            result['displayName'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Display name') || result['measures'][0];
                            result['fontStyle'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font style');
                            result['fontWeight'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font weight');
                            result['showValues'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Value on Points');
                            var displayColor = VisualizationUtils.getFieldPropertyValue(measures[0], 'Display colour');
                            result['displayColor'] = (displayColor == null) ? colorSet[0] : displayColor
                            result['isGradient'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Enable Gradient Color');
                            result['textColor'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Text colour');
                            result['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Number format');

                            result['targetDisplayName'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Display name') || result['measures'][1];
                            result['targetFontStyle'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Font style');
                            result['targetFontWeight'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Font weight');
                            result['targetShowValues'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Value on Points');
                            var targetDisplayColor = VisualizationUtils.getFieldPropertyValue(measures[1], 'Display colour');
                            result['targetDisplayColor'] = (targetDisplayColor == null) ? colorSet[1] : targetDisplayColor
                            result['targetTextColor'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Text colour');
                            result['targetNumberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Number format');

                            obj.config = result;
                            d3.select('#svg_' + obj.visualizationid).html('');
                            var svg = d3.select('#svg_' + obj.visualizationid)

                            var gauge = flairVisualizations.gauge()
                                .config(obj.config)
                                .print(true);

                            svg.datum(obj.data)
                                .call(gauge);
                        }
                        vm.pagedItems.push(obj)

                    },
                    function (error) { }
                );
        }

        function getScheduledReportsCount() {
            schedulerService.getScheduledReportsCount().then(function (result) {
                vm.count = result.data;
                vm.noOfPages = Math.ceil(vm.count / vm.pageSize);
            }, onGetScheduledReportsCountError);
        }

        function onGetScheduledReportsCountError(error) {

        }
    }
})();
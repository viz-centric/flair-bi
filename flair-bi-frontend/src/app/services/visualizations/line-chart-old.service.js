import angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .factory('GenerateLineChart', GenerateLineChart);

GenerateLineChart.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils', 'filterParametersService'];

function GenerateLineChart(VisualizationUtils, $rootScope, D3Utils, filterParametersService) {
    return {
        build: function (record, element, panel) {

            if ((!record.data) || ((record.data instanceof Array) && (!record.data.length))) {
                element.css({
                    'display': 'flex',
                    'align-items': 'center',
                    'justify-content': 'center'
                });

                element[0].innerHTML = "Data not available";

                return;
            }

            function getProperties(VisualizationUtils, record) {
                var result = {};

                var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
                    dimensions = features.dimensions,
                    measures = features.measures,
                    eachMeasure,
                    allMeasures = [],
                    colorSet = D3Utils.getDefaultColorset();

                result['dimension'] = D3Utils.getNames(dimensions);
                result['measures'] = D3Utils.getNames(measures);

                result['maxMes'] = measures.length;

                result['showXaxis'] = VisualizationUtils.getPropertyValue(record.properties, 'Show X Axis');
                result['showYaxis'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Y Axis');
                result['xAxisColor'] = VisualizationUtils.getPropertyValue(record.properties, 'X Axis Colour');
                result['yAxisColor'] = VisualizationUtils.getPropertyValue(record.properties, 'Y Axis Colour');
                result['showXaxisLabel'] = VisualizationUtils.getPropertyValue(record.properties, 'Show X Axis Label');
                result['showYaxisLabel'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Y Axis Label');
                result['showLegend'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Legend');
                result['legendPosition'] = VisualizationUtils.getPropertyValue(record.properties, 'Legend position');
                result['showGrid'] = VisualizationUtils.getPropertyValue(record.properties, 'Show grid');
                result['stacked'] = VisualizationUtils.getPropertyValue(record.properties, 'Stacked');

                result['displayName'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Display name');

                for (var i = 0; i < result.maxMes; i++) {
                    eachMeasure = {};
                    eachMeasure['measure'] = result['measures'][i];
                    eachMeasure['showValues'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Value on Points');
                    eachMeasure['displayName'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name');
                    eachMeasure['fontStyle'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style');
                    eachMeasure['fontWeight'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight');
                    eachMeasure['fontSize'] = parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size'));
                    eachMeasure['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format');
                    eachMeasure['textColor'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour');
                    eachMeasure['displayColor'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour');
                    eachMeasure['displayColor'] = (eachMeasure['displayColor'] == null) ? colorSet[i] : eachMeasure['displayColor'];
                    eachMeasure['borderColor'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Border colour');
                    eachMeasure['borderColor'] = (eachMeasure['borderColor'] == null) ? colorSet[i] : eachMeasure['borderColor'];
                    eachMeasure['lineType'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Line Type');
                    eachMeasure['pointType'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Line Chart Point type');
                    allMeasures.push(eachMeasure);
                }

                result['measureProp'] = allMeasures;

                return result;
            }

            var Helper = (function () {

                var DEFAULT_COLOR = "#bdbdbd";

                function Helper(config) {
                    this.config = config;
                    this.maxMes = config.maxMes;
                    this.dimension = config.dimension;
                    this.measures = config.measures;
                    this.showXaxis = config.showXaxis;
                    this.showYaxis = config.showYaxis;
                    this.xAxisColor = config.xAxisColor;
                    this.yAxisColor = config.yAxisColor;
                    this.showXaxisLabel = config.showXaxisLabel;
                    this.showYaxisLabel = config.showYaxisLabel;
                    this.showLegend = config.showLegend;
                    this.legendPosition = config.legendPosition;
                    this.showGrid = config.showGrid;
                    this.stacked = config.stacked;
                    this.displayName = config.displayName;
                    this.measureProp = config.measureProp;
                }

                Helper.prototype.getMargin = function () {
                    return {
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 45
                    };
                }

                Helper.prototype.getPadding = function () {
                    return 20;
                }

                Helper.prototype.isLegendVisible = function () {
                    return this.showLegend;
                }

                Helper.prototype.getLegendPosition = function () {
                    return this.legendPosition.toLowerCase();
                }

                Helper.prototype.getGridVisibility = function () {
                    return this.showGrid ? 'visible' : 'hidden';
                }

                Helper.prototype.getXaxisColor = function () {
                    return this.xAxisColor;
                }

                Helper.prototype.getYaxisColor = function () {
                    return this.yAxisColor;
                }

                Helper.prototype.getXaxisVisibility = function () {
                    return this.showXaxis ? 'visible' : 'hidden';
                }

                Helper.prototype.getYaxisVisibility = function () {
                    return this.showYaxis ? 'visible' : 'hidden';
                }

                Helper.prototype.getXaxisLabelVisibility = function () {
                    return this.showXaxisLabel ? 'visible' : 'hidden';
                }

                Helper.prototype.getYaxisLabelVisibility = function () {
                    return this.showYaxisLabel ? 'visible' : 'hidden';
                }

                Helper.prototype.setAxisColor = function (scope) {
                    var container = d3.select(scope.container);

                    var xTicks = container.selectAll('#x_axis .tick'),
                        yTicks = container.selectAll('#y_axis .tick');

                    container.select('#x_axis path')
                        .style('stroke', this.xAxisColor);

                    xTicks.select('line')
                        .style('visibility', 'hidden')
                        .style('stroke', this.xAxisColor);

                    container.select('.tick-labels').selectAll('text')
                        .style('fill', this.xAxisColor);

                    container.select('#y_axis path')
                        .style('stroke', this.yAxisColor);

                    yTicks.select('line')
                        .style('visibility', 'hidden')
                        .style('stroke', this.yAxisColor);

                    yTicks.select('text')
                        .style('fill', this.yAxisColor);

                    xTicks.select('text')
                        .style('fill', this.xAxisColor);
                }

                Helper.prototype.getGlobalMinMax = function (data) {
                    var me = this;

                    var allValues = [],
                        min,
                        max;

                    data.forEach(function (d) {
                        me.measures.forEach(function (m) {
                            allValues.push(d[m] || 0);
                        })
                    });

                    min = Math.min.apply(Math, allValues);
                    max = Math.max.apply(Math, allValues);

                    min = min > 0 ? 0 : min

                    return [min, max];
                }

                Helper.prototype.getXLabels = function (data) {
                    var me = this;
                    return data.map(function (d) { return d[me.dimension[0]]; })
                }

                Helper.prototype.getDimDisplayName = function () {
                    return this.displayName;
                }

                Helper.prototype.getMesDisplayName = function (index) {
                    if (typeof (index) !== 'undefined') {
                        return this.measureProp[index]['displayName'];
                    }

                    return this.measureProp.map(function (p) { return p.displayName; }).join(', ');
                }

                Helper.prototype.getValueNumberFormat = function (data, index) {
                    var si = this.measureProp[index]['numberFormat'],
                        nf = D3Utils.getNumberFormatter(si);

                    return nf;
                }

                Helper.prototype.getDisplayColor = function (data, index) {
                    return this.measureProp[index]['displayColor'] || DEFAULT_COLOR;
                }

                Helper.prototype.getBorderColor = function (data, index) {
                    return this.measureProp[index]['borderColor'] || DEFAULT_COLOR;
                }

                Helper.prototype.getValueColor = function (data, index) {
                    return this.measureProp[index]['textColor'] || DEFAULT_COLOR;
                }

                Helper.prototype.getValueVisibility = function (data, index) {
                    var isVisible = this.measureProp[index]['showValues'];

                    if (isVisible) {
                        return 'visible';
                    }

                    return 'hidden';
                }

                Helper.prototype.getValueFontStyle = function (data, index) {
                    return this.measureProp[index]['fontStyle'];
                }

                Helper.prototype.getValueFontWeight = function (data, index) {
                    return this.measureProp[index]['fontWeight'];
                }

                Helper.prototype.getValueFontSize = function (data, index) {
                    return this.measureProp[index]['fontSize'];
                }

                Helper.prototype.getLineType = function (data, index) {
                    return this.measureProp[index]['lineType'].toLowerCase() == "area" ? "visible" : "hidden";
                }

                Helper.prototype.getPointType = function (data, index) {
                    var symbol = null;

                    switch (this.measureProp[index]['pointType'].toLowerCase()) {
                        case "rectrounded":
                            symbol = d3.symbolDiamond;
                            break;

                        case "rectrot":
                            symbol = d3.symbolDiamond;
                            break;

                        case "star":
                            symbol = d3.symbolStar;
                            break;

                        case "triangle":
                            symbol = d3.symbolTriangle;
                            break;

                        case "circle":
                            symbol = d3.symbolCircle;
                            break;

                        case "cross":
                            symbol = d3.symbolCross;
                            break;

                        case "crossrot":
                            symbol = d3.symbolCross;
                            break;

                        case "dash":
                            symbol = d3.symbolWye;
                            break;

                        case "line":
                            symbol = d3.symbolWye;
                            break;

                        case "rect":
                            symbol = d3.symbolSquare;
                            break;

                        default:
                            symbol = d3.symbolCircle;
                    }

                    return symbol;
                }

                Helper.prototype.toggleSortSelection = function (scope, sortType, callback) {
                    var _onRadioButtonClick = function (event) {
                        var persistence = $rootScope.persistence[scope.id];

                        if (typeof (persistence) == 'undefined') {
                            $rootScope.persistence[scope.id] = {
                                'sort': {
                                    'type': sortType,
                                    'measure': event.data.measure
                                }
                            };
                        } else {
                            persistence['sort'] = {
                                'type': sortType,
                                'measure': event.data.measure
                            };
                        }

                        d3.select(scope.container).select('.line-plot').remove();
                        callback.call(scope, D3Utils.sortData(event.data.data, event.data.measure, sortType));
                    }

                    return function (d, i) {
                        // Prevent firing of svg click event
                        d3.event.stopPropagation();

                        var sortWindow = d3.select(scope.container).select('.sort_selection')
                            .style('visibility', 'visible');

                        sortWindow.selectAll('div').remove();

                        var downArrow = d3.select(scope.container).select('.arrow-down')
                            .style('visibility', 'visible');

                        var options,
                            selected;

                        if (Object.keys($rootScope.persistence).indexOf(scope.id) != -1) {
                            var sort = $rootScope.persistence[scope.id]['sort'];
                            if (sort.type == sortType) {
                                selected = sort.measure;
                            }
                        }

                        for (var i = 0; i < scope.helper.maxMes; i++) {
                            var _divRadio = $('<div></div>').addClass('radio');
                            options = '<label><input type="radio" '
                                + (selected == scope.helper.measures[i] ? 'checked' : '')
                                + ' name="optradio">'
                                + scope.helper.measures[i]
                                + '</label>';

                            _divRadio.append(options);
                            $(sortWindow.node()).append(_divRadio);

                            _divRadio.find('input').click({
                                data: scope.originalData,
                                measure: scope.helper.measures[i]
                            }, _onRadioButtonClick);
                        }

                        D3Utils.positionDownArrow(scope.container, downArrow.node(), sortType);
                        D3Utils.positionSortSelection(scope.container, sortWindow.node());
                    }
                }

                Helper.prototype.toggleTooltip = function (visibility, scope) {
                    return function (d, i) {
                        var element = d3.select(this),
                            si = scope.helper.measureProp[d['index']]['numberFormat'],
                            nf = D3Utils.getNumberFormatter(si),
                            displayName = scope.helper.getDimDisplayName(),
                            dimension = d['data'][scope.helper.dimension],
                            measures = scope.helper.measures[d['index']],
                            measuresFormate = D3Utils.getFormattedValue(d['data'][scope.helper.measures[d['index']]], nf);
                        D3Utils.contentTooltip(visibility, scope, element, displayName, dimension, measures, measuresFormate);
                    }
                }

                Helper.prototype.onLassoStart = function (lasso, scope) {
                    return function () {
                        if ($rootScope.filterSelection.lasso) {
                            lasso.items()
                                .classed('not_possible', true)
                                .classed('selected', false);
                        }
                    }
                }

                Helper.prototype.onLassoDraw = function (lasso, scope) {
                    return function () {
                        $rootScope.filterSelection.lasso = true;
                        lasso.items()
                            .classed('selected', false);

                        lasso.possibleItems()
                            .classed('not_possible', false)
                            .classed('possible', true);

                        lasso.notPossibleItems()
                            .classed('not_possible', true)
                            .classed('possible', false);
                    }
                }

                Helper.prototype.onLassoEnd = function (lasso, scope) {
                    return function () {
                        var data = lasso.selectedItems().data();

                        if ($rootScope.filterSelection.id && $rootScope.filterSelection.id != record.id) {
                            return;
                        }

                        if (!$rootScope.filterSelection.lasso) {
                            return;
                        }

                        lasso.items()
                            .classed('not_possible', false)
                            .classed('possible', false);

                        lasso.selectedItems()
                            .classed('selected', true)

                        lasso.notSelectedItems();

                        var confirm = d3.select(scope.container).select('.confirm')
                            .style('visibility', 'visible');

                        var filter = {};
                        $rootScope.filterSelection.id = scope.id;

                        data.forEach(function (d) {
                            if (filter[scope.helper.dimension]) {
                                var temp = filter[scope.helper.dimension];
                                if (temp.indexOf(d['data'][scope.helper.dimension]) < 0) {
                                    temp.push(d['data'][scope.helper.dimension]);
                                }
                                filter[scope.helper.dimension] = temp;
                            } else {
                                filter[scope.helper.dimension] = [d['data'][scope.helper.dimension]];
                            }
                        });

                        // Clear out the updateWidget property
                        var idWidget = $rootScope.updateWidget[scope.id];
                        $rootScope.updateWidget = {};
                        $rootScope.updateWidget[scope.id] = idWidget;

                        $rootScope.filterSelection.filter = filter;
                        filterParametersService.save(filter);
                        $rootScope.$broadcast('flairbiApp:filter-input-refresh');
                        $rootScope.$broadcast('flairbiApp:filter');
                    }
                }

                return Helper;

            })();

            var Line = (function () {

                function Line(container, record, properties) {
                    this.container = container;
                    this.id = record.id;
                    this.originalData = record.data;
                    this.helper = new Helper(properties);
                    this.axisLabelSpace = 20;
                    this.offsetX = 16;
                    this.offsetY = 3;

                    $('#line-' + this.id).remove();
                    var div = d3.select(container).append('div')
                        .attr('id', 'line-' + this.id)
                        .style('width', this.container.clientWidth + 'px')
                        .style('height', this.container.clientHeight + 'px')
                        .style('overflow', 'hidden')
                        .style('text-align', 'center')
                        .style('position', 'relative');

                    div.append('svg');

                    div.append('div')
                        .attr('class', 'tooltip_custom');

                    div.append('div')
                        .attr('class', 'sort_selection');

                    div.append('div')
                        .attr('class', 'arrow-down');

                    D3Utils.prepareFilterButtons(div, $rootScope, filterParametersService);
                }

                Line.prototype.updateChart = function (data) {
                    var me = this;

                    var container = d3.select(this.container);

                    this.originalData = data;

                    var minMax = this.helper.getGlobalMinMax(data),
                        globalMin = minMax[0],
                        globalMax = minMax[1];

                    var xLabels = this.helper.getXLabels(data);

                    var xScale = this.xScale,
                        yScale = this.yScale;

                    xScale.domain(xLabels);

                    yScale.domain([globalMin, globalMax]);

                    var _yTicks = yScale.ticks(),
                        yDiff = _yTicks[1] - _yTicks[0];

                    if ((_yTicks[_yTicks.length - 1] + yDiff) > globalMax + (yDiff / 2)) {
                        yScale.domain([globalMin, (_yTicks[_yTicks.length - 1] + yDiff)])
                    } else {
                        yScale.domain([globalMin, (_yTicks[_yTicks.length - 1] + 2 * yDiff)])
                    }

                    var cluster = container.selectAll('.cluster')
                        .data(data);

                    cluster.exit().remove();
                    cluster.enter().append('g')
                        .attr('class', 'cluster');


                }

                Line.prototype.renderChart = function () {
                    var data = this.originalData;
                    var me = this;

                    var width = this.container.clientWidth;
                    var height = this.container.clientHeight;

                    var dimension = me.helper.dimension,
                        measures = me.helper.measures;

                    var svg = d3.select(this.container).select('svg')
                        .on('click', function () {
                            d3.select(me.container).select('.sort_selection')
                                .style('visibility', 'hidden');

                            d3.select(me.container).select('.arrow-down')
                                .style('visibility', 'hidden');
                        });


                    svg.selectAll('g').remove();

                    svg.attr('width', width)
                        .attr('height', height);

                    var padding = this.helper.getPadding(),
                        margin = this.helper.getMargin();

                    var containerWidth = width - 2 * padding,
                        containerHeight = height - 2 * padding;

                    var container = svg.append('g')
                        .attr('transform', 'translate(' + padding + ', ' + padding + ')');

                    var contentWidth,
                        contentHeight,
                        legendBreak = 0,
                        legendBreakCount = 0;

                    var labelStack = [];

                    var drawLegend = function (data) {
                        var me = this;

                        var legend = container.append('g')
                            .attr('class', 'line-legend')
                            .attr('display', function () {
                                if (me.helper.isLegendVisible()) {
                                    return 'block';
                                }
                                return 'none';
                            })
                            .selectAll('.item')
                            .data(measures)
                            .enter().append('g')
                            .attr('class', 'item')
                            .attr('id', function (d, i) {
                                return 'legend' + i;
                            })
                            .attr('transform', function (d, i) {
                                if (me.helper.getLegendPosition() == 'top') {
                                    return 'translate(' + i * Math.floor(containerWidth / measures.length) + ', 0)';
                                } else if (me.helper.getLegendPosition() == 'bottom') {
                                    return 'translate(' + i * Math.floor(containerWidth / measures.length) + ', ' + containerHeight + ')';
                                } else if (me.helper.getLegendPosition() == 'left') {
                                    return 'translate(0, ' + i * 20 + ')';
                                } else if (me.helper.getLegendPosition() == 'right') {
                                    return 'translate(' + (4 * containerWidth / 5) + ', ' + i * 20 + ')';
                                }
                            })
                            .on('mouseover', function () {
                                d3.select(this).attr('cursor', 'pointer')
                            })
                            .on('mousemove', function () {
                                d3.select(this).attr('cursor', 'pointer')
                            })
                            .on('mouseout', function () {
                                d3.select(this).attr('cursor', 'default')
                            })
                            .on('click', function (d, i) {
                                if (labelStack.indexOf(d) < 0) {
                                    labelStack.push(d);
                                } else {
                                    labelStack.splice(labelStack.indexOf(d), 1);
                                }

                                var o = parseInt(d3.select(this).select('rect').style('fill-opacity'));
                                if (!o) {
                                    d3.select(this).select('rect')
                                        .style('fill-opacity', 1)
                                        .style('stroke-width', 0);
                                } else {
                                    d3.select(this).select('rect')
                                        .style('fill-opacity', 0)
                                        .style('stroke-width', 1);
                                }

                                d3.select(me.container).select('.line-plot').remove();
                                drawPlot.call(me, data);
                            });

                        legend.append('rect')
                            .attr('x', 4)
                            .attr('width', 10)
                            .attr('height', 10)
                            .style('fill', function (d, i) {
                                return me.helper.getDisplayColor(d, i);
                            })
                            .style('stroke', function (d, i) {
                                return me.helper.getDisplayColor(d, i);
                            })
                            .style('stroke-width', 0);

                        legend.append('text')
                            .attr('x', 18)
                            .attr('y', 5)
                            .attr('dy', function (d) {
                                return d3.select(this).style('font-size').replace('px', '') / 2.5;
                            })
                            .text(function (d, i) {
                                return me.helper.getMesDisplayName(i);
                            })
                            .text(function (d, i) {
                                if ((me.helper.getLegendPosition() == 'top') || (me.helper.getLegendPosition() == 'bottom')) {
                                    return D3Utils.getTruncatedLabel(this, me.helper.getMesDisplayName(i), Math.floor(containerWidth / measures.length), 20);
                                } else if ((me.helper.getLegendPosition() == 'left') || (me.helper.getLegendPosition() == 'right')) {
                                    return D3Utils.getTruncatedLabel(this, me.helper.getMesDisplayName(i), containerWidth / 5);
                                }
                            });

                        if ((this.helper.getLegendPosition() == 'top') || (this.helper.getLegendPosition() == 'bottom')) {
                            legend.attr('transform', function (d, i) {
                                var count = i,
                                    widthSum = 0
                                while (count-- != 0) {
                                    widthSum += d3.select(me.container).select('#legend' + count).node().getBBox().width + me.offsetX;
                                }
                                return 'translate(' + widthSum + ', ' + (me.helper.getLegendPosition() == 'top' ? 0 : containerHeight) + ')';
                            });
                        }

                        if (this.helper.getLegendPosition() == 'top') {
                            legend.attr('transform', function (d, i) {
                                var postition = D3Utils.legendPosition(me, i, legendBreakCount, legendBreak);
                                legendBreakCount = postition.split(',')[2];
                                legendBreak = postition.split(',')[3];
                                return 'translate(' + postition.split(',')[0] + ', ' + postition.split(',')[1] + ')';
                            });
                            containerHeight = containerHeight - (20 * legendBreakCount);
                        }

                        if (!me.helper.isLegendVisible()) {
                            this.legendSpace = 0;
                            contentWidth = containerWidth - margin.left;
                            contentHeight = containerHeight - 2 * this.axisLabelSpace;
                        } else {
                            if ((me.helper.getLegendPosition() == 'top') || (me.helper.getLegendPosition() == 'bottom')) {
                                contentWidth = containerWidth - margin.left;
                                contentHeight = containerHeight - 3 * this.axisLabelSpace;
                                this.legendSpace = 20;
                            } else if ((me.helper.getLegendPosition() == 'left') || (me.helper.getLegendPosition() == 'right')) {
                                this.legendSpace = legend.node().parentNode.getBBox().width;
                                contentWidth = (containerWidth - this.legendSpace) - margin.left - this.axisLabelSpace;
                                contentHeight = containerHeight - 2 * this.axisLabelSpace;

                                legend.attr('transform', function (d, i) {
                                    if (me.helper.getLegendPosition() == 'left') {
                                        return 'translate(0, ' + i * 20 + ')';
                                    } else if (me.helper.getLegendPosition() == 'right') {
                                        return 'translate(' + (containerWidth - me.legendSpace) + ', ' + i * 20 + ')';
                                    }
                                });
                            }
                        }
                    }

                    var drawPlot = function (data) {
                        var me = this;

                        var globalMin,
                            globalMax,
                            xLabels;

                        var minMax = this.helper.getGlobalMinMax(data);
                        globalMin = minMax[0];
                        globalMax = minMax[1];

                        xLabels = this.helper.getXLabels(data);

                        var chart = container.append('g')
                            .attr('class', 'line-plot')
                            .attr('transform', function () {
                                if (me.helper.getLegendPosition() == 'top') {
                                    return 'translate(' + margin.left + ', ' + (parseInt(me.legendSpace) + parseInt(legendBreakCount * 20)) + ')';
                                } else if (me.helper.getLegendPosition() == 'bottom') {
                                    return 'translate(' + margin.left + ', 0)';
                                } else if (me.helper.getLegendPosition() == 'left') {
                                    return 'translate(' + (me.legendSpace + me.axisLabelSpace + margin.left) + ', 0)';
                                } else if (me.helper.getLegendPosition() == 'right') {
                                    return 'translate(' + margin.left + ', 0)';
                                }
                            });

                        var xScale = this.xScale = d3.scalePoint()
                            .domain(xLabels)
                            .rangeRound([0, contentWidth])
                            .padding([0.5]);

                        var yScale = this.yScale = d3.scaleLinear()
                            .domain([globalMin, globalMax])
                            .range([contentHeight, 0]);

                        var tickLength = d3.scaleLinear()
                            .domain([22, 34])
                            .range([4, 6]);

                        var _yTicks = yScale.ticks(),
                            yDiff = _yTicks[1] - _yTicks[0];

                        if ((_yTicks[_yTicks.length - 1] + yDiff) > globalMax + (yDiff / 2)) {
                            yScale.domain([globalMin, (_yTicks[_yTicks.length - 1] + yDiff)])
                        } else {
                            yScale.domain([globalMin, (_yTicks[_yTicks.length - 1] + 2 * yDiff)])
                        }

                        var content = chart.append('g')
                            .attr('class', 'chart')

                        var xGridLines = d3.axisBottom()
                            .tickFormat('')
                            .tickSize(-contentHeight)
                            .scale(xScale);

                        var yGridLines = d3.axisLeft()
                            .tickFormat('')
                            .tickSize(-contentWidth)
                            .scale(yScale);

                        content.append('g')
                            .attr('class', 'grid')
                            .attr('visibility', this.helper.getGridVisibility())
                            .attr('transform', 'translate(0, ' + contentHeight + ')')
                            .call(xGridLines);

                        content.append('g')
                            .attr('class', 'grid')
                            .attr('visibility', this.helper.getGridVisibility())
                            .call(yGridLines);

                        // Gridline starts here
                        var crosshair = content.append('g')
                            .attr('class', 'crosshair')
                            .style('display', 'none');

                        crosshair.append('line')
                            .attr('id', 'crosshairLineX')
                            .attr('class', 'crosshairLine');

                        crosshair.append('line')
                            .attr('id', 'crosshairLineY')
                            .attr('class', 'crosshairLine');

                        crosshair.append('circle')
                            .attr('id', 'crosshairCircle')
                            .attr('r', 5)
                            .attr('class', 'circle crosshairCircle');

                        content.append('rect')
                            .attr('class', 'overlay')
                            .attr('width', contentWidth)
                            .attr('height', contentHeight)
                            .on('mouseover', function () {
                                crosshair.style('display', null);
                            })
                            .on('mouseout', function () {
                                crosshair.style('display', 'none');
                            })
                            .on('mousemove', function () {
                                var mouse = d3.mouse(this);

                                var _measures = measures.filter(function (d) {
                                    return labelStack.indexOf(d) == -1;
                                });

                                if (!_measures.length) {
                                    // Implies the legends are turned off
                                    crosshair.style('display', 'none');
                                    return;
                                }

                                // finding x-value
                                var xPos = mouse[0],
                                    xDomain = xScale.domain(),
                                    xRange = xScale.range(),
                                    xRangePoints = d3.range(xRange[0], xRange[1], xScale.step())

                                var xVal = xDomain[d3.bisect(xRangePoints, xPos) - 1];

                                // finding y-value
                                var yPos = yScale.invert(mouse[1]),
                                    yDomain = yScale.domain(),
                                    dataX = data.filter(function (d) { return d[dimension[0]] == xVal; })[0],
                                    yVal = dataX[_measures[0]];

                                _measures.forEach(function (m) {
                                    if (Math.abs(yPos - dataX[m]) < Math.abs(yPos - yVal)) {
                                        yVal = dataX[m];
                                    }
                                });

                                var x = xScale(xVal);
                                var y = yScale(yVal);

                                crosshair.select('#crosshairCircle')
                                    .attr('cx', x)
                                    .attr('cy', y);

                                crosshair.select('#crosshairLineX')
                                    .attr('x1', x)
                                    .attr('x2', x)
                                    .attr('y1', yScale(yDomain[0]))
                                    .attr('y2', yScale(yDomain[1]));

                                crosshair.select('#crosshairLineY')
                                    .attr('x1', xRange[0])
                                    .attr('x2', xRange[1])
                                    .attr('y1', y)
                                    .attr('y2', y);
                            });

                        // Gridline ends here

                        var areaGenerator = d3.area()
                            .curve(d3.curveMonotoneX)
                            .x(function (d, i) {
                                return xScale(d['data'][dimension[0]]);
                            })
                            .y0(contentHeight)
                            .y1(function (d) {
                                return yScale(d['data'][measures[d['index']]]);
                            });

                        var lineGenerator = d3.line()
                            .curve(d3.curveMonotoneX)
                            .x(function (d, i) {
                                return xScale(d['data'][dimension[0]]);
                            })
                            .y(function (d, i) {
                                return yScale(d['data'][measures[d['index']]]);
                            });

                        var cluster = content.selectAll('.cluster')
                            .data(measures.filter(function (d) {
                                return labelStack.indexOf(d) == -1;
                            }))
                            .enter().append('g')
                            .attr('class', 'cluster');

                        var t = d3.transition()
                            .duration(800)
                            .ease(d3.easeQuadIn)
                            .on('end', afterTransition);

                        var area = cluster.append('path')
                            .datum(function (m, i) {
                                return data.map(function (d) { return { "index": measures.indexOf(m), "data": d }; });
                            })
                            .attr('class', 'area')
                            .attr('visibility', function (d, i) {
                                return me.helper.getLineType(d, d[0]['index']);
                            })
                            .attr('fill', function (d, i) {
                                return me.helper.getDisplayColor(d, d[0]['index']);
                            })
                            .style('fill-opacity', 0.5)
                            .attr('stroke', 'none')
                            .attr('d', areaGenerator);

                        var line = cluster.append('path')
                            .datum(function (m, i) {
                                return data.map(function (d) { return { "index": measures.indexOf(m), "data": d }; });
                            })
                            .attr('class', 'line')
                            .attr('fill', 'none')
                            .attr('stroke', function (d, i) {
                                return me.helper.getBorderColor(d, d[0]['index']);
                            })
                            .attr('stroke-linejoin', 'round')
                            .attr('stroke-linecap', 'round')
                            .attr('stroke-width', 1)
                            .attr('d', lineGenerator);

                        function afterTransition() {
                        }

                        var point = cluster.selectAll('.point')
                            .data(function (m, i) {
                                return data.map(function (d) { return { "index": measures.indexOf(m), "data": d }; });
                            })
                            .enter().append('path')
                            .attr('class', 'point')
                            .attr('fill', function (d, i) {
                                return me.helper.getDisplayColor(d, d['index']);
                            })
                            .attr('d', function (d, i) {
                                return d3.symbol()
                                    .type(me.helper.getPointType(d, d['index']))
                                    .size(40)();
                            })
                            .attr('transform', function (d) {
                                return 'translate(' + xScale(d['data'][dimension[0]]) + ',' + yScale(d['data'][measures[d['index']]]) + ')';
                            })
                            .on('mouseover', this.helper.toggleTooltip('visible', me))
                            .on('mousemove', function () {
                                var tooltip = d3.select(me.container).select('.tooltip_custom');

                                var offset = $(me.container).offset();
                                var x = d3.event.pageX - offset.left,
                                    y = d3.event.pageY - offset.top;

                                tooltip.style('top', y + 10 + 'px').style('left', x + 10 + 'px');
                                D3Utils.constrainTooltip(me.container, tooltip.node());
                            })
                            .on('mouseout', this.helper.toggleTooltip('hidden', me))
                            .on('click', function (d, i) {
                                if ($rootScope.filterSelection.id && $rootScope.filterSelection.id != record.id) {
                                    return;
                                }

                                $rootScope.filterSelection.lasso = false;

                                var confirm = d3.select(me.container).select('.confirm')
                                    .style('visibility', 'visible');

                                var filter = {};

                                if ($rootScope.filterSelection.id) {
                                    filter = $rootScope.filterSelection.filter;
                                } else {
                                    $rootScope.filterSelection.id = me.id;
                                }

                                var point = d3.select(this);

                                if (point.classed('selected')) {
                                    point.classed('selected', false);
                                } else {
                                    point.classed('selected', true);
                                }

                                var dimension = me.helper.dimension[0];

                                if (filter[dimension]) {
                                    var temp = filter[dimension];
                                    if (temp.indexOf(d['data'][dimension]) < 0) {
                                        temp.push(d['data'][dimension]);
                                    } else {
                                        temp.splice(temp.indexOf(d['data'][dimension]), 1);
                                    }
                                    filter[dimension] = temp;
                                } else {
                                    filter[dimension] = [d['data'][dimension]];
                                }

                                // Clear out the updateWidget property
                                var idWidget = $rootScope.updateWidget[me.id];
                                $rootScope.updateWidget = {};
                                $rootScope.updateWidget[me.id] = idWidget;

                                $rootScope.filterSelection.filter = filter;
                                filterParametersService.save(filter);
                                $rootScope.$broadcast('flairbiApp:filter-input-refresh');
                                $rootScope.$broadcast('flairbiApp:filter');
                            });

                        var text = cluster.selectAll('text')
                            .data(function (d, i) {
                                return data.map(function (d) { return { "index": i, "data": d }; });
                            })
                            .enter().append('text')
                            .attr('x', function (d, i) {
                                return xScale(d['data'][dimension[0]]);
                            })
                            .attr('y', function (d, i) {
                                return yScale(d['data'][measures[d['index']]]);
                            })
                            .attr('dy', function (d, i) {
                                return -2 * me.offsetY;
                            })
                            .style('text-anchor', 'middle')
                            .text(function (d, i) {
                                return D3Utils.getFormattedValue(d['data'][measures[d['index']]], me.helper.getValueNumberFormat(d, d['index']));
                            })
                            .text(function (d, i) {
                                var width = (1 - xScale.padding()) * contentWidth / (xLabels.length - 1);
                                return D3Utils.getTruncatedLabel(this, d3.select(this).text(), width);
                            })
                            .attr('visibility', function (d, i) {
                                return me.helper.getValueVisibility(d, d['index']);
                            })
                            .style('font-style', function (d, i) {
                                return me.helper.getValueFontStyle(d, d['index']);
                            })
                            .style('font-weight', function (d, i) {
                                return me.helper.getValueFontWeight(d, d['index']);
                            })
                            .style('font-size', function (d, i) {
                                return me.helper.getValueFontSize(d, d['index']);
                            })
                            .style('fill', function (d, i) {
                                return me.helper.getValueColor(d, d['index']);
                            });

                        var axisLeftG = chart.append('g')
                            .attr('class', 'y axis')
                            .attr('visibility', this.helper.getYaxisVisibility())
                            .attr('transform', 'translate(0, 0)');

                        axisLeftG.append('g')
                            .attr('class', 'label')
                            .attr('transform', function () {
                                return 'translate(' + (-margin.left) + ', ' + (contentHeight / 2) + ')';
                            })
                            .append('text')
                            .attr('text-anchor', 'middle')
                            .attr('transform', 'rotate(-90)')
                            .style('fill', function () {
                                return me.helper.getYaxisColor();
                            })
                            .style('visibility', me.helper.getYaxisLabelVisibility())
                            .text(function () {
                                return me.helper.getMesDisplayName();
                            });

                        var axisBottomG = chart.append('g')
                            .attr('class', 'x axis')
                            .attr('visibility', me.helper.getXaxisVisibility())
                            .attr('transform', 'translate(0, ' + contentHeight + ')');

                        axisBottomG.append('g')
                            .attr('class', 'label')
                            .attr('transform', 'translate(' + (contentWidth / 2) + ', ' + (2 * this.axisLabelSpace + 5) + ')')
                            .append('text')
                            .style('font-size', 10)
                            .style('text-anchor', 'middle')
                            .style('fill', function () {
                                return me.helper.getXaxisColor();
                            })
                            .style('visibility', me.helper.getXaxisLabelVisibility())
                            .text(function () {
                                return me.helper.getDimDisplayName();
                            });
                        var isRotate = false;

                        var axisBottom = d3.axisBottom(xScale)
                            .tickFormat(function (d) {
                                if (isRotate == false) {
                                    isRotate = D3Utils.getTickRotate(d, (contentWidth) / (xLabels.length - 1), tickLength);
                                }
                                return D3Utils.getTruncatedTick(d, (contentWidth / (xLabels.length - 1)), tickLength);
                            });

                        axisBottomG.append('g')
                            .attr('id', 'x_axis')
                            .call(axisBottom);

                        if (isRotate) {
                            d3.select(this.container).selectAll('#x_axis .tick text')
                                .attr("transform", "rotate(-15)");
                        }

                        var axisLeft = d3.axisLeft(yScale)
                            .tickFormat(function (d) {
                                if ((contentHeight / yScale.ticks().length) < 11) {
                                    return '';
                                }
                                return D3Utils.getTruncatedTick(D3Utils.shortScale(2)(d), margin.left - 8, tickLength);
                            })

                        axisLeftG.append('g')
                            .attr('id', 'y_axis')
                            .call(axisLeft);

                        var sortButton = container.append('g')
                            .attr('class', 'line-sort')
                            .attr('transform', function () {
                                return 'translate(0, ' + parseInt((containerHeight - 2 * padding + (legendBreakCount * 20))) + ')';
                            })

                        var ascendingSort = sortButton.append('svg:text')
                            .attr('fill', '#afafaf')
                            .attr('cursor', 'pointer')
                            .style('font-family', 'FontAwesome')
                            .style('font-size', 12)
                            .attr('transform', function () {
                                return 'translate(' + (containerWidth - 3 * me.offsetX) + ', ' + 2 * me.axisLabelSpace + ')';
                            })
                            .style('text-anchor', 'end')
                            .text(function () {
                                return "\uf161";
                            })
                            .on('click', this.helper.toggleSortSelection(me, 'ascending', drawPlot));

                        var descendingSort = sortButton.append('svg:text')
                            .attr('fill', '#afafaf')
                            .attr('cursor', 'pointer')
                            .style('font-family', 'FontAwesome')
                            .style('font-size', 12)
                            .attr('transform', function () {
                                return 'translate(' + (containerWidth - 1.5 * me.offsetX) + ', ' + 2 * me.axisLabelSpace + ')';
                            })
                            .style('text-anchor', 'end')
                            .text(function () {
                                return "\uf160";
                            })
                            .on('click', this.helper.toggleSortSelection(me, 'descending', drawPlot));

                        var resetSort = sortButton.append('svg:text')
                            .attr('fill', '#afafaf')
                            .attr('cursor', 'pointer')
                            .style('font-family', 'FontAwesome')
                            .style('font-size', 12)
                            .attr('transform', function () {
                                return 'translate(' + containerWidth + ', ' + 2 * me.axisLabelSpace + ')';
                            })
                            .style('text-anchor', 'end')
                            .text(function () {
                                return "\uf0c9";
                            })
                            .on('click', function () {
                                d3.select(me.container).select('.line-plot').remove();
                                drawPlot.call(me, me.originalData);

                                var persistence = $rootScope.persistence[me.id];
                                persistence['sort'] = {};
                            });

                        me.helper.setAxisColor(this);

                        /*var lasso_area = content.append('rect')
                            .attr('width', contentWidth)
                            .attr('height', contentHeight)
                            .style('opacity', 0);*/

                        var lasso = d3.lasso()
                            .hoverSelect(true)
                            .closePathSelect(true)
                            .closePathDistance(100)
                            .items(point)
                            // .targetArea(lasso_area);
                            .targetArea(svg);

                        lasso.on('start', me.helper.onLassoStart(lasso, me))
                            .on('draw', me.helper.onLassoDraw(lasso, me))
                            .on('end', me.helper.onLassoEnd(lasso, me));

                        // content.call(lasso);
                        svg.call(lasso);
                    }

                    drawLegend.call(this, data);

                    if ((Object.keys($rootScope.persistence).indexOf(this.id) != -1) &&
                        (Object.keys($rootScope.persistence[this.id]['sort']).length)) {
                        var sort = $rootScope.persistence[this.id]['sort'];
                        drawPlot.call(this, D3Utils.sortData(data, sort.measure, sort.type));
                    } else {
                        drawPlot.call(this, data);
                    }
                }

                return Line;

            })();

            if (Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                if ($rootScope.filterSelection.id != record.id) {
                    /*var line = $rootScope.updateWidget[record.id];
                    line.updateChart(record.data);*/

                    // TODO: This needs to be fixed, commented code need to be properly done
                    // ---------------*-----------------
                    var line = new Line(element[0], record, getProperties(VisualizationUtils, record));
                    line.renderChart();

                    $rootScope.updateWidget[record.id] = line;
                    // ---------------*-----------------
                }
            } else {
                var line = new Line(element[0], record, getProperties(VisualizationUtils, record));
                line.renderChart();

                $rootScope.updateWidget[record.id] = line;
            }
        }
    }
}
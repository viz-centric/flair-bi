import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .factory('GenerateInfoGraphic', GenerateInfoGraphic);

GenerateInfoGraphic.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils'];

function GenerateInfoGraphic(VisualizationUtils, $rootScope, D3Utils) {
    return {
        build: function (record, element, panel) {

            function getProperties(VisualizationUtils, record) {
                var result = {};

                var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
                    dimension = features.dimensions,
                    measures = features.measures,
                    eachMeasure,
                    allMeasures = [],
                    colorSet = D3Utils.getDefaultColorset();

                result['dimension'] = D3Utils.getNames(dimension)[0];
                result['measures'] = D3Utils.getNames(measures);
                result['chart'] = VisualizationUtils.getPropertyValue(record.properties, 'Info graphic Type').toLowerCase();
                result['displayColor'] = VisualizationUtils.getFieldPropertyValue(dimension[0], 'Display colour');
                result['displayColor'] = (result['displayColor'] == null) ? colorSet[1] : result['displayColor'];
                result['borderColor'] = VisualizationUtils.getFieldPropertyValue(dimension[0], 'Border colour');
                result['borderColor'] = (result['borderColor'] == null) ? colorSet[0] : result['borderColor'];

                for (var i = 0; i < measures.length; i++) {
                    eachMeasure = {};
                    eachMeasure['displayName'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name');
                    eachMeasure['alignment'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Text alignment');
                    eachMeasure['backgroundColor'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Background Colour');
                    eachMeasure['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format');
                    eachMeasure['textFontStyle'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style');
                    eachMeasure['textFontWeight'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight');
                    eachMeasure['textFontSize'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size');
                    eachMeasure['textColor'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour');
                    eachMeasure['textColorExpression'] = D3Utils.getExpressionConfig(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour expression'), ['color']);
                    eachMeasure['icon'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon name');
                    eachMeasure['iconFontWeight'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon Font weight');
                    eachMeasure['iconExpression'] = D3Utils.getExpressionConfig(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon Expression'), ['icon', 'color']);
                    eachMeasure['iconColour'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon colour');
                    eachMeasure['showdisplayName'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Show Display Name');
                    eachMeasure['NumberColor'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Number Color');
                    eachMeasure['NumberFontsize'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Number Font size');
                    eachMeasure['IconFontsize'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon Font size');
                    allMeasures.push(eachMeasure);
                }

                result['forEachMeasure'] = allMeasures;

                return result;
            }

            var Helper = (function () {

                var DEFAULT_COLOR = "#dedede",
                    DEFAULT_HEIGHT = 50;

                var expressionEvaluator = function (expression, value, key) {
                    var result;

                    for (var i = 0; i < expression.length; i++) {
                        var property = expression[i];
                        if (property.hasOwnProperty('upto')) {
                            if (value <= property.upto) {
                                result = property[key];
                                break;
                            }
                        } else {
                            result = property[key];
                            break;
                        }
                    }

                    return result;
                }

                function Helper(config) {
                    this.config = config;
                    this.dimension = config.dimension;
                    this.measures = config.measures;
                    this.chart = config.chart;
                    this.displayColor = config.displayColor;
                    this.borderColor = config.borderColor;
                    this.forEachMeasure = config.forEachMeasure;
                }

                Helper.prototype.getPadding = function () {
                    return 10;
                }

                Helper.prototype.getChart = function () {
                    return this.chart;
                }

                Helper.prototype.getDisplayColor = function () {
                    return this.displayColor;
                }

                Helper.prototype.getBorderColor = function () {
                    return this.borderColor;
                }

                Helper.prototype.getAlignment = function (index) {
                    return this.forEachMeasure[index]['alignment'];
                }

                Helper.prototype.getNumberFormat = function (index) {
                    var si = this.forEachMeasure[index]['numberFormat'],
                        nf = D3Utils.getNumberFormatter(si);

                    return nf;
                }

                Helper.prototype.getDisplayName = function (index) {
                    if (this.forEachMeasure[index]['showdisplayName'] == true) {
                        return this.forEachMeasure[index]['displayName'];
                    }
                    else {
                        return '';
                    }
                }
                Helper.prototype.getShowDisplayName = function (index) {
                    return this.forEachMeasure[index]['showdisplayName'];
                }
                Helper.prototype.getBackgroundColor = function (index) {
                    return this.forEachMeasure[index]['backgroundColor'];
                }

                Helper.prototype.getTextFontStyle = function (index) {
                    return this.forEachMeasure[index]['textFontStyle'];
                }

                Helper.prototype.getTextFontWeight = function (index) {
                    return this.forEachMeasure[index]['textFontWeight'];
                }

                Helper.prototype.getTextFontSize = function (index) {
                    return this.forEachMeasure[index]['textFontSize'];
                }

                Helper.prototype.getTextColor = function (index) {
                    return this.forEachMeasure[index]['textColor'];
                }
                Helper.prototype.getNumberColor = function (index) {
                    return this.forEachMeasure[index]['NumberColor'];
                }
                Helper.prototype.getNumberFontSize = function (index) {
                    return this.forEachMeasure[index]['NumberFontsize'];
                }
                Helper.prototype.getIconSize = function (index) {
                    return this.forEachMeasure[index]['IconFontsize'];
                }
                Helper.prototype.getTextColorExpression = function (index, value) {
                    var textColor = this.getTextColor(index),
                        textColorExpression = this.forEachMeasure[index]['textColorExpression'];

                    if (textColorExpression.length == 0) {
                        return textColor || DEFAULT_COLOR;
                    }

                    if (isNaN(value)) {
                        return textColorExpression.filter(function (t) { return t.hasOwnProperty('default'); })[0]['color'] || DEFAULT_COLOR;
                        // return textColorExpression.find(obj => obj.hasOwnProperty('default'))['color'] || DEFAULT_COLOR;
                    }

                    return expressionEvaluator(textColorExpression, value, 'color');
                }

                Helper.prototype.getIcon = function (index, value) {
                    var icon = this.forEachMeasure[index]['icon'],
                        iconExpression = this.forEachMeasure[index]['iconExpression'];

                    if (iconExpression.length == 0) {
                        return icon;
                    }

                    if (isNaN(value)) {
                        return iconExpression.filter(function (i) { return i.hasOwnProperty('default'); })[0]['icon'] || icon;
                        // return iconExpression.find(obj => obj.hasOwnProperty('default'))['icon'] || icon;
                    }

                    return expressionEvaluator(iconExpression, value, 'icon');
                }

                Helper.prototype.getIconWeight = function (index) {
                    return this.forEachMeasure[index]['iconFontWeight'];
                }

                Helper.prototype.getIconColor = function (index, value) {
                    var iconExpression = this.forEachMeasure[index]['iconExpression'];

                    if (iconExpression.length == 0) {
                        //return DEFAULT_COLOR;
                        return this.forEachMeasure[index]['iconColour']
                    }

                    if (isNaN(value)) {
                        return iconExpression.filter(function (i) { return i.hasOwnProperty('default'); })[0]['color'] || DEFAULT_COLOR;
                        // return iconExpression.find(obj => obj.hasOwnProperty('default'))['color'] || DEFAULT_COLOR;
                    }

                    return expressionEvaluator(iconExpression, value, 'color');
                }

                Helper.prototype.displayKPI = function (measure, index) {

                    var result = "";

                    var style = {
                        'background-color': 'transparent',
                        'font-style': this.getTextFontStyle(index),
                        'font-weight': this.getTextFontWeight(index),
                        'font-size': this.getTextFontSize(index) + 'px',
                        'color': this.getTextColorExpression(index, measure)
                    };
                    var styleNumber = {
                        'background-color': 'transparent',
                        'font-size': this.getNumberFontSize(index) + 'px',
                        'color': this.getNumberColor(index),
                        'font-style': this.getTextFontStyle(index),
                    };

                    if (index === 0) {
                        // primary measure
                        style['padding'] = "0px 8px";
                        styleNumber['padding'] = "0px 8px";
                        // style['font-size'] = "3em";
                    } else {
                        // secondary measure
                        style['padding'] = "0px 8px 0px 5px";
                        styleNumber['padding'] = "0px 8px 0px 5px";

                        // style['font-size'] = "1.5em";
                    }

                    style = JSON.stringify(style);
                    style = style.replace(/["{}]/g, '').replace(/,/g, ';');
                    styleNumber = JSON.stringify(styleNumber);
                    styleNumber = styleNumber.replace(/["{}]/g, '').replace(/,/g, ';');
                    if (this.getShowDisplayName(index) == true) {
                        result += "<div style='text-align:left'><div  class='title'><i style=\"" + style + "\">" + this.getDisplayName(index) + "</i></div><div class='KPIData'><i class='number' style='" + styleNumber + "'>" + this.getNumberFormat(index)(D3Utils.roundNumber(measure, 2)) + "</i>" + this.iconDisplay(measure, index) + "</div></div>";
                    }
                    else {
                        result += "<div><div class='title'><i class='number' style='" + styleNumber + "'>" + this.getNumberFormat(index)(D3Utils.roundNumber(measure, 2)) + "</i>" + this.iconDisplay(measure, index) + "</div></div>";

                    }
                    return result;
                }

                Helper.prototype.iconDisplay = function (measure, index) {

                    var result = "";
                    var style = {
                        'font-weight': this.getIconWeight(index),
                        'color': this.getIconColor(index, measure),
                        'font-size': this.getIcon(index, measure) != null ? this.getIconSize(index) + 'px' : '0px',
                        'vertical-align': 'super',
                        'background-color': 'transparent',
                        'padding-right': '8px'
                    };
                    style = JSON.stringify(style);
                    style = style.replace(/["{}]/g, '').replace(/,/g, ';');

                    result += "&nbsp;<i class=\"" + this.getIcon(index, measure) + "\" style=\"" + style + "\" aria-hidden=\"true\"></i>"

                    return result;
                }

                Helper.prototype.processTemplate = function (measures) {
                    var me = this;
                    var result = "";

                    measures.forEach(function (m, i) {
                        if (me.getAlignment(i) == "Center") {
                            result += "<div style=\"margin-left: " + 40 + "%;text-align:left\">"
                                + me.displayKPI(m, i)
                                + "</div>";
                        }
                        else if (me.getAlignment(i) == "left") {
                            result += "<div style=\"text-align: " + me.getAlignment(i) + "\">"
                                + me.displayKPI(m, i)
                                + "</div>";
                        }
                        else {
                            result += "<div style=\"float: " + me.getAlignment(i) + "\">"
                                + me.displayKPI(m, i)
                                + "</div>";
                        }

                    });

                    return result;
                }

                Helper.prototype.getMeasureSum = function (data, key) {
                    var sum = 0;

                    data.forEach(function (d) {
                        sum += isNaN(d[key]) ? 0 : d[key];
                    });

                    return sum;
                }

                Helper.prototype.getXLabels = function (data) {
                    var me = this;
                    return data.map(function (d) { return d[me.dimension]; })
                }

                Helper.prototype.getGlobalMinMax = function (data) {
                    var me = this;
                    var allValues = [],
                        min,
                        max;

                    data.forEach(function (d) {
                        allValues.push(isNaN(d[me.measures[0]]) ? 0 : d[me.measures[0]]);
                    });

                    min = Math.min.apply(Math, allValues);
                    max = Math.max.apply(Math, allValues);

                    min = min > 0 ? 0 : min

                    return [min, max];
                }

                Helper.prototype.toggleTooltip = function (visibility, scope) {
                    return function (d, i) {
                        var element = d3.select(this),
                            nf = scope.helper.getNumberFormat(0),
                            displayName = scope.helper.getDisplayName(0),
                            dimension = d[scope.helper.dimension],
                            measures = scope.helper.measures[0],
                            measuresFormate = nf(d[scope.helper.measures[0]]);
                        D3Utils.contentTooltip(visibility, scope, element, displayName, dimension, measures, measuresFormate);
                    }
                }

                return Helper;

            })();

            var InfoGraphics = (function () {

                function InfoGraphics(container, record, properties) {
                    this.container = container;
                    this.id = record.id;
                    this.originalData = record.data;
                    this.helper = new Helper(properties);
                    var infographics_graphics_height = 80;
                    $('#infographics-' + this.id).remove();

                    var div = d3.select(container).append('div')
                        .attr('id', 'infographics-' + this.id)
                        .style('width', this.container.clientWidth + 'px')
                        .style('height', this.container.clientHeight + 'px');

                    if (this.helper.getChart() == 'line') {
                        infographics_graphics_height = 100;
                        var info = div.append('div')
                            .attr('id', 'infographics_info')
                            .style('height', 100 + '%')
                            .style('width', 100 + '%')
                            .style('position', 'absolute')
                            .style('z-index', '5')
                            .style('top', '15px');
                    }
                    else {
                        var info = div.append('div')
                            .attr('id', 'infographics_info');
                    }


                    var graphics = div.append('div')
                        .attr('id', 'infographics_graphics')
                        .style('height', infographics_graphics_height + '%')
                        .append('div')
                        .style('height', function () {
                            return this.parentElement.clientHeight + 'px';
                        })
                        .style('overflow', 'hidden')
                        .style('text-align', 'center')
                        .style('position', 'relative');

                    graphics.append('svg');

                    graphics.append('div')
                        .attr('class', 'tooltip_custom');
                }

                InfoGraphics.prototype.updateChart = function (data) {
                    var me = this;

                    this.originalData = data;
                    var info = d3.select(this.container).select('#infographics_info');

                    info.select('div.child')
                        .html(me.helper.processTemplate(me.helper.measures.map(function (m) {
                            return me.helper.getMeasureSum(data, m);
                        })));

                    d3.select(this.container).select('svg').select('g').remove();

                    switch (me.helper.getChart()) {
                        case "line":
                            plotLineChart.call(this, data);
                            break;

                        case "bar":
                            plotBarChart.call(this, data);
                            break;

                        case "pie":
                            plotPieChart.call(this, data);
                            break;

                        case "discrete":
                            plotDiscreteChart.call(this, data);
                            break;

                        default:
                            plotBarChart.call(this, data);
                    }
                }

                InfoGraphics.prototype.renderChart = function () {
                    var data = this.originalData;
                    var me = this;

                    var info = d3.select(this.container).select('#infographics_info');

                    info.append('div')
                        .attr('class', 'parent')
                        .style('padding', '10px 30px 10px 10px')
                        .append('div')
                        .attr('class', 'child')
                        .html(me.helper.processTemplate(me.helper.measures.map(function (m) {
                            return me.helper.getMeasureSum(data, m);
                        })))
                        .transition()
                        .duration(400)
                        .ease(d3.easeQuadIn)
                        .styleTween('font-size', function () {
                            var i = d3.interpolateNumber(0, 1);
                            return function (t) {
                                return i(t) + "em";
                            };
                        });

                    switch (me.helper.getChart()) {
                        case "line":
                            plotLineChart.call(this, data);
                            break;

                        case "bar":
                            plotBarChart.call(this, data);
                            break;

                        case "pie":
                            plotPieChart.call(this, data);
                            break;

                        case "discrete":
                            plotDiscreteChart.call(this, data);
                            break;

                        default:
                            plotBarChart.call(this, data);
                    }
                }

                // var plotLineChart = function (data) {
                //     var DEFAULT_COLOR = "#dedede";

                //     var me = this;
                //     var svg = d3.select(this.container).select('svg'),
                //         width = +svg.node().clientWidth,
                //         height = +svg.node().clientHeight;

                //     var globalMin,
                //         globalMax,
                //         xLabels;

                //     var minMax = this.helper.getGlobalMinMax(data);
                //     globalMin = minMax[0];
                //     globalMax = minMax[1];

                //     xLabels = this.helper.getXLabels(data);

                //     var padding = this.helper.getPadding();

                //     var containerWidth = width - 2 * padding,
                //         containerHeight = height - 2 * padding;

                //     var container = svg.append('g')
                //         .attr('transform', 'translate(' + padding + ', ' + padding + ')');

                //     var xScale = d3.scalePoint()
                //         .domain(xLabels)
                //         .rangeRound([0, containerWidth])
                //         .padding([0.2]);

                //     var yScale = d3.scaleLinear()
                //         .domain([globalMin, globalMax])
                //         .range([containerHeight, 0]);

                //     var chart = container.append('g')
                //         .attr('class', 'chart')

                //     var lineGenerator = d3.line()
                //         // .curve(d3.curveCardinal)
                //         .x(function (d, i) {
                //             return xScale(d['data'][me.helper.dimension]);
                //         })
                //         .y(function (d, i) {
                //             return yScale(d['data'][me.helper.measures[d['index']]]);
                //         });

                //     var line = chart.selectAll('.line')
                //         .data([me.helper.measures[0]])
                //         .enter().append('g')
                //         .attr('class', 'line');

                //     var path = line.append('path')
                //         .datum(function (d, i) {
                //             return data.map(function (d) { return { "index": i, "data": d }; });
                //         })
                //         .attr('fill', 'none')
                //         .attr('stroke', function (d, i) {
                //             return me.helper.getBorderColor();
                //         })
                //         .attr('stroke-linejoin', 'round')
                //         .attr('stroke-linecap', 'round')
                //         .attr('stroke-width', 1)
                //         .attr('d', lineGenerator);

                //     var point = line.selectAll('circle')
                //         .data(function (d, i) {
                //             return data.map(function (d) { return { "index": i, "data": d }; });
                //         })
                //         .enter().append('circle')
                //         .attr('fill', function (d, i) {
                //             return me.helper.getDisplayColor();
                //         })
                //         .attr('cx', function (d, i) {
                //             return xScale(d['data'][me.helper.dimension]);
                //         })
                //         .attr('cy', function (d, i) {
                //             return yScale(d['data'][me.helper.measures[d['index']]]);
                //         })
                //         .attr('r', 5)
                //         .on('mouseover', me.helper.toggleTooltip('visible', me))
                //         .on('mousemove', function () {
                //             var tooltip = d3.select(me.container).select('.tooltip_custom');
                //             var offset = $(me.container).find('#infographics_graphics').offset();
                //             var x = d3.event.pageX - offset.left,
                //                 y = d3.event.pageY - offset.top;

                //             tooltip.style('top', y + 10 + 'px').style('left', x + 10 + 'px');
                //             D3Utils.constrainTooltip(me.container.children[0].children.infographics_graphics, tooltip.node());
                //         })
                //         .on('mouseout', me.helper.toggleTooltip('hidden', me));

                //     var axisBottomG = chart.append('g')
                //         .attr('class', 'x axis')
                //         .attr('transform', 'translate(0, ' + containerHeight + ')');

                //     var axisBottom = d3.axisBottom(xScale);

                //     axisBottomG.append('g')
                //         .attr('id', 'x_axis')
                //         .call(axisBottom);

                //     d3.select(me.container).selectAll('#x_axis .tick').remove();

                //     d3.select(me.container).select('#x_axis path')
                //         .style('stroke', DEFAULT_COLOR);
                // }

                var plotLineChart = function (data) {
                    var DEFAULT_COLOR = "#dedede";

                    var me = this;

                    var svg = d3.select(this.container).select('svg'),
                        w = +svg.node().clientWidth,
                        h = +svg.node().clientHeight;

                    var transitionDuration = 1000;
                    var yAxisGroup = null,
                        xAxisGroup = null,
                        dataCirclesGroup = null,
                        dataLinesGroup = null;

                    var minMax = this.helper.getGlobalMinMax(data);
                    var globalMin = minMax[1];
                    var globalMax = minMax[0];

                    var padding = this.helper.getPadding();
                    var containerWidth = w - 2 * padding,
                        containerHeight = h - 2 * padding;

                    var margin = 15;
                    var xLabels = this.helper.getXLabels(data);
                    var x = d3.scalePoint().domain(xLabels).range([0, containerWidth]);
                    var y = d3.scaleLinear().range([h - margin * 2, 0]).domain([globalMax, globalMin]);

                    var t = null;
                    var containersvg = svg.append('svg:g').attr('transform', 'translate(' + padding + ',' + padding + ')');
                    t = svg.transition().duration(transitionDuration);

                    // Draw the lines
                    if (!dataLinesGroup) {
                        dataLinesGroup = containersvg.append('svg:g');
                    }

                    var dataLines = dataLinesGroup.selectAll('.data-line')
                        .data([data]);

                    var line = d3.line()
                        .x(function (d, i) {
                            return x(d[me.helper.dimension]);
                        })
                        .y(function (d, i) {
                            return y(d[me.helper.measures[0]]);
                        })
                        .curve(d3.curveLinear);

                    var garea = d3.area()
                        .curve(d3.curveLinear)
                        .x(function (d, i) {
                            return x(d[me.helper.dimension]);
                        })

                        .y0(h - margin * 2)
                        .y1(function (d, i) {
                            return y(d[me.helper.measures[0]]);
                        });

                    dataLines
                        .enter()
                        .append('svg:path')
                        .attr("class", "area")
                        .attr("d", garea(data));

                    dataLines
                        .enter()
                        .append('path')
                        .attr('class', 'data-line')
                        .attr("d", line(data));

                    dataLines.transition()
                        .attr("d", line)
                        .duration(transitionDuration)
                        .style('opacity', 1)
                        .attr("transform", function (d, i) {
                            return "translate(" + x(d[me.helper.dimension]) + "," + y(d[me.helper.measures[0]]); + ")";
                        });

                    dataLines.exit()
                        .transition()
                        .attr("d", line)
                        .duration(transitionDuration)
                        .attr("transform", function (d, i) {
                            return "translate(" + x(d[me.helper.dimension]) + "," + y(0) + ")";
                        })
                        .style('opacity', 1e-6)
                        .remove();

                    // Draw the points
                    if (!dataCirclesGroup) {
                        dataCirclesGroup = containersvg.append('svg:g');
                    }

                    var point = dataCirclesGroup.selectAll('.data-point')
                        .data(data)
                        .enter().append('circle')
                        .attr('class', 'data-point')
                        .attr('fill', function (d, i) {
                            return me.helper.getDisplayColor();
                        })
                        .attr('cx', function (d, i) {
                            return x(d[me.helper.dimension]);
                        })
                        .attr('cy', function (d, i) {
                            return y(d[me.helper.measures[0]]);
                        })
                        .attr('r', 3)
                        .on('mouseover', me.helper.toggleTooltip('visible', me))
                        .on('mousemove', function () {
                            var tooltip = d3.select(me.container).select('.tooltip_custom');
                            var offset = $(me.container).find('#infographics_graphics').offset();
                            var x = d3.event.pageX - offset.left,
                                y = d3.event.pageY - offset.top;

                            tooltip.style('top', y + 10 + 'px').style('left', x + 10 + 'px');
                            D3Utils.constrainTooltip(me.container.children[0].children.infographics_graphics, tooltip.node());
                        })
                        .on('mouseout', me.helper.toggleTooltip('hidden', me));

                    d3.selectAll(".data-point")
                        .attr('fill', function (d, i) {
                            return me.helper.getBorderColor()
                        })
                        .style('z-index', 20)
                        .attr('stroke-width', 1)
                        .attr('stroke', function (d, i) {
                            return me.helper.getBorderColor()
                        });

                    d3.selectAll(".area")
                        .attr('fill', function (d, i) {
                            return me.helper.getDisplayColor()
                        });

                    d3.selectAll(".data-line")
                        .attr('stroke', function (d, i) {
                            return me.helper.getBorderColor();
                        })
                        .attr('stroke-width', 2);
                }

                var plotBarChart = function (data, isDiscrete) {
                    var DEFAULT_HEIGHT = 50,
                        DEFAULT_COLOR = "#dedede";

                    if (typeof (isDiscrete) === 'undefined') {
                        isDiscrete = false;
                    }

                    var me = this;
                    var svg = d3.select(this.container).select('svg'),
                        width = +svg.node().clientWidth,
                        height = +svg.node().clientHeight;

                    var globalMin,
                        globalMax,
                        xLabels;

                    var minMax = this.helper.getGlobalMinMax(data);
                    globalMin = minMax[0];
                    globalMax = minMax[1];

                    xLabels = this.helper.getXLabels(data);

                    var padding = this.helper.getPadding();

                    var containerWidth = width - 2 * padding,
                        containerHeight = height - 2 * padding;

                    var container = svg.append('g')
                        .attr('transform', 'translate(' + padding + ', ' + padding + ')');

                    var xScaleDim = d3.scaleBand()
                        .domain(xLabels)
                        .padding([0.2])
                        .rangeRound([0, containerWidth]);

                    var xScaleMes = d3.scaleBand()
                        .domain([me.helper.measures[0]])
                        .rangeRound([0, xScaleDim.bandwidth()])
                        .padding([0.04]);

                    var yScale = d3.scaleLinear()
                        .domain([globalMin, globalMax])
                        .range((function () {
                            if (isDiscrete) {
                                return [(containerHeight - DEFAULT_HEIGHT), 0];
                            }
                            return [containerHeight, 0];
                        })());

                    var chart = container.append('g')
                        .attr('class', 'chart')

                    var bar = chart.selectAll('.bar')
                        .data(data)
                        .enter().append('g')
                        .attr('class', 'bar')
                        .attr('transform', function (d) {
                            return 'translate(' + xScaleDim(d[me.helper.dimension]) + ', 0)';
                        });

                    var rect = bar.append('rect')
                        .attr('x', function (d, i) {
                            return xScaleMes(me.helper.measures[0]);
                        })
                        .attr('y', function (d, i) {
                            if ((d[me.helper.measures[0]] === null) || (isNaN(d[me.helper.measures[0]]))) {
                                return isDiscrete ? (containerHeight - DEFAULT_HEIGHT) : containerHeight;
                            } else if (d[me.helper.measures[0]] > 0) {
                                return yScale(d[me.helper.measures[0]]);
                            }

                            return yScale(0);
                        })
                        .attr('width', xScaleMes.bandwidth())
                        .attr('height', function (d, i) {
                            if ((d[me.helper.measures[0]] === null) || (isNaN(d[me.helper.measures[0]]))) return 0;

                            if (isDiscrete) {
                                return DEFAULT_HEIGHT;
                            }

                            return Math.abs(yScale(0) - yScale(d[me.helper.measures[0]]));
                        })
                        .style('fill', function (d, i) {
                            return me.helper.getDisplayColor();
                        })
                        .style('stroke', function (d, i) {
                            return me.helper.getBorderColor();
                        })
                        .style('stroke-width', 1)
                        .on('mouseover', me.helper.toggleTooltip('visible', me))
                        .on('mousemove', function () {
                            var tooltip = d3.select(me.container).select('.tooltip_custom');
                            var offset = $(me.container).find('#infographics_graphics').offset();
                            var x = d3.event.pageX - offset.left,
                                y = d3.event.pageY - offset.top;

                            tooltip.style('top', y + 10 + 'px').style('left', x + 10 + 'px');
                            D3Utils.constrainTooltip(me.container.children[0].children.infographics_graphics, tooltip.node());
                        })
                        .on('mouseout', me.helper.toggleTooltip('hidden', me));

                    var axisBottomG = chart.append('g')
                        .attr('class', function () {
                            return 'x axis';
                        })
                        .attr('transform', 'translate(0, ' + containerHeight + ')');

                    var axisBottom = d3.axisBottom(xScaleDim);

                    axisBottomG.append('g')
                        .attr('id', 'x_axis')
                        .call(axisBottom);

                    d3.select(me.container).selectAll('#x_axis .tick').remove();

                    d3.select(me.container).select('#x_axis path')
                        .style('stroke', DEFAULT_COLOR);
                }

                var plotDiscreteChart = function (data) {
                    plotBarChart.call(this, data, true);
                }

                var plotPieChart = function (data) {
                    var me = this;
                    var svg = d3.select(this.container).select('svg'),
                        width = +svg.node().clientWidth,
                        height = +svg.node().clientHeight;

                    var colorScale = d3.scaleOrdinal()
                        .range(d3.schemeCategory20);

                    var padding = this.helper.getPadding();

                    var containerWidth = width - 2 * padding,
                        containerHeight = height - 2 * padding;

                    var container = svg.append('g')
                        .attr('transform', 'translate(' + padding + ', ' + padding + ')');

                    var radius = Math.min(containerWidth, containerHeight) / 2,
                        outerRadius = radius,
                        innerRadius = 0;

                    var arc = d3.arc()
                        .outerRadius(outerRadius)
                        .innerRadius(innerRadius);


                    var pie = d3.pie()
                        .sort(null)
                        .value(function (d) { return d[me.helper.measures[0]]; });

                    var chart = container.append('g')
                        .attr('transform', function () {
                            return 'translate(' + (containerWidth / 2) + ', ' + (containerHeight / 2) + ')';
                        });

                    var gArc = chart.selectAll('.arc')
                        .data(pie(data))
                        .enter().append('g')
                        .attr('class', 'arc');

                    var pathArea = gArc.append('path')
                        .attr('id', function (d, i) {
                            return 'arc' + i;
                        })
                        .attr('d', arc)
                        .style('fill', function (d) {
                            return colorScale(d.data[me.helper.dimension]);
                        })
                        .on('mouseover', me.helper.toggleTooltip('visible', me))
                        .on('mousemove', function () {
                            var tooltip = d3.select(me.container).select('.tooltip_custom');
                            var offset = $(me.container).find('#infographics_graphics').offset();
                            var x = d3.event.pageX - offset.left,
                                y = d3.event.pageY - offset.top;

                            tooltip.style('top', y + 10 + 'px').style('left', x + 10 + 'px');
                            D3Utils.constrainTooltip(me.container.children[0].children.infographics_graphics, tooltip.node());
                        })
                        .on('mouseout', me.helper.toggleTooltip('hidden', me))
                        .on("mouseenter", function (d) {
                            me.helper.toggleTooltip('visible', me)
                            d3.select(this)
                                .attr("stroke", "white")
                                .transition()
                                .duration(1000)
                                .attr("stroke-width", 6);
                        })
                        .on("mouseleave", function (d) {
                            me.helper.toggleTooltip('hidden', me)
                            d3.select(this).transition()
                                .attr("d", arc)
                                .attr("stroke", "none");
                        });;
                }

                return InfoGraphics;

            })();

            if (Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                if ($rootScope.filterSelection.id != record.id) {
                    var infoGraphics = $rootScope.updateWidget[record.id];
                    infoGraphics.updateChart(record.data);
                }
            } else {
                var infoGraphics = new InfoGraphics(element[0], record, getProperties(VisualizationUtils, record));
                infoGraphics.renderChart();

                $rootScope.updateWidget[record.id] = infoGraphics;
            }
        }
    }
}
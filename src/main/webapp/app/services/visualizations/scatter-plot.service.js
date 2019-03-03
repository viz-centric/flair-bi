(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('GenerateScatterPlot', GenerateScatterPlot);

    GenerateScatterPlot.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils', 'filterParametersService'];

    function GenerateScatterPlot(VisualizationUtils, $rootScope, D3Utils, filterParametersService) {
        return {
            build: function (record, element, panel) {

                if((!record.data) || ((record.data instanceof Array) && (!record.data.length))) {
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
                        allMeasures = [];

                    result['dimensions'] = D3Utils.getNames(dimensions);
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

                    result['showLabel'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Value on Points');
                    result['labelColor'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Colour of labels');
                    result['fontStyle'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font style');
                    result['fontWeight'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font weight');
                    result['fontSize'] = parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font size'));
                    result['iconName'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Icon name');
                    result['displayColor'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Display colour');
                    result['pointType'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Point type');
                    result['displayName'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Display name');

                    for(var i=0; i<result.maxMes; i++) {
                        eachMeasure = {};
                        eachMeasure['measure'] = result['measures'][i];
                        eachMeasure['showValues'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Value on Points');
                        eachMeasure['displayName'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name');
                        eachMeasure['fontStyle'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style');
                        eachMeasure['fontWeight'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight');
                        eachMeasure['fontSize'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size');
                        eachMeasure['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format');
                        eachMeasure['textColor'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour');
                        allMeasures.push(eachMeasure);
                    }

                    result['measureProp'] = allMeasures; 

                    return result;
                }

                var Helper = (function() {

                    var DEFAULT_COLOR = "#dedede";

                    function Helper(config) {
                        this.config = config;
                        this.maxMes = config.maxMes;
                        this.dimensions = config.dimensions;
                        this.measures = config.measures;
                        this.showXaxis = config.showXaxis;
                        this.showYaxis = config.showYaxis;
                        this.showXaxisLabel = config.showXaxisLabel;
                        this.showYaxisLabel = config.showYaxisLabel;
                        this.xAxisColor = config.xAxisColor;
                        this.yAxisColor = config.yAxisColor;
                        this.showGrid = config.showGrid;
                        this.showLegend = config.showLegend;
                        this.legendPosition = config.legendPosition;
                        this.showLabel = config.showLabel;
                        this.fontStyle = config.fontStyle;
                        this.fontWeight = config.fontWeight;
                        this.fontSize = config.fontSize;
                        this.iconName = config.iconName;
                        this.displayColor = config.displayColor;
                        this.pointType = config.pointType;
                        this.displayName = config.displayName;
                        this.measureProp = config.measureProp;
                        this.labelColor=config.labelColor;
                    }

                    Helper.prototype.getMargin = function() {
                        return {
                            top: 15,
                            right: 15,
                            bottom: 35,
                            left: 35
                        };
                    }

                    Helper.prototype.getPadding = function() {
                        return 20;
                    }

                    Helper.prototype.isLegendVisible = function() {
                        return this.showLegend;
                    }

                    Helper.prototype.getLegendPosition = function() {
                        return this.legendPosition.toLowerCase();
                    }

                    Helper.prototype.getGridVisibility = function() {
                        return this.showGrid ? 'visible' : 'hidden';
                    }

                    Helper.prototype.getXaxisColor = function() {
                        return this.xAxisColor;
                    }

                    Helper.prototype.getYaxisColor = function() {
                        return this.yAxisColor;
                    }

                    Helper.prototype.getXaxisVisibility = function() {
                        return this.showXaxis ? 'visible' : 'hidden';
                    }

                    Helper.prototype.getYaxisVisibility = function() {
                        return this.showYaxis ? 'visible' : 'hidden';
                    }

                    Helper.prototype.getXaxisLabelVisibility = function() {
                        return this.showXaxisLabel ? 'visible' : 'hidden';
                    }

                    Helper.prototype.getYaxisLabelVisibility = function() {
                        return this.showYaxisLabel ? 'visible' : 'hidden';   
                    }

                    Helper.prototype.setAxisColor = function(scope) {
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
                    }

                    Helper.prototype.getXMinMax = function(data) {
                        var me = this;

                        var allValues = [],
                            min,
                            max;

                        data.forEach(function(d) {
                            allValues.push(d[me.measures[0]] || 0);
                        });

                        min = Math.min.apply(Math, allValues);
                        max = Math.max.apply(Math, allValues);

                        min = min > 0 ? 0 : min

                        return [min, max];
                    }

                    Helper.prototype.getYMinMax = function(data) {
                        var me = this;

                        var allValues = [],
                            min,
                            max;

                        data.forEach(function(d) {
                            allValues.push(d[me.measures[1]] || 0);
                        });

                        min = Math.min.apply(Math, allValues);
                        max = Math.max.apply(Math, allValues);

                        min = min > 0 ? 0 : min

                        return [min, max];
                    }

                    Helper.prototype.getZMinMax = function(data) {
                        var me = this;

                        var allValues = [],
                            min,
                            max;

                        data.forEach(function(d) {
                            allValues.push(d[me.measures[2]] || 0);
                        });

                        min = Math.min.apply(Math, allValues);
                        max = Math.max.apply(Math, allValues);

                        min = min > 0 ? 0 : min

                        return [min, max];
                    }

                    Helper.prototype.getDimDisplayName = function() {
                        return this.displayName;
                    }

                    Helper.prototype.getDisplayColor = function() {
                        return this.displayColor || DEFAULT_COLOR;
                    }

                    Helper.prototype.getVisibility = function() {
                        return this.showLabel ? 'visible' : 'hidden';
                    }

                    Helper.prototype.getDimensionLabelColor = function() {
                        return this.labelColor || DEFAULT_COLOR;
                    }

                    Helper.prototype.getFontStyle = function() {
                        return this.fontStyle;
                    }

                    Helper.prototype.getFontWeight = function() {
                        return this.fontWeight;   
                    }

                    Helper.prototype.getFontSize = function() {
                        return this.fontSize;
                    }

                    Helper.prototype.isIconVisible = function() {
                        return (this.iconName && this.iconName != "") ? true : false;
                    }

                    Helper.prototype.getIconName = function() {
                        return this.iconName;
                    }

                    Helper.prototype.getXValueVisibility = function() {
                        return this.measureProp[0]['showValues'];
                    }

                    Helper.prototype.getXDisplayName = function() {
                        return this.measureProp[0]['displayName'];
                    }

                    Helper.prototype.getXFontStyle = function() {
                        return this.measureProp[0]['fontStyle'];
                    }

                    Helper.prototype.getXFontWeight = function() {
                        return this.measureProp[0]['fontWeight'];
                    }

                    Helper.prototype.getXFontSize = function() {
                        return this.measureProp[0]['fontSize'];
                    }

                    Helper.prototype.getXNumberFormat = function() {
                        var si = this.measureProp[0]['numberFormat'],
                            nf = D3Utils.getNumberFormatter(si);

                        return nf;
                    }

                    Helper.prototype.getXTextColor = function() {
                        return this.measureProp[0]['textColor'];
                    }

                    Helper.prototype.getYValueVisibility = function() {
                        return this.measureProp[1]['showValues'];
                    }

                    Helper.prototype.getYDisplayName = function() {
                        return this.measureProp[1]['displayName'];
                    }

                    Helper.prototype.getYFontStyle = function() {
                        return this.measureProp[1]['fontStyle'];
                    }

                    Helper.prototype.getYFontWeight = function() {
                        return this.measureProp[1]['fontWeight'];
                    }

                    Helper.prototype.getYFontSize = function() {
                        return this.measureProp[1]['fontSize'];
                    }

                    Helper.prototype.getYTextColor = function() {
                        return this.measureProp[1]['textColor'];
                    }

                    Helper.prototype.getYNumberFormat = function() {
                        var si = this.measureProp[1]['numberFormat'],
                            nf = D3Utils.getNumberFormatter(si);

                        return nf;
                    }

                    Helper.prototype.getZValueVisibility = function() {
                        return this.measureProp[2]['showValues'];
                    }

                    Helper.prototype.getZDisplayName = function() {
                        return this.measureProp[2]['displayName'];
                    }

                    Helper.prototype.getZFontStyle = function() {
                        return this.measureProp[2]['fontStyle'];
                    }

                    Helper.prototype.getZFontWeight = function() {
                        return this.measureProp[2]['fontWeight'];
                    }

                    Helper.prototype.getZTextColor = function() {
                        return this.measureProp[2]['textColor'];
                    }

                    Helper.prototype.getZNumberFormat = function() {
                        var si = this.measureProp[2]['numberFormat'],
                            nf = D3Utils.getNumberFormatter(si);

                        return nf;
                    }

                    Helper.prototype.getPointType = function() {
                        var symbol = null;

                        switch(this.pointType.toLowerCase()) {
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

                    Helper.prototype.toggleTooltip = function(visibility, scope) {
                        return function(d, i) {
                            var tooltip = d3.select(scope.container).select('.tooltip_custom');

                            if(visibility == 'visible') {
                                d3.select(this).style('cursor', 'pointer');
                                tooltip.html((function() {
                                    var siX = scope.helper.measureProp[0]['numberFormat'],
                                        siY = scope.helper.measureProp[1]['numberFormat'],
                                        siZ,
                                        nfX = D3Utils.getNumberFormatter(siX),
                                        nfY = D3Utils.getNumberFormatter(siY),
                                        nfZ;

                                    var result = '<table><tr><td>'+ scope.helper.getDimDisplayName()+  ':</td><td class="tooltipData"> ' + d[scope.helper.dimensions[0]] + '</td></tr>'
                                         + '<tr><td>' + scope.helper.measures[0] + ': </td><td class="tooltipData">' + D3Utils.getFormattedValue(d[scope.helper.measures[0]], nfX) + '</td></tr>'
                                         + '<tr><td>' + scope.helper.measures[1] + ': </td><td class="tooltipData">' + D3Utils.getFormattedValue(d[scope.helper.measures[1]], nfY) + '</td></tr></table>';

                                    if(scope.helper.maxMes == 3) {
                                        siZ = scope.helper.measureProp[2]['numberFormat'];
                                        nfZ = D3Utils.getNumberFormatter(siZ);

                                        result += '<tr><td>' + scope.helper.measures[2] + ': </td><td class="tooltipData">' + D3Utils.getFormattedValue(d[scope.helper.measures[2]], nfZ) + '</td></tr>';
                                    }

                                    return result;
                                })());
                            } else {
                                d3.select(this).style('cursor', 'default');
                            }

                            var offset = $(scope.container).offset();
                            var x = d3.event.pageX - offset.left,
                                y = d3.event.pageY - offset.top;

                            tooltip.style('top', y + 'px').style('left', x + 'px');
                            tooltip.style('visibility', visibility);
                            D3Utils.constrainTooltip(scope.container, tooltip.node());
                        };
                    }

                    Helper.prototype.onLassoStart = function(lasso, scope) {
                        return function() {
                            if($rootScope.filterSelection.lasso) {
                                var point;
                                if(scope.helper.isIconVisible()) {
                                    point = 'i';
                                } else {
                                    point = 'symbol';
                                }

                                lasso.items().selectAll(point)
                                    .classed('not_possible', true)
                                    .classed('selected', false);
                            }
                        }
                    }

                    Helper.prototype.onLassoDraw = function(lasso, scope) {
                        return function() {
                            var point;
                            if(scope.helper.isIconVisible()) {
                                point = 'i';
                            } else {
                                point = 'symbol';
                            }

                            $rootScope.filterSelection.lasso = true;
                            lasso.items().selectAll(point)
                                .classed('selected', false);

                            lasso.possibleItems().selectAll(point)
                                .classed('not_possible', false)
                                .classed('possible', true);

                            lasso.notPossibleItems().selectAll(point)
                                .classed('not_possible', true)
                                .classed('possible', false);
                        }
                    }

                    Helper.prototype.onLassoEnd = function(lasso, scope) {
                        return function() {
                            var point;
                            if(scope.helper.isIconVisible()) {
                                point = 'i';
                            } else {
                                point = 'symbol';
                            }

                            var data = lasso.selectedItems().data();

                            if($rootScope.filterSelection.id && $rootScope.filterSelection.id != record.id) {
                                return;
                            }

                            if(!$rootScope.filterSelection.lasso) {
                                return;
                            }

                            lasso.items().selectAll(point)
                                .classed('not_possible', false)
                                .classed('possible', false);

                            lasso.selectedItems().selectAll(point)
                                .classed('selected', true)

                            lasso.notSelectedItems().selectAll(point);
                                
                            var confirm = d3.select(scope.container).select('.confirm')
                                .style('visibility', 'visible');

                            var filter = {};
                            $rootScope.filterSelection.id = scope.id;

                            data.forEach(function(d) {
                                if(filter[scope.helper.dimensions]) {
                                    var temp = filter[scope.helper.dimensions];
                                    if(temp.indexOf(d[scope.helper.dimensions]) < 0) {
                                        temp.push(d[scope.helper.dimensions]);
                                    }
                                    filter[scope.helper.dimensions] = temp;
                                } else {
                                    filter[scope.helper.dimensions] = [d[scope.helper.dimensions]];
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

                var Scatter = (function() {

                    function Scatter(container, record, properties) {
                        this.container = container;
                        this.id = record.id;
                        this.originalData = record.data;
                        this.helper = new Helper(properties);
                        this.axisLabelSpace = 20;
                        this.legendSpace = 0;
                        this.offsetX = 16;
                        this.offsetY = 3;

                        $('#scatter-' + this.id).remove();
                        var div = d3.select(container).append('div')
                            .attr('id', 'scatter-' + this.id)
                            .style('width', this.container.clientWidth + 'px')
                            .style('height', this.container.clientHeight + 'px')
                            .style('overflow', 'hidden')
                            .style('text-align', 'center')
                            .style('position', 'relative');

                        div.append('svg');

                        div.append('div')
                            .attr('class', 'tooltip_custom');

                        D3Utils.prepareFilterButtons(div, $rootScope, filterParametersService);
                    }

                    Scatter.prototype.updateChart = function(data) {
                        var me = this;

                        var container = d3.select(this.container);

                        this.originalData = data;

                        var xMinMax = this.helper.getXMinMax(data),
                            yMinMax = this.helper.getYMinMax(data);

                        this.xScale.domain([xMinMax[0], xMinMax[1]]);
                        this.yScale.domain([yMinMax[0], yMinMax[1]]);

                        if(this.helper.maxMes == 3) {
                            this.radiusScale.domain(this.helper.getZMinMax(data))
                        }

                        var point = container.selectAll('.point')
                            .data(data);

                        point.exit().remove();
                        point.enter().append('g')
                            .attr('class', 'point');
                    }

                    Scatter.prototype.renderChart = function() {
                        var data = this.originalData;
                        var me = this;

                        var width = this.container.clientWidth;
                        var height = this.container.clientHeight;

                        var dimensions = this.helper.dimensions,
                            measures = this.helper.measures;

                        var svg = d3.select(this.container).select('svg');

                        svg.selectAll('g').remove();

                        svg.attr('width', width)
                            .attr('height', height);

                        var margin = this.helper.getMargin(),
                            padding = this.helper.getPadding();

                        var containerWidth = width - 2 * padding,
                            containerHeight = height - 2 * padding;

                        var container = svg.append('g')
                            .attr('transform', 'translate(' + padding + ', ' + padding + ')');

                        var contentWidth = containerWidth - margin.left,
                            contentHeight = containerHeight - 2 * this.axisLabelSpace;

                        var categoricalDimension,
                            defaultColors = D3Utils.getDefaultColorset();

                        var labelStack = [];

                        var drawLegend = function(data) {
                            var me = this;

                            categoricalDimension = data.map(function(d) {
                                return d[dimensions[1]];
                            });

                            var legend = container.append('g')
                                .attr('class', 'scatter-legend')
                                .attr('display', function() {
                                    if(me.helper.isLegendVisible()) {
                                        return 'block';
                                    }
                                    return 'none';
                                })
                                .selectAll('.item')
                                .data(categoricalDimension)
                                .enter().append('g')
                                    .attr('class', 'item')
                                    .attr('id', function(d, i) {
                                        return 'legend' + i;
                                    })
                                    .attr('transform', function(d, i) {
                                        if(me.helper.getLegendPosition() == 'top') {
                                            return 'translate(' + i * Math.floor(containerWidth/measures.length) + ', 0)';
                                        } else if(me.helper.getLegendPosition() == 'bottom') {
                                            return 'translate(' + i * Math.floor(containerWidth/measures.length) + ', ' + containerHeight + ')';
                                        } else if(me.helper.getLegendPosition() == 'left') {
                                            return 'translate(0, ' + i * 20 + ')';
                                        } else if(me.helper.getLegendPosition() == 'right') {
                                            return 'translate(' + (4 * containerWidth/5) + ', ' + i * 20 + ')';
                                        }
                                    })
                                    .on('mouseover', function() {
                                        d3.select(this).attr('cursor', 'pointer')
                                    })
                                    .on('mousemove', function() {
                                        d3.select(this).attr('cursor', 'pointer')
                                    })
                                    .on('mouseout', function() {
                                        d3.select(this).attr('cursor', 'default')
                                    })
                                    .on('click', function(d, i) {
                                        if(labelStack.indexOf(d) < 0) {
                                            labelStack.push(d);
                                        } else {
                                            labelStack.splice(labelStack.indexOf(d), 1);
                                        }

                                        var o = parseInt(d3.select(this).select('rect').style('fill-opacity'));
                                        if(!o) {
                                            d3.select(this).select('rect')
                                                .style('fill-opacity', 1)
                                                .style('stroke-width', 0);
                                        } else {
                                            d3.select(this).select('rect')
                                                .style('fill-opacity', 0)
                                                .style('stroke-width', 1);
                                        }

                                        d3.select(me.container).select('.scatter-plot').remove();
                                        drawPlot.call(me, data);
                                    });

                            legend.append('rect')
                                .attr('x', 4)
                                .attr('width', 10)
                                .attr('height', 10)
                                .style('fill', function(d, i) {
                                    return defaultColors[i % (defaultColors.length)];
                                })
                                .style('stroke', function(d, i) {
                                    return defaultColors[i % (defaultColors.length)];
                                })
                                .style('stroke-width', 0);

                            legend.append('text')
                                .attr('x', 18)
                                .attr('y', 5)
                                .attr('dy', function(d) {
                                    return d3.select(this).style('font-size').replace('px', '')/2.5;
                                })
                                .text(function(d, i) {
                                    return d;
                                })
                                .text(function(d, i) {
                                    if((me.helper.getLegendPosition() == 'top') || (me.helper.getLegendPosition() == 'bottom')) {
                                        return D3Utils.getTruncatedLabel(this, d, Math.floor(containerWidth/categoricalDimension.length), 20);
                                    } else if((me.helper.getLegendPosition() == 'left') || (me.helper.getLegendPosition() == 'right')) {
                                        return D3Utils.getTruncatedLabel(this, d, containerWidth/5);
                                    }
                                });

                            if((this.helper.getLegendPosition() == 'top') || (this.helper.getLegendPosition() == 'bottom')) {
                                legend.attr('transform', function(d, i) {
                                    var count = i,
                                        widthSum = 0
                                    while(count-- != 0) {
                                        widthSum += d3.select(me.container).select('#legend' + count).node().getBBox().width + me.offsetX;
                                    }
                                    return 'translate(' + widthSum + ', ' + (me.helper.getLegendPosition() == 'top' ? 0 : containerHeight) + ')';
                                });
                            }

                            if(!me.helper.isLegendVisible()) {
                                this.legendSpace = 0;
                                contentWidth = containerWidth - margin.left;
                                contentHeight = containerHeight - 2 * this.axisLabelSpace;
                            } else {
                                if((me.helper.getLegendPosition() == 'top') || (me.helper.getLegendPosition() == 'bottom')) {
                                    contentWidth = containerWidth - margin.left;
                                    contentHeight = containerHeight - 3 * this.axisLabelSpace;
                                    this.legendSpace = 20;
                                } else if((me.helper.getLegendPosition() == 'left') || (me.helper.getLegendPosition() == 'right')) {
                                    this.legendSpace = legend.node().parentNode.getBBox().width;
                                    contentWidth = (containerWidth - this.legendSpace) - margin.left - this.axisLabelSpace;
                                    contentHeight = containerHeight - 2 * this.axisLabelSpace;

                                    legend.attr('transform', function(d, i) {
                                        if(me.helper.getLegendPosition() == 'left') {
                                            return 'translate(0, ' + i * 20 + ')';
                                        } else if(me.helper.getLegendPosition() == 'right') {
                                            return 'translate(' + (containerWidth - me.legendSpace) + ', ' + i * 20 + ')';
                                        }
                                    });
                                }
                            }
                        }

                        var drawPlot = function(data) {
                            var xMinMax = this.helper.getXMinMax(data),
                                yMinMax = this.helper.getYMinMax(data);

                            var xScale = this.xScale = d3.scaleLinear()
                                .domain([xMinMax[0], xMinMax[1]])
                                .range([0, contentWidth])
                                .nice();

                            var yScale = this.yScale = d3.scaleLinear()
                                .domain([yMinMax[0], yMinMax[1]])
                                .range([contentHeight, 0])
                                .nice();

                            var radiusScale = this.radiusScale = d3.scaleLinear()
                                .domain([1, 10])
                                .range([10, 100]);

                            if(this.helper.maxMes == 3) {
                                radiusScale.domain(this.helper.getZMinMax(data))
                            }

                            var chart = container.append('g')
                                .attr('class', 'scatter-plot')
                                .attr('transform', function() {
                                    if(me.helper.getLegendPosition() == 'top') {
                                        return 'translate(' + margin.left + ', ' + me.legendSpace + ')';
                                    } else if(me.helper.getLegendPosition() == 'bottom') {
                                        return 'translate(' + margin.left + ', 0)';
                                    } else if(me.helper.getLegendPosition() == 'left') {
                                        return 'translate(' + (me.legendSpace + me.axisLabelSpace + margin.left) + ', 0)';
                                    } else if(me.helper.getLegendPosition() == 'right') {
                                        return 'translate(' + margin.left + ', 0)';
                                    }
                                });

                            var xGridLines = d3.axisBottom()
                                .tickFormat('')
                                .tickSize(-contentHeight)
                                .scale(xScale);

                            var yGridLines = d3.axisLeft()
                                .tickFormat('')
                                .tickSize(-contentWidth)
                                .scale(yScale);

                            chart.append('g')
                                .attr('class', 'grid')
                                .attr('visibility', me.helper.getGridVisibility())
                                .attr('transform', 'translate(0, ' + contentHeight + ')')
                                .call(xGridLines);

                            chart.append('g')
                                .attr('class', 'grid')
                                .attr('visibility', me.helper.getGridVisibility())
                                .call(yGridLines);

                            var point = chart.selectAll('.point')
                                .data((function() {
                                    if(categoricalDimension) {
                                        return data.filter(function(d) {
                                            return labelStack.indexOf(d[dimensions[1]]) == -1;
                                        });
                                    } else {
                                        return data;
                                    }
                                })())
                                .enter().append('g')
                                    .attr('class', 'point')
                                    .on('mouseover', me.helper.toggleTooltip('visible', me))
                                    .on('mousemove', function() {
                                        var tooltip = d3.select(me.container).select('.tooltip_custom');

                                        var offset = $(me.container).offset();
                                        var x = d3.event.pageX - offset.left,
                                            y = d3.event.pageY - offset.top;
                            
                                        tooltip.style('top', y + 10 + 'px').style('left', x + 10 + 'px');
                                        D3Utils.constrainTooltip(me.container, tooltip.node());
                                    })
                                    .on('mouseout', me.helper.toggleTooltip('hidden', me))
                                    .on('click', function(d, i) {
                                        if($rootScope.filterSelection.id && $rootScope.filterSelection.id != record.id) {
                                            return;
                                        }

                                        $rootScope.filterSelection.lasso = false;

                                        var confirm = d3.select(me.container).select('.confirm')
                                            .style('visibility', 'visible');

                                        var filter = {};

                                        if($rootScope.filterSelection.id) {
                                            filter = $rootScope.filterSelection.filter;
                                        } else {
                                            $rootScope.filterSelection.id = me.id;
                                        }

                                        var point = d3.select(this);

                                        if(me.helper.isIconVisible()) {
                                            point = point.select('i');
                                        } else {
                                            point = point.select('symbol');
                                        }

                                        if(point.classed('selected')) {
                                            point.classed('selected', false);
                                        } else {
                                            point.classed('selected', true);
                                        }

                                        var dimension = me.helper.dimensions[0];

                                        if(filter[dimension]) {
                                            var temp = filter[dimension];
                                            if(temp.indexOf(d[dimension]) < 0) {
                                                temp.push(d[dimension]);
                                            } else {
                                                temp.splice(temp.indexOf(d[dimension]), 1);
                                            }
                                            filter[dimension] = temp;
                                        } else {
                                            filter[dimension] = [d[dimension]];
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

                            var t = d3.transition()
                                .duration(800)
                                .ease(d3.easeQuadIn)
                                .on('end', afterTransition);

                            function afterTransition() {

                            }

                            var symbol = point.append('path')
                                .attr('class', 'symbol')
                                .attr('fill', function(d, i) {
                                    if(categoricalDimension) {
                                        return defaultColors[categoricalDimension.indexOf(d[dimensions[1]]) % (defaultColors.length)];
                                    }
                                    return me.helper.getDisplayColor();
                                })
                                .attr('stroke', 'black')
                                .style('stroke-width', 1)
                                //.attr('opacity', 0.6)
                                .attr('transform', function(d) {
                                    return 'translate(' + xScale(d[measures[0]]) + ',' + yScale(d[measures[1]]) + ')';
                                });

                            if(me.helper.isIconVisible()) {
                                point.append('foreignObject')
                                    .attr('x', function(d) {
                                        return xScale(d[measures[0]]) - 0.4 * me.offsetX;
                                    })
                                    .attr('y', function(d) {
                                        return yScale(d[measures[1]]) - 2 * me.offsetY;
                                    })
                                    .html(function(d) {
                                        return '<i class="' + me.helper.getIconName(d) + '" aria-hidden="true"' + '></i>';
                                    });
                            } else {
                                symbol.attr('d', function(d, i) {
                                    if(me.helper.maxMes == 3) {
                                        return d3.symbol()
                                            .type(me.helper.getPointType())
                                            .size(radiusScale(d[measures[2]]))();
                                    }
                                    return d3.symbol()
                                        .type(me.helper.getPointType())
                                        .size(40)();
                                })
                            }

                            var text = point.append('text')
                                .attr('y', function(d, i) {
                                    return yScale(d[measures[1]]);
                                });

                            text.append('tspan')
                                .attr('x', function(d, i) {
                                    return xScale(d[measures[0]]);
                                })
                                .attr('dy', function(d, i) {
                                    return 5 * me.offsetY;
                                })
                                .style('text-anchor', 'middle')
                                .text(function(d, i) {
                                    return d[dimensions[0]];
                                })
                                .attr('visibility', function(d, i) {
                                    return me.helper.getVisibility();
                                })
                                .style('font-style', function(d, i) {
                                    return me.helper.getFontStyle();
                                })
                                .style('font-weight', function(d, i) {
                                    return me.helper.getFontWeight();
                                })
                                .style('font-size', function(d, i) {
                                    return me.helper.getFontSize();
                                })
                                .style('fill', function(d, i) {
                                    return me.helper.getDimensionLabelColor();
                                });

                            if(me.helper.getXValueVisibility()) {
                                text.append('tspan')
                                    .attr('x', function(d, i) {
                                        return xScale(d[measures[0]]);
                                    })
                                    .attr('dy', function(d, i) {
                                        return 3 * me.offsetY;
                                    })
                                    .style('text-anchor', 'middle')
                                    .text(function(d, i) {
                                        var nf = me.helper.getXNumberFormat();
                                        return measures[0] + ": " + nf(d[measures[0]]);
                                    })
                                    .style('font-style', function(d, i) {
                                        return me.helper.getXFontStyle();
                                    })
                                    .style('font-weight', function(d, i) {
                                        return me.helper.getXFontWeight();
                                    })
                                    .style('font-size', function(d, i) {
                                        return me.helper.getXFontSize();
                                    })
                                    .style('fill', function(d, i) {
                                        return me.helper.getXTextColor();
                                    });
                            }

                            if(me.helper.getYValueVisibility()) {
                                text.append('tspan')
                                    .attr('x', function(d, i) {
                                        return xScale(d[measures[0]]);
                                    })
                                    .attr('dy', function(d, i) {
                                        return 3 * me.offsetY;
                                    })
                                    .style('text-anchor', 'middle')
                                    .text(function(d, i) {
                                        var nf = me.helper.getYNumberFormat();
                                        return measures[1] + ": " + nf(d[measures[1]]);
                                    })
                                    .style('font-style', function(d, i) {
                                        return me.helper.getYFontStyle();
                                    })
                                    .style('font-weight', function(d, i) {
                                        return me.helper.getYFontWeight();
                                    })
                                    .style('font-size', function(d, i) {
                                        return me.helper.getYFontSize();
                                    })
                                    .style('fill', function(d, i) {
                                        return me.helper.getYTextColor();
                                    });
                            }

                            if((me.helper.maxMes == 3) && me.helper.getZValueVisibility()) {
                                text.append('tspan')
                                    .attr('x', function(d, i) {
                                        return xScale(d[measures[0]]);
                                    })
                                    .attr('dy', function(d, i) {
                                        return 3 * me.offsetY;
                                    })
                                    .style('text-anchor', 'middle')
                                    .text(function(d, i) {
                                        var nf = me.helper.getZNumberFormat();
                                        return measures[2] + ": " + nf(d[measures[2]]);
                                    })
                                    .style('font-style', function(d, i) {
                                        return me.helper.getZFontStyle();
                                    })
                                    .style('font-weight', function(d, i) {
                                        return me.helper.getZFontWeight();
                                    })
                                    .style('fill', function(d, i) {
                                        return me.helper.getZTextColor();
                                    });
                            }

                            var axisLeftG = chart.append('g')
                                .attr('class', 'y axis')
                                .attr('visibility', me.helper.getYaxisVisibility())
                                .attr('transform', 'translate(0, 0)');

                            axisLeftG.append('g')
                                .attr('class', 'label')
                                .attr('transform', function() {
                                    return 'translate(' + (-margin.left) + ', ' + (contentHeight/2) + ')';
                                })
                                .append('text')
                                    .attr('transform', 'rotate(-90)')
                                    .style('fill', function() {
                                        return me.helper.getYaxisColor();
                                    })
                                    .style('visibility', me.helper.getYaxisLabelVisibility())
                                    .text(function() {
                                        return me.helper.getYDisplayName();
                                    });

                            var axisBottomG = chart.append('g')
                                .attr('class', 'x axis')
                                .attr('visibility', me.helper.getXaxisVisibility())
                                .attr('transform', 'translate(0, ' + contentHeight + ')');

                            axisBottomG.append('g')
                                .attr('class', 'label')
                                .attr('transform', 'translate(' + (contentWidth/2) + ', ' + 2 * me.axisLabelSpace + ')')
                                .append('text')
                                    .style('font-size', 10)
                                    .style('text-anchor', 'middle')
                                    .style('fill', function() {
                                        return me.helper.getXaxisColor();
                                    })
                                    .style('visibility', me.helper.getXaxisLabelVisibility())
                                    .text(function() {
                                        return me.helper.getXDisplayName();
                                    });

                            var tickLength = d3.scaleLinear()
                                .domain([18, 26])
                                .range([4, 6]);

                            var axisBottom = d3.axisBottom(xScale)
                                .tickFormat(function(d) {
                                    if((contentWidth/yScale.ticks().length) < tickLength.invert(D3Utils.shortScale(0)(d).toString().split('').length)) {
                                        return D3Utils.getTruncatedTick(D3Utils.shortScale(2)(d), contentWidth/yScale.ticks().length, tickLength);
                                    }
                                    return D3Utils.shortScale(2)(d);
                                });

                            axisBottomG.append('g')
                                .attr('id', 'x_axis')
                                .call(axisBottom);

                            var axisLeft = d3.axisLeft(yScale)
                                .tickFormat(function(d) {
                                    if((contentHeight/yScale.ticks().length) < 11) {
                                        return '';
                                    }
                                    return D3Utils.getTruncatedTick(D3Utils.shortScale(2)(d), margin.left - 8, tickLength);
                                });

                            axisLeftG.append('g')
                                .attr('id', 'y_axis')
                                .call(axisLeft);

                            me.helper.setAxisColor(this);

                            var lasso = d3.lasso()
                                .hoverSelect(true)
                                .closePathSelect(true)
                                .closePathDistance(100)
                                .items(point)
                                .targetArea(svg);
                            
                            lasso.on('start', me.helper.onLassoStart(lasso, me))
                                .on('draw', me.helper.onLassoDraw(lasso, me))
                                .on('end', me.helper.onLassoEnd(lasso, me));
                            
                            svg.call(lasso);
                        }

                        if(typeof(dimensions[1]) !== 'undefined') {
                            drawLegend.call(this, data);
                        }

                        drawPlot.call(this, data);
                    }

                    return Scatter;

                })();

                if(Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                    if($rootScope.filterSelection.id != record.id) {
                        var scatter = $rootScope.updateWidget[record.id];
                        scatter.updateChart(record.data);
                    }
                } else {
                    var scatter = new Scatter(element[0], record, getProperties(VisualizationUtils, record));
                    scatter.renderChart();

                    $rootScope.updateWidget[record.id] = scatter;
                }
            }
        }
    }
})();
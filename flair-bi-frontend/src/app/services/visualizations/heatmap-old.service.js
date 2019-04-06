import angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .factory('GenerateHeatmap', GenerateHeatmap);

GenerateHeatmap.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils', 'filterParametersService'];

function GenerateHeatmap(VisualizationUtils, $rootScope, D3Utils, filterParametersService) {
    return {
        build: function (record, element, panel) {
            function getProperties(VisualizationUtils, record) {
                var getIconProperties = function (measure) {
                    var properties = {}

                    properties['icon'] = VisualizationUtils.getFieldPropertyValue(measure, 'Icon name');
                    properties['iconPosition'] = VisualizationUtils.getFieldPropertyValue(measure, 'Icon position');
                    properties['iconFontWeight'] = VisualizationUtils.getFieldPropertyValue(measure, 'Icon Font weight');

                    return properties;
                }

                var result = {};

                var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
                    dimensions = features.dimensions,
                    measures = features.measures,
                    eachMeasure,
                    allMeasures = [];

                result['dimension'] = D3Utils.getNames(dimensions)[0];
                result['measures'] = D3Utils.getNames(measures);
                result['maxMes'] = measures.length;
                result['dimLabelColor'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Colour of labels');
                result['displayName'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Display name');
                result['fontStyleForDim'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font style');
                result['fontWeightForDim'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font weight');
                result['fontSizeForDim'] = parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font size'));

                for (var i = 0; i < result.maxMes; i++) {
                    eachMeasure = {};
                    eachMeasure['displayName'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name');
                    eachMeasure['showValues'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Value on Points');
                    eachMeasure['showIcon'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Show Icon');
                    eachMeasure['valuePosition'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Alignment');
                    eachMeasure['iconProperties'] = getIconProperties(measures[i]);
                    eachMeasure['colourCoding'] = D3Utils.getExpressionConfig(VisualizationUtils.getFieldPropertyValue(measures[i], 'Color Coding'), ['color']);
                    eachMeasure['valueTextColour'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour');
                    eachMeasure['fontStyleForMes'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style');
                    eachMeasure['fontWeightForMes'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight');
                    eachMeasure['fontSizeForMes'] = parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size'));
                    eachMeasure['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format');
                    allMeasures.push(eachMeasure);
                }

                result['forEachMeasure'] = allMeasures;

                return result;

            }

            var Helper = (function () {

                function Helper(config) {
                    this.config = config;
                    this.dimension = config.dimension;
                    this.measures = config.measures;
                    this.measuresTotal = [];
                    this.maxMes = config.maxMes;
                    this.dimLabelColor = config.dimLabelColor;
                    this.dimFontStyle = config.fontStyleForDim;
                    this.dimFontWeight = config.fontWeightForDim;
                    this.dimFontSize = config.fontSizeForDim;
                    this.measureProp = config.forEachMeasure;
                    this.displayName = config.displayName;
                }

                Helper.prototype.getFillColor = function (data) {
                    var colorProp = this.measureProp[this.measures.indexOf(data.x)]['colourCoding'],
                        val = data.val,
                        result;

                    if (isNaN(val)) {
                        return colorProp.filter(function (c) { return c.hasOwnProperty('default'); })[0]['color'];
                        // return colorProp.find(obj => obj.hasOwnProperty('default'))['color'];
                    }

                    colorProp.some(function (c) {
                        if (c.hasOwnProperty('upto')) {
                            if (val <= c.upto) {
                                result = c.color;
                                return true;
                            }
                        } else {
                            result = c.color;
                            return true;
                        }
                    });

                    return result || "#efefef";
                }
                Helper.prototype.getDimDisplayName = function () {
                    return this.displayName;
                }
                Helper.prototype.getValueVisibility = function (data) {
                    var isVisible = this.measureProp[this.measures.indexOf(data.x)]['showValues'];

                    if (isVisible) {
                        return 'visible';
                    }

                    return 'hidden';
                }

                Helper.prototype.getDisplayName = function (mes) {
                    return this.measureProp[this.measures.indexOf(mes)]['displayName'];
                }

                Helper.prototype.getValueTextColor = function (data) {
                    return this.measureProp[this.measures.indexOf(data.x)]['valueTextColour'];
                }

                Helper.prototype.getValueFontStyle = function (data) {
                    return this.measureProp[this.measures.indexOf(data.x)]['fontStyleForMes'];
                }

                Helper.prototype.getValueFontWeight = function (data) {
                    return this.measureProp[this.measures.indexOf(data.x)]['fontWeightForMes'];
                }

                Helper.prototype.getValueFontSize = function (data) {
                    return this.measureProp[this.measures.indexOf(data.x)]['fontSizeForMes'];
                }

                Helper.prototype.getValuePosition = function (data, width) {
                    var valPosition = this.measureProp[this.measures.indexOf(data.x)]['valuePosition'];
                    var padding = 4;

                    var offset;

                    switch (valPosition) {
                        case 'Left':
                            offset = 0 + padding;
                            break;
                        case 'Center':
                            offset = width / 2;
                            break;
                        case 'Right':
                            offset = width - padding;
                            break;
                    }

                    return offset;
                }

                Helper.prototype.getValueTextAnchor = function (data) {
                    var valPosition = this.measureProp[this.measures.indexOf(data.x)]['valuePosition'];

                    var anchor;

                    switch (valPosition) {
                        case 'Left':
                            anchor = 'start';
                            break;
                        case 'Center':
                            anchor = 'middle';
                            break;
                        case 'Right':
                            anchor = 'end';
                            break;
                    }

                    return anchor;
                }

                Helper.prototype.getIconVisibility = function (data) {
                    var isVisible = this.measureProp[this.measures.indexOf(data.x)]['showIcon'];

                    if (isVisible) {
                        return 'visible';
                    }

                    return 'hidden';
                }

                Helper.prototype.getIcon = function (data) {
                    var iconProp = this.measureProp[this.measures.indexOf(data.x)]['iconProperties'];

                    return iconProp.icon;
                }

                Helper.prototype.getIconPosition = function (data, width) {
                    var iconProp = this.measureProp[this.measures.indexOf(data.x)]['iconProperties'];
                    var padding = 4;

                    var offset;

                    switch (iconProp.iconPosition) {
                        case 'Left':
                            offset = 0 + padding;
                            break;
                        case 'Center':
                            offset = width / 2 - 2 * padding;
                            break;
                        case 'Right':
                            offset = width - 5 * padding;
                            break;
                    }

                    return offset;
                }

                Helper.prototype.getIconFontWeight = function (data) {
                    var iconProp = this.measureProp[this.measures.indexOf(data.x)]['iconProperties'];

                    return iconProp.iconFontWeight;
                }

                Helper.prototype.transformData = function (data) {
                    var me = this;
                    var result = [];
                    var x, y, val;

                    data.forEach(function (d) {
                        d3.range(me.maxMes).forEach(function (j) {
                            x = me.measures[j];
                            y = d[me.dimension];
                            val = d[me.measures[j]] || 0;
                            result.push({
                                x: x,
                                y: y,
                                column: j,
                                val: val
                            });
                        })
                    });

                    return result;
                }

                Helper.prototype.toggleTooltip = function (visibility, scope) {
                    return function (d, i) {
                        var element = d3.select(this), measuresFormate,
                            si = scope.helper.measureProp[scope.helper.measures.indexOf(d.x)]['numberFormat'],
                            nf = D3Utils.getNumberFormatter(si),
                            displayName = scope.helper.getDimDisplayName(),
                            dimension = d.y,
                            measures = D3Utils.title(d.x);

                        if (si == "Percent") {
                            measuresFormate = nf(d.val / scope.helper.measuresTotal[d.x]);
                        } else {
                            measuresFormate = nf(d.val);
                        }
                        D3Utils.contentTooltip(visibility, scope, element, displayName, dimension, measures, measuresFormate);
                    }
                }

                Helper.prototype.setMeasuresTotal = function (data) {
                    var me = this;
                    var sum;

                    this.measures.forEach(function (m) {
                        sum = 0;
                        data.forEach(function (d) {
                            sum += d[m];
                        });
                        me.measuresTotal[m] = sum;
                    });
                }

                Helper.prototype.getMargin = function (containerWidth) {
                    var margin = {
                        top: 15,
                        bottom: 15,
                        right: 15,
                        left: 15
                    };

                    margin['left'] = Math.floor(containerWidth / 6);

                    return margin;
                }

                Helper.prototype.onLassoStart = function (lasso, scope) {
                    return function () {
                        if ($rootScope.filterSelection.lasso) {
                            lasso.items().selectAll('rect')
                                .classed('not_possible', true)
                                .classed('selected', false);
                        }
                    }
                }

                Helper.prototype.onLassoDraw = function (lasso, scope) {
                    return function () {
                        $rootScope.filterSelection.lasso = true;
                        lasso.items().selectAll('rect')
                            .classed('selected', false);

                        lasso.possibleItems().selectAll('rect')
                            .classed('not_possible', false)
                            .classed('possible', true);

                        lasso.notPossibleItems().selectAll('rect')
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

                        lasso.items().selectAll('rect')
                            .classed('not_possible', false)
                            .classed('possible', false);

                        lasso.selectedItems().selectAll('rect')
                            .classed('selected', true)

                        lasso.notSelectedItems().selectAll('rect');

                        var confirm = d3.select(scope.container).select('.confirm')
                            .style('visibility', 'visible');

                        var filter = {};
                        $rootScope.filterSelection.id = scope.id;

                        data.forEach(function (d) {
                            if (filter[scope.helper.dimension]) {
                                var temp = filter[scope.helper.dimension];
                                if (temp.indexOf(d.y) < 0) {
                                    temp.push(d.y);
                                }
                                filter[scope.helper.dimension] = temp;
                            } else {
                                filter[scope.helper.dimension] = [d.y];
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

            var Heatmap = (function () {

                function Heatmap(container, record, properties) {
                    this.container = container;
                    this.id = record.id;
                    this.originalData = record.data;
                    this.helper = new Helper(properties);
                    this.helper.setMeasuresTotal(record.data);
                    this.offset = 6;

                    $('#heatmap-' + this.id).remove();
                    var div = d3.select(container).append('div')
                        .attr('id', 'heatmap-' + this.id)
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

                Heatmap.prototype.updateChart = function (data) {
                    var me = this;

                    var container = d3.select(this.container),
                        svg = container.select('svg');

                    var width = this.container.clientWidth,
                        height = this.container.clientHeight;

                    var margin = this.helper.getMargin(width);

                    this.originalData = data;

                    var yElement = d3.set(data.map(function (item) { return item[me.helper.dimension]; })).values();

                    var cellHeight = parseInt((height - margin.top - margin.bottom) / data.length);

                    var dimLabel = svg.selectAll('.dimLabel')
                        .data(yElement);

                    dimLabel.exit().remove();
                    dimLabel.enter().append('g')
                        .attr('class', 'dimLabel');

                    var transformedData = this.helper.transformData(data);

                    d3.selectAll('.node rect')
                        .classed('selected', false);

                    var cell = container.selectAll('.node')
                        .data(transformedData);

                    cell.exit().remove();
                    cell.enter().append('g')
                        .attr('class', 'node');
                }

                Heatmap.prototype.renderChart = function () {
                    var data = this.originalData;
                    var me = this;

                    var width = this.container.clientWidth;
                    var height = this.container.clientHeight;

                    var svg = d3.select(this.container).select('svg');

                    svg.selectAll('g').remove();

                    var margin = this.helper.getMargin(width);
                    var g = svg.attr('width', width)
                        .attr('height', height)
                        .append('g')
                        .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

                    var yElement = d3.set(data.map(function (item) { return item[me.helper.dimension]; })).values();
                    var xElement = d3.map();

                    for (var i = 0; i < this.helper.measures.length; i++) {
                        xElement.set(i, this.helper.measures[i]);
                    }

                    var cellWidth = parseInt((width - margin.left - margin.right) / me.helper.maxMes),
                        cellHeight = parseInt((height - margin.top - margin.bottom) / data.length);

                    var dimLabel = g.selectAll('.dimLabel')
                        .data(yElement)
                        .enter().append('text')
                        .attr('class', 'dimLabel')
                        .text(function (d) { return d; })
                        .text(function (d) {
                            return D3Utils.getTruncatedLabel(this, d, (margin.left - 5 * me.offset));
                        })
                        .attr('x', 0)
                        .attr('y', function (d, i) { return i * cellHeight; })
                        .attr('fill', me.helper.dimLabelColor)
                        .style('font-style', me.helper.dimFontStyle)
                        .style('font-weight', me.helper.dimFontWeight)
                        .style('font-size', me.helper.dimFontSize)
                        .style('text-anchor', 'end')
                        .attr('transform', 'translate(' + -me.offset + ',' + cellHeight / 1.75 + ')');

                    var mesLabel = g.selectAll('.mesLabel')
                        .data(xElement.values().map(function (mes) {
                            return me.helper.getDisplayName(mes);
                        }))
                        .enter().append('text')
                        .attr('class', 'mesLabel')
                        .text(function (d) { return d; })
                        .text(function (d) {
                            return D3Utils.title(D3Utils.getTruncatedLabel(this, d, cellWidth));
                        })
                        .attr('x', function (d, i) { return i * cellWidth; })
                        .attr('y', 0)
                        .style('text-anchor', 'middle')
                        .attr('transform', 'translate(' + cellWidth / 2 + ', -6)');

                    var yScale = d3.scaleBand()
                        .domain(yElement)
                        .range([0, yElement.length * cellHeight]);

                    var xScale = d3.scaleBand()
                        .domain(xElement.entries().map(function (element) {
                            return element.key + '_' + element.value;
                        }))
                        .range([0, xElement.size() * cellWidth]);

                    data = me.helper.transformData(data);

                    var cell = g.selectAll(".node")
                        .data(data)
                        .enter().append('g')
                        .attr('transform', function (d) {
                            return 'translate(' + xScale(d.column + '_' + d.x) + ',' + yScale(d.y) + ')';
                        })
                        .attr('class', 'node')

                    cell.on('mouseover', this.helper.toggleTooltip('visible', me))
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

                            var rect = d3.select(this).select('rect');

                            if (rect.classed('selected')) {
                                rect.classed('selected', false);
                            } else {
                                rect.classed('selected', true);
                            }

                            if (filter[me.helper.dimension]) {
                                var temp = filter[me.helper.dimension];
                                if (temp.indexOf(d.y) < 0) {
                                    temp.push(d.y);
                                } else {
                                    temp.splice(temp.indexOf(d.y), 1);
                                }
                                filter[me.helper.dimension] = temp;
                            } else {
                                filter[me.helper.dimension] = [d.y];
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

                    cell.append('rect')
                        .attr('rx', '3px')
                        .attr('ry', '3px')
                        .attr('class', 'bordered')
                        .style('stroke', '#ffffff')
                        .style('stroke-width', '2px')
                        .attr('width', cellWidth - 1)
                        .attr('height', cellHeight - 1)
                        .transition()
                        .ease(d3.easeQuadIn)
                        .duration(500)
                        .styleTween('fill', function (d) {
                            return d3.interpolateRgb('transparent', me.helper.getFillColor(d));
                        });

                    cell.append('text')
                        .attr('x', function (d) {
                            return me.helper.getValuePosition(d, cellWidth);
                        })
                        .attr('y', function (d) {
                            return cellHeight / 2;
                        })
                        .text(function (d) {
                            var si = me.helper.measureProp[me.helper.measures.indexOf(d.x)]['numberFormat'],
                                nf = D3Utils.getNumberFormatter(si),
                                value;

                            if (si == "Percent") {
                                value = nf(d.val / me.helper.measuresTotal[d.x]);
                            } else {
                                value = nf(d.val);
                            }

                            if (value.indexOf("G") != -1) {
                                value = value.slice(0, -1) + "B";
                            }

                            return value;
                        })
                        .style('fill', function (d) {
                            return me.helper.getValueTextColor(d);
                        })
                        .attr('text-anchor', function (d) {
                            return me.helper.getValueTextAnchor(d);
                        })
                        .attr('visibility', function (d) {
                            return me.helper.getValueVisibility(d);
                        })
                        .style('font-style', function (d) {
                            return me.helper.getValueFontStyle(d);
                        })
                        .style('font-weight', function (d) {
                            return me.helper.getValueFontWeight(d);
                        })
                        .style('font-size', function (d) {
                            return me.helper.getValueFontSize(d);
                        });

                    cell.append('foreignObject')
                        .attr('x', function (d) {
                            return me.helper.getIconPosition(d, cellWidth);
                        })
                        .attr('y', function (d) {
                            return cellHeight - 20;
                        })
                        .attr('visibility', function (d) {
                            return me.helper.getIconVisibility(d);
                        })
                        .html(function (d) {
                            return '<i class="' + me.helper.getIcon(d) + '" aria-hidden="true" style="font-weight:' + me.helper.getIconFontWeight(d) + ';color:' + me.helper.getValueTextColor(d) + '"></i>';
                        });

                    var lasso = d3.lasso()
                        .hoverSelect(true)
                        .closePathSelect(true)
                        .closePathDistance(100)
                        .items(cell)
                        .targetArea(svg);

                    lasso.on('start', me.helper.onLassoStart(lasso, me))
                        .on('draw', me.helper.onLassoDraw(lasso, me))
                        .on('end', me.helper.onLassoEnd(lasso, me));

                    svg.call(lasso);
                }

                return Heatmap;

            })();

            if (Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                if ($rootScope.filterSelection.id != record.id) {
                    var heatmap = $rootScope.updateWidget[record.id];
                    heatmap.updateChart(record.data);
                }
            } else {
                var heatmap = new Heatmap(element[0], record, getProperties(VisualizationUtils, record));
                heatmap.renderChart();

                $rootScope.updateWidget[record.id] = heatmap;
            }
        }
    }
}
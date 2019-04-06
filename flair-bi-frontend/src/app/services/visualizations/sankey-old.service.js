import angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .factory('GenerateSankey', GenerateSankey);

GenerateSankey.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils', 'filterParametersService'];

function GenerateSankey(VisualizationUtils, $rootScope, D3Utils, filterParametersService) {
    return {
        build: function (record, element, panel) {

            function getProperties(VisualizationUtils, record) {
                var result = {};

                var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
                    dimensions = features.dimensions,
                    measure = features.measures,
                    eachDimension,
                    allDimensions = [];

                result['dimensions'] = D3Utils.getNames(dimensions);
                result['measure'] = D3Utils.getNames(measure)[0];

                result['maxDim'] = dimensions.length;
                result['maxMes'] = measure.length;

                result['colorPattern'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Color Pattern').toLowerCase().replace(' ', '_');
                result['displayColor'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Display colour');
                result['borderColor'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Border colour');
                result['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Number format');

                for (var i = 0; i < result.maxDim; i++) {
                    eachDimension = {};
                    eachDimension['dimension'] = result['dimensions'][i];
                    eachDimension['showLabels'] = VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Show Labels');
                    eachDimension['fontStyle'] = VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font style');
                    eachDimension['fontWeight'] = VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font weight');
                    eachDimension['fontSize'] = parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font size'));
                    eachDimension['textColor'] = VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Text colour');
                    allDimensions.push(eachDimension);
                }

                result['dimensionProp'] = allDimensions;

                return result;
            }

            var Helper = (function () {

                function Helper(config) {
                    this.config = config;
                    this.maxDim = config.maxDim;
                    this.dimensions = config.dimensions;
                    this.measure = config.measure;
                    this.colorPattern = config.colorPattern;
                    this.displayColor = config.displayColor;
                    this.borderColor = config.borderColor;
                    this.numberFormat = config.numberFormat;
                    this.dimensionProp = config.dimensionProp;
                    this.total = 0;
                    this.gradientColor = d3.scaleLinear()

                    this.gradientColor.range([
                        d3.rgb(this.displayColor).brighter(),
                        d3.rgb(this.displayColor).darker()
                    ])
                }

                Helper.prototype.getMargin = function () {
                    return {
                        top: 10,
                        right: 10,
                        bottom: 10,
                        left: 10
                    };
                }

                Helper.prototype.getFillColor = function (d, i) {
                    if (this.colorPattern == 'single_color') {
                        return this.displayColor;
                    } else if (this.colorPattern == 'unique_color') {
                        return d3.schemeCategory20c[i % (d3.schemeCategory20c.length)];
                    } else if (this.colorPattern == 'gradient_color') {
                        return this.gradientColor(d.value);
                    }
                }

                Helper.prototype.getBorderColor = function () {
                    return this.borderColor || DEFAULT_COLOR;
                }

                Helper.prototype.getValueNumberFormat = function () {
                    var si = this.numberFormat;
                    return d3.formatPrefix('.2s', numberFormat[si]);
                }

                Helper.prototype.getLabelVisibility = function (index) {
                    var isVisible = this.dimensionProp[index]['showLabels'];

                    if (isVisible) {
                        return 'visible';
                    }

                    return 'hidden';
                }

                Helper.prototype.getDimFontStyle = function (index) {
                    return this.dimensionProp[index]['fontStyle'];
                }

                Helper.prototype.getDimFontWeight = function (index) {
                    return this.dimensionProp[index]['fontWeight'];
                }

                Helper.prototype.getDimFontSize = function (index) {
                    return this.dimensionProp[index]['fontSize'];
                }

                Helper.prototype.getLabelColor = function (index) {
                    return this.dimensionProp[index]['textColor'] || DEFAULT_COLOR;
                }

                Helper.prototype.setTotal = function (data) {
                    var me = this,
                        sum = 0;

                    data.forEach(function (d) {
                        sum += d[me.measure];
                    });

                    this.total = sum;
                }

                Helper.prototype.toggleTooltip = function (visibility, element, scope) {
                    return function (d, i) {
                        var tooltip = d3.select(scope.container).select('.tooltip_custom');

                        if (visibility == 'visible') {
                            d3.select(this).style('cursor', 'pointer');
                            tooltip.html((function () {
                                var nf = D3Utils.getNumberFormatter(scope.helper.numberFormat),
                                    value,
                                    result = "";

                                if (scope.helper.numberFormat == "Percent") {
                                    value = nf(d.value / scope.helper.total);
                                } else {
                                    value = nf(d.value);
                                }

                                if (value.indexOf("G") != -1) {
                                    value = value.slice(0, -1) + "B";
                                }

                                if (element == 'node') {
                                    result = '<table><tr><td>' + d.nodeType + ': </td><td class="tooltipData">' + d.name + '</td></tr>';
                                } else {
                                    result = '<table><tr><td>' + d.source.nodeType + ': </td><td class="tooltipData">' + d.source.name + '</td></tr>'
                                        + '<tr><td>' + d.target.nodeType + ': </td><td class="tooltipData">' + d.target.name + '</td></tr>';
                                }
                                return result + '<tr><td>' + D3Utils.title(scope.helper.measure) + ': </td><td class="tooltipData">' + value + '</td></tr></table>';

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

                Helper.prototype.getUniqueItems = function (array) {
                    var filteredArray = array.filter(function (item, pos) {
                        return array.indexOf(item) == pos
                    });

                    return filteredArray;
                }

                Helper.prototype.getSankeyData = function (data) {
                    var me = this;

                    var nodes = [],
                        links = [],
                        nodeOffsets = [];

                    this.dimensions.forEach(function (dimension, index) {
                        var allDimensions = data.map(function (d, i) {
                            return d[dimension];
                        });

                        nodeOffsets.push(nodes.length);

                        var sourceUniqueDimensions = [];
                        sourceUniqueDimensions = me.getUniqueItems(allDimensions);
                        sourceUniqueDimensions.forEach(function (d, i) {
                            var counter = nodeOffsets[index];
                            nodes.push({
                                'node': counter++,
                                'name': d == null ? 'null' : d,
                                'nodeType': dimension
                            });
                        });

                        var targetUniqueDimensions = me.getUniqueItems(data.map(function (d, i) {
                            return d[me.dimensions[index + 1]];
                        }));

                        if (index != (me.dimensions.length - 1)) {
                            data.forEach(function (d, i) {
                                var link = {};
                                link.source = nodeOffsets[index] + sourceUniqueDimensions.indexOf(d[dimension]);
                                link.target = nodes.length + targetUniqueDimensions.indexOf(d[me.dimensions[index + 1]]);
                                link.value = (isNaN(d[me.measure]) || d[me.measure] === null) ? 0 : d[me.measure];
                                links.push(link);
                            });
                        }
                    });

                    return { nodes: nodes, links: links };
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
                            if (filter[d.nodeType]) {
                                var temp = filter[d.nodeType];
                                if (temp.indexOf(d.name) < 0) {
                                    temp.push(d.name);
                                }
                                filter[d.nodeType] = temp;
                            } else {
                                filter[d.nodeType] = [d.name];
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

            var Sankey = (function () {

                function Sankey(container, record, properties) {
                    this.container = container;
                    this.id = record.id;
                    this.originalData = record.data;
                    this.helper = new Helper(properties);

                    $('#sankey-' + this.id).remove();
                    var div = d3.select(container).append('div')
                        .attr('id', 'sankey-' + this.id)
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

                Sankey.prototype.updateChart = function (data) {
                    var me = this;

                    var container = d3.select(this.container),
                        svg = container.select('svg');

                    this.originalData = data;
                    this.helper.setTotal(data);

                    var data = this.helper.getSankeyData(data);

                    this._sankey.nodes(data.nodes)
                        .links(data.links);

                    this.helper.gradientColor.domain(d3.extent(data.nodes, function (d) {
                        return d.value;
                    }));

                    var nodeDistance = data.nodes[0].sourceLinks[0].target.x - data.nodes[0].x - this._sankey.nodeWidth();

                    var link = svg.selectAll('.link')
                        .data(data.links);

                    link.exit().remove();
                    link.enter().append('path')
                        .attr('class', 'link');

                    var node = svg.selectAll('.node')
                        .data(data.nodes);

                    node.exit().remove();
                    node.enter().append('g')
                        .attr('class', 'node');
                }

                Sankey.prototype.renderChart = function () {
                    this.helper.setTotal(this.originalData);

                    var data = this.helper.getSankeyData(this.originalData);
                    var me = this;

                    var width = this.container.clientWidth;
                    var height = this.container.clientHeight;

                    var dimensions = me.helper.dimensions,
                        measure = me.helper.measure;

                    var svg = d3.select(this.container).select('svg');

                    svg.selectAll('g').remove();

                    svg.attr('width', width)
                        .attr('height', height);

                    var margin = this.helper.getMargin();

                    var containerWidth = width - margin.left - margin.right,
                        containerHeight = height - margin.top - margin.bottom;

                    var container = svg.append('g')
                        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

                    var sankey = this._sankey = d3.sankey()
                        .nodeWidth(12)
                        .nodePadding(4)
                        .size([containerWidth, containerHeight]);

                    var path = sankey.link();

                    sankey.nodes(data.nodes)
                        .links(data.links)
                        .layout(32);

                    this.helper.gradientColor.domain(d3.extent(data.nodes, function (d) {
                        return d.value;
                    }));

                    var nodeDistance = data.nodes[0].sourceLinks[0].target.x - data.nodes[0].x - sankey.nodeWidth();

                    var link = container.append('g').selectAll('.link')
                        .data(data.links)
                        .enter().append('path')
                        .attr('class', 'link')
                        .attr('d', path)
                        .style('stroke-width', function (d) { return Math.max(1, d.dy); })
                        .sort(function (a, b) { return b.dy - a.dy; })
                        .on('mouseover', me.helper.toggleTooltip('visible', 'link', me))
                        .on('mousemove', function () {
                            var tooltip = d3.select(me.container).select('.tooltip_custom');
                            var offset = $(me.container).offset();
                            var x = d3.event.pageX - offset.left,
                                y = d3.event.pageY - offset.top;

                            tooltip.style('top', y + 10 + 'px').style('left', x + 10 + 'px');
                            D3Utils.constrainTooltip(me.container, tooltip.node());
                        })
                        .on('mouseout', me.helper.toggleTooltip('hidden', 'link', me));

                    var startTime = 0;

                    var drag = d3.drag()
                        .subject(function (d) {
                            return d;
                        })
                        .on('start', function () {
                            startTime = (new Date()).getTime();
                            this.parentNode.appendChild(this);
                        })
                        .on('drag', function (d) {
                            d3.select(this).attr('transform', 'translate(' + d.x + ', ' + (d.y = Math.max(0, Math.min(containerHeight - d.dy, d3.event.y))
                            ) + ')');
                            sankey.relayout();
                            link.attr('d', path);
                        })
                        .on('end', function (d, i) {
                            var endTime = (new Date()).getTime();

                            if ((endTime - startTime) < 1000) {
                                // treat as click event
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

                                var dimension = d.nodeType;

                                if (filter[dimension]) {
                                    var temp = filter[dimension];
                                    if (temp.indexOf(d.name) < 0) {
                                        temp.push(d.name);
                                    } else {
                                        temp.splice(temp.indexOf(d.name), 1);
                                    }
                                    filter[dimension] = temp;
                                } else {
                                    filter[dimension] = [d.name];
                                }

                                // Clear out the updateWidget property
                                var idWidget = $rootScope.updateWidget[me.id];
                                $rootScope.updateWidget = {};
                                $rootScope.updateWidget[me.id] = idWidget;

                                $rootScope.filterSelection.filter = filter;
                                filterParametersService.save(filter);
                                $rootScope.$broadcast('flairbiApp:filter-input-refresh');
                                $rootScope.$broadcast('flairbiApp:filter');
                            }
                        })

                    var node = container.append('g').selectAll('.node')
                        .data(data.nodes)
                        .enter().append('g')
                        .attr('class', 'node')
                        .attr('transform', function (d) {
                            return 'translate(' + d.x + ',' + d.y + ')';
                        })
                        .call(drag);

                    node.append('rect')
                        .attr('width', sankey.nodeWidth())
                        .attr('height', function (d) { return d.dy; })
                        .style('cursor', 'move')
                        .style('fill', function (d, i) {
                            return me.helper.getFillColor(d, i);
                        })
                        .style('stroke', function (d) {
                            return me.helper.getBorderColor();
                        })
                        .on('mouseover', me.helper.toggleTooltip('visible', 'node', me))
                        .on('mousemove', function () {
                            var tooltip = d3.select(me.container).select('.tooltip_custom');
                            var offset = $(me.container).offset();
                            var x = d3.event.pageX - offset.left,
                                y = d3.event.pageY - offset.top;

                            tooltip.style('top', y + 10 + 'px').style('left', x + 10 + 'px');
                            D3Utils.constrainTooltip(me.container, tooltip.node());
                        })
                        .on('mouseout', me.helper.toggleTooltip('hidden', 'node', me));

                    node.append('text')
                        .attr('x', -6)
                        .attr('y', function (d) { return d.dy / 2; })
                        .attr('dy', '.35em')
                        .attr('text-anchor', 'end')
                        .style('pointer-events', 'none')
                        .text(function (d) {
                            if (d.dy > 4) {
                                return d.name;
                            }
                            return "";
                        })
                        .text(function (d) {
                            if (d.dy > 4) {
                                if (me.helper.dimensions.indexOf(d.nodeType) >= me.helper.dimensions.length - 2) {
                                    return D3Utils.getTruncatedLabel(this, d.name, nodeDistance / 2, 3);
                                }
                                return D3Utils.getTruncatedLabel(this, d.name, nodeDistance, 3);
                            }
                            return "";
                        })
                        .style('visibility', function (d, i) {
                            return me.helper.getLabelVisibility(me.helper.dimensions.indexOf(d.nodeType));
                        })
                        .style('font-style', function (d, i) {
                            return me.helper.getDimFontStyle(me.helper.dimensions.indexOf(d.nodeType));
                        })
                        .style('font-weight', function (d, i) {
                            return me.helper.getDimFontWeight(me.helper.dimensions.indexOf(d.nodeType));
                        })
                        .style('font-size', function (d, i) {
                            return me.helper.getDimFontSize(me.helper.dimensions.indexOf(d.nodeType));
                        })
                        .style('fill', function (d, i) {
                            return me.helper.getLabelColor(me.helper.dimensions.indexOf(d.nodeType));
                        })
                        .filter(function (d) { return d.x < containerWidth / 2; })
                        .attr('x', 6 + sankey.nodeWidth())
                        .attr('text-anchor', 'start');

                    var lasso = d3.lasso()
                        .hoverSelect(true)
                        .closePathSelect(true)
                        .closePathDistance(100)
                        .items(node.select('rect'))
                        .targetArea(svg);

                    lasso.on('start', me.helper.onLassoStart(lasso, me))
                        .on('draw', me.helper.onLassoDraw(lasso, me))
                        .on('end', me.helper.onLassoEnd(lasso, me));

                    svg.call(lasso);
                }

                return Sankey;

            })();

            if (Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                if ($rootScope.filterSelection.id != record.id) {
                    var sankey = $rootScope.updateWidget[record.id];
                    sankey.updateChart(record.data);
                }
            } else {
                var sankey = new Sankey(element[0], record, getProperties(VisualizationUtils, record));
                sankey.renderChart();

                $rootScope.updateWidget[record.id] = sankey;
            }
        }
    }
}
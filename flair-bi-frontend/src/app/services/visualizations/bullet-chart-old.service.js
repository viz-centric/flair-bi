import angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .factory('GenerateBulletChart', GenerateBulletChart);

GenerateBulletChart.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils', 'filterParametersService'];

function GenerateBulletChart(VisualizationUtils, $rootScope, D3Utils, filterParametersService) {
    return {
        build: function (record, element, panel) {

            function getProperties(VisualizationUtils, record) {
                var result = {};

                var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
                    dimensions = features.dimensions,
                    measures = features.measures;

                result['dimension'] = D3Utils.getNames(dimensions)[0];
                result['measures'] = D3Utils.getNames(measures);

                result['fontStyle'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font style');
                result['fontWeight'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font weight');
                result['fontSize'] = parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font size'));
                result['showLabel'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Value on Points');

                result['valueColour'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Text colour');
                result['targetColor'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Target colour');

                result['orientation'] = VisualizationUtils.getPropertyValue(record.properties, 'Orientation');
                result['segments'] = VisualizationUtils.getPropertyValue(record.properties, 'Segments');
                result['segmentInfo'] = D3Utils.getExpressionConfig(VisualizationUtils.getPropertyValue(record.properties, 'Segment Color Coding'), ['color']);
                result['measureNumberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Number format');
                result['targetNumberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Number format');

                return result;
            }

            var Helper = (function () {

                var getSegmentColors = function (scope) {

                    var segments = {},
                        j = scope.segments - 1;

                    d3.range(scope.segments).forEach(function (i) {
                        try {
                            segments['.s' + j] = scope.segmentInfo[i]['color'];
                        } catch (e) {
                            segments['.s' + j] = "#efefef";
                        } finally {
                            j--;
                        }
                    });

                    return segments;
                }

                function Helper(config) {
                    this.config = config;
                    this.dimension = config.dimension;
                    this.measures = config.measures;
                    this.orientation = config.orientation.toLowerCase();
                    this.fontStyle = config.fontStyle;
                    this.fontWeight = config.fontWeight;
                    this.fontSize = config.fontSize;
                    this.showLabel = config.showLabel;
                    this.targetColor = config.targetColor;
                    this.valueColor = config.valueColour;
                    this.segments = config.segments;
                    this.segmentInfo = config.segmentInfo;
                    this.measureNumberFormat = config.measureNumberFormat;
                    this.targetNumberFormat = config.targetNumberFormat;
                }

                Helper.prototype.setMeasuresSum = function (val) {
                    this.measuresSum = val;
                }

                Helper.prototype.setTargetSum = function (val) {
                    this.targetSum = val;
                }

                Helper.prototype.getFontStyle = function () {
                    return this.fontStyle;
                }

                Helper.prototype.getFontWeight = function () {
                    return this.fontWeight;
                }

                Helper.prototype.getFontSize = function () {
                    return this.fontSize;
                }

                Helper.prototype.getVisibility = function () {
                    return this.showLabel ? "inherit" : "none";
                }

                Helper.prototype.getOrientation = function () {
                    return this.orientation;
                }

                Helper.prototype.getMargin = function (containerWidth) {
                    var margin = {
                        top: 15,
                        bottom: 15
                    };

                    if (this.orientation == 'horizontal') {
                        if (this.showLabel) {
                            margin['left'] = Math.floor(containerWidth / 8);
                        } else {
                            margin['left'] = 20;
                        }
                        margin['right'] = 20;
                    } else if (this.orientation == 'vertical') {
                        margin['left'] = 15;
                        margin['right'] = 15;
                        margin['top'] = 30;
                    }

                    return margin;
                }

                Helper.prototype.getSegmentValues = function (endValue) {
                    var me = this,
                        segments = [],
                        d;

                    d3.range(this.segments).forEach(function (i) {
                        try {
                            if (d = me.segmentInfo[i]['upto']) {
                                segments.push(d);
                            }
                        } catch (e) {
                            // pass
                        }
                    });

                    if (segments[segments.length - 1] > endValue) {
                        segments.push(segments[segments.length - 1]);
                    } else {
                        segments.push(endValue);
                    }

                    return segments;
                }

                Helper.prototype.formatUsingCss = function (scope) {
                    var bullet = $(scope.container).find('.bullet'),
                        range = bullet.find('.range');

                    bullet.css('font', '9px sans-serif');
                    bullet.find('.marker').css('stroke', this.targetColor)
                        .css('stroke-width', '2px');
                    bullet.find('.tick line').css('stroke', '#666')
                        .css('stroke-width', '0.5px');
                    bullet.find('.measure').css('fill', this.valueColor);
                    bullet.find('.title').css('font-size', '1.1em');

                    if (this.orientation == 'vertical') {
                        bullet.find('.tick text').each(function (i, d) {
                            var text = $(d).text();
                            $(d).text(D3Utils.getTruncatedLabel(d, D3Utils.shortScale(2)(D3Utils.convertToNumber(text)), 25));
                        });
                    } else {
                        bullet.find('.tick text').each(function (i, d) {
                            var text = $(d).text();
                            $(d).text(D3Utils.getTruncatedLabel(d, D3Utils.shortScale(2)(D3Utils.convertToNumber(text)), 25));
                        });
                    }

                    var obj;
                    for (var property in obj = getSegmentColors(this)) {
                        if (obj.hasOwnProperty(property)) {
                            range.filter(property).css('fill', obj[property]);
                        }
                    }
                }

                Helper.prototype.toggleTooltip = function (scope, visibility) {
                    return function (d, i) {
                        var tooltip = d3.select(scope.container).select('.tooltip_custom');
                        if (visibility == 'visible') {
                            d3.select(this).style('cursor', 'pointer');
                            tooltip.html((function () {
                                var measureNf = D3Utils.getNumberFormatter(scope.helper.measureNumberFormat),
                                    targetNf = D3Utils.getNumberFormatter(scope.helper.targetNumberFormat),
                                    measure,
                                    target;

                                if (scope.helper.measureNumberFormat == "Percent") {
                                    measure = measureNf(d['measures'][0] / scope.helper.measuresSum);
                                } else {
                                    measure = measureNf(d['measures'][0]);
                                }

                                if (measure.indexOf('G') != -1) {
                                    measure = measure.slice(0, -1) + "B";
                                }

                                if (scope.helper.targetNumberFormat == "Percent") {
                                    target = targetNf(d['markers'][0] / scope.helper.targetSum);
                                } else {
                                    target = targetNf(d['markers'][0]);
                                }

                                if (target.indexOf('G') != -1) {
                                    target = target.slice(0, -1) + "B";
                                }

                                return '<table><tr><td>' + d['title'] + '</td></tr>'
                                    + '<tr><td>Value: </td><td class="tooltipData">' + measure + '</td></tr>'
                                    + '<tr><td>Target: </td><td class="tooltipData">' + target + '</td></tr></table>';
                            })());
                        } else {
                            d3.select(this).style('cursor', 'default');
                        }

                        var offset = $(scope.container).offset();
                        var x = d3.event.pageX - offset.left,
                            y = d3.event.pageY - offset.top;

                        // tooltip.style('top', y + 'px').style('left', x + 'px');
                        tooltip.style('visibility', visibility);
                        // D3Utils.constrainTooltip(scope.container, tooltip.node());
                    };
                }

                Helper.prototype.onLassoStart = function (lasso, scope) {
                    return function () {
                        if ($rootScope.filterSelection.lasso) {
                            lasso.items().select('rect.measure')
                                .classed('not_possible', true)
                                .classed('selected', false);
                        }
                    }
                }

                Helper.prototype.onLassoDraw = function (lasso, scope) {
                    return function () {
                        $rootScope.filterSelection.lasso = true;
                        lasso.items().select('rect.measure')
                            .classed('selected', false);

                        lasso.possibleItems().select('rect.measure')
                            .classed('not_possible', false)
                            .classed('possible', true);

                        lasso.notPossibleItems().select('rect.measure')
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

                        lasso.items().select('rect.measure')
                            .classed('not_possible', false)
                            .classed('possible', false);

                        lasso.selectedItems().select('rect.measure')
                            .classed('selected', true)

                        lasso.notSelectedItems().select('rect.measure');

                        var confirm = d3.select(scope.container).select('.confirm')
                            .style('visibility', 'visible');

                        var filter = {};
                        $rootScope.filterSelection.id = scope.id;

                        data.forEach(function (d) {
                            if (filter[scope.helper.dimension]) {
                                var temp = filter[scope.helper.dimension];
                                if (temp.indexOf(d.title) < 0) {
                                    temp.push(d.title);
                                }
                                filter[scope.helper.dimension] = temp;
                            } else {
                                filter[scope.helper.dimension] = [d.title];
                            }
                        });

                        // Clear out the updateWidget property
                        var idWidget = $rootScope.updateWidget[me.id];
                        $rootScope.updateWidget = {};
                        $rootScope.updateWidget[me.id] = idWidget;

                        $rootScope.filterSelection.filter = filter;
                        filterParametersService.save(filter);
                        $rootScope.$broadcast('flairbiApp:filter-input-refresh');
                        $rootScope.$broadcast('flairbiApp:filter');
                    }
                }

                return Helper;

            })();

            var Bullet = (function () {

                function Bullet(container, record, properties) {
                    this.container = container;
                    this.id = record.id;
                    this.originalData = record.data;
                    this.helper = new Helper(properties);
                    this.helper.setMeasuresSum(D3Utils.getSum(record.data, this.helper.measures[0]));
                    this.helper.setTargetSum(D3Utils.getSum(record.data, this.helper.measures[1]));
                    this.offset = 6;

                    $('#bullet-' + this.id).remove();
                    var div = d3.select(container).append('div')
                        .attr('id', 'bullet-' + this.id)
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

                Bullet.prototype.updateChart = function (data) {
                    var me = this;

                    var container = d3.select(this.container);

                    this.originalData = data;

                    data = data.map(function (item) {
                        var d = {};
                        d.title = item[me.helper.dimension];
                        d.ranges = me.helper.getSegmentValues(
                            Math.floor(1.2 * Math.max.apply(Math, [item[me.helper.measures[0]], item[me.helper.measures[1]]]))
                        );
                        d.measures = [item[me.helper.measures[0]]];
                        d.markers = [item[me.helper.measures[1]]];

                        return d;
                    });

                    var bullet = container.selectAll('.bullet')
                        .data(data);

                    bullet.exit().remove();
                    bullet.enter().append('g')
                        .attr('class', 'bullet');
                }

                Bullet.prototype.renderChart = function () {
                    var data = this.originalData;
                    var me = this;

                    var width = this.container.clientWidth;
                    var height = this.container.clientHeight;

                    var svg = d3.select(this.container).select('svg');

                    svg.selectAll('g').remove();

                    svg.attr('width', width)
                        .attr('height', height);

                    data = data.map(function (item) {
                        var d = {};
                        d.title = item[me.helper.dimension];
                        d.ranges = me.helper.getSegmentValues(
                            Math.floor(1.2 * Math.max.apply(Math, [item[me.helper.measures[0]], item[me.helper.measures[1]]]))
                        );
                        d.measures = [item[me.helper.measures[0]]];
                        d.markers = [item[me.helper.measures[1]]];

                        return d;
                    });

                    var orientation = me.helper.getOrientation(),
                        margin = me.helper.getMargin(width);

                    var bullet = d3.bullet()
                        .duration(800);

                    var gWidth = Math.floor((width - margin.left - margin.right) / data.length);
                    var gHeight = Math.floor((height - margin.top - margin.bottom) / data.length);

                    if (orientation == 'horizontal') {
                        bullet.width(width - margin.left - margin.right);
                        if (data.length == 1) {
                            bullet.height(Math.floor(3 * gHeight / 4));
                        } else {
                            bullet.height(Math.floor(gHeight / 2));
                        }
                    } else if (orientation == 'vertical') {
                        bullet.width(height - margin.top - margin.bottom);
                        if (data.length == 1) {
                            bullet.height(Math.floor(3 * gWidth / 4));
                        } else {
                            bullet.height(Math.floor(gWidth / 2));
                        }
                    } else {
                        throw "Invalid orientation";
                    }

                    var g = svg.selectAll('g')
                        .data(data)
                        .enter().append('g')
                        .attr('id', function (d, i) {
                            return 'group_' + me.id + '_' + i;
                        })
                        .attr('class', 'bullet')
                        .attr('transform', function (d, i) {
                            if (orientation == 'horizontal') {
                                return 'translate(' + margin.left + ',' + (margin.top + i * gHeight) + ') rotate(0)';
                            } else if (orientation == 'vertical') {
                                return 'translate(' + (margin.left + i * gWidth) + ',' + (height - margin.top + me.offset) + ') rotate(-90)';
                            }

                        })
                        .call(bullet);

                    var title = g.append('g')
                        .style('text-anchor', function (d) {
                            if (orientation == 'horizontal') {
                                return 'end';
                            } else if (orientation == 'vertical') {
                                return 'middle';
                            }
                        })
                        .attr('display', me.helper.getVisibility())
                        .attr('transform', function (d) {
                            if (orientation == 'horizontal') {
                                return 'translate(' + -me.offset + ',' + Math.floor(gHeight / 3.25) + ')';
                            } else if (orientation == 'vertical') {
                                return 'translate(' + -me.offset * 2 + ',' + Math.floor(gWidth / 3.25) + ')';
                            }
                        })

                    title.append('text')
                        .attr('class', 'title')
                        .attr('font-style', me.helper.getFontStyle())
                        .attr('font-weight', me.helper.getFontWeight())
                        .attr('font-size', me.helper.getFontSize())
                        .attr('transform', function (d) {
                            if (orientation == 'horizontal') {
                                return 'rotate(0)';
                            } else if (orientation == 'vertical') {
                                return 'rotate(90)';
                            }
                        })
                        .text(function (d) { return d.title; })
                        .text(function (d) {
                            if (orientation == 'horizontal') {
                                return D3Utils.getTruncatedLabel(this, d.title, margin.left, me.offset);
                            } else if (orientation == 'vertical') {
                                return D3Utils.getTruncatedLabel(this, d.title, Math.floor(gWidth / 2), me.offset);
                            }
                        });

                    this.helper.formatUsingCss(this);

                    var tooltip = d3.select(me.container).select('.tooltip_custom');
                    tooltip.on('mouseover', function () {
                        var top = parseFloat(tooltip.style('top').replace('px', ''));
                        tooltip.style('top', top + 10 + 'px');
                    });

                    d3.range(data.length).forEach(function (index) {
                        svg.select('#group_' + me.id + '_' + index)
                            .on('mouseover', me.helper.toggleTooltip(me, 'visible'))
                            .on('mousemove', function () {
                                var tooltip = d3.select(me.container).select('.tooltip_custom');
                                var offset = $(me.container).offset();
                                var x = d3.event.pageX - offset.left,
                                    y = d3.event.pageY - offset.top;

                                tooltip.style('top', y + 10 + 'px').style('left', x + 10 + 'px');
                                D3Utils.constrainTooltip(me.container, tooltip.node());
                            })
                            .on('mouseout', me.helper.toggleTooltip(me, 'hidden'))
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

                                var rect = d3.select(this).select('rect.measure');

                                if (rect.classed('selected')) {
                                    rect.classed('selected', false);
                                } else {
                                    rect.classed('selected', true);
                                }

                                if (filter[me.helper.dimension]) {
                                    var temp = filter[me.helper.dimension];
                                    if (temp.indexOf(d.title) < 0) {
                                        temp.push(d.title);
                                    } else {
                                        temp.splice(temp.indexOf(d.title), 0);
                                    }
                                    filter[me.helper.dimension] = temp;
                                } else {
                                    filter[me.helper.dimension] = [d.title];
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
                    });

                    var lasso = d3.lasso()
                        .hoverSelect(true)
                        .closePathSelect(true)
                        .closePathDistance(100)
                        .items(g)
                        .targetArea(svg);

                    lasso.on('start', me.helper.onLassoStart(lasso, me))
                        .on('draw', me.helper.onLassoDraw(lasso, me))
                        .on('end', me.helper.onLassoEnd(lasso, me));

                    svg.call(lasso);
                }

                return Bullet;

            })();

            if (Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                if ($rootScope.filterSelection.id != record.id) {
                    var bulletchart = $rootScope.updateWidget[record.id];
                    bulletchart.updateChart(record.data);
                }
            } else {
                var bulletchart = new Bullet(element[0], record, getProperties(VisualizationUtils, record));
                bulletchart.renderChart();

                $rootScope.updateWidget[record.id] = bulletchart;
            }
        }
    }
}

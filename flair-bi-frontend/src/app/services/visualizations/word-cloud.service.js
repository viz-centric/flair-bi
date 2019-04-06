import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .factory('GenerateWordCloud', GenerateWordCloud);

GenerateWordCloud.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils', 'filterParametersService'];

function GenerateWordCloud(VisualizationUtils, $rootScope, D3Utils, filterParametersService) {
    return {
        build: function (record, element, panel) {

            function getProperties(VisualizationUtils, record) {
                var result = {};

                var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
                    dimensions = features.dimensions,
                    measures = features.measures;

                result['dimension'] = D3Utils.getNames(dimensions)[0];
                result['measure'] = D3Utils.getNames(measures)[0];
                result['minimumSize'] = VisualizationUtils.getPropertyValue(record.properties, 'Minimum Size') || '10px';
                result['maximumSize'] = VisualizationUtils.getPropertyValue(record.properties, 'Maximum Size') || '40px';
                result['labelColor'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Color Pattern').toLowerCase().replace(' ', '_');
                result['fontStyleForDim'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font style');
                result['fontWeightForDim'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font weight');
                result['fontSizeForDim'] = parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font size'));
                result['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Number format');

                return result;
            }

            var Helper = (function () {

                var BASE_COLOR = "#aec7e8";

                var gradientColor = d3.scaleLinear()
                    .range(['#ff9696', '#bc2f2f']);

                function Helper(config) {
                    this.config = config;
                    this.dimension = config.dimension;
                    this.measure = config.measure;
                    this.labelColor = config.labelColor;
                    this.fontStyle = config.fontStyleForDim;
                    this.fontWeight = config.fontWeightForDim;
                    this.fontSize = config.fontSizeForDim;
                    this.minimumSize = parseInt(config.minimumSize);
                    this.maximumSize = parseInt(config.maximumSize);
                    this.numberFormat = config.numberFormat;
                    this.total = 0;

                    this.fontSize = d3.scaleLinear()
                        .range([this.minimumSize, this.maximumSize]);
                }

                Helper.prototype.getFontWeight = function () {
                    return this.fontWeight;
                }

                Helper.prototype.getFontStyle = function () {
                    return this.fontStyle;
                }

                Helper.prototype.getFontSize = function () {
                    return this.fontSize;
                }

                Helper.prototype.setColorDomain = function (values) {
                    var min = Math.min.apply(Math, values),
                        max = Math.max.apply(Math, values);

                    gradientColor.domain([min, max]);
                }

                Helper.prototype.setFontSizeDomain = function (values) {
                    var min = Math.min.apply(Math, values),
                        max = Math.max.apply(Math, values);

                    this.fontSize.domain([min, max]);
                }

                Helper.prototype.getFillColor = function (obj, index) {
                    if (this.labelColor == 'single_color') {
                        return BASE_COLOR;
                    } else if (this.labelColor == 'unique_color') {
                        var r = parseInt(Math.abs(Math.sin(index + 50)) * 255),
                            g = parseInt(Math.abs(Math.cos(index)) * 255),
                            b = parseInt(Math.abs(Math.sin(7 * index - 100)) * 255);
                        return d3.rgb(r, g, b);
                    } else if (this.labelColor == 'gradient_color') {
                        return gradientColor(obj[this.measure]);
                    }
                }

                Helper.prototype.toggleTooltip = function (visibility, scope) {
                    return function (d, i) {
                        var tooltip = d3.select(scope.container).select('.tooltip_custom');

                        if (visibility == 'visible') {
                            d3.select(this).style('cursor', 'pointer');
                            tooltip.html((function () {
                                var si = scope.helper.numberFormat,
                                    nf = D3Utils.getNumberFormatter(si),
                                    value;

                                if (si == "Percent") {
                                    value = nf(d[scope.helper.measure] / scope.helper.total);
                                } else {
                                    value = nf(d[scope.helper.measure]);
                                }

                                if (value.indexOf("G") != -1) {
                                    value = value.slice(0, -1) + "B";
                                }

                                return '<table><tr><td>' + d[scope.helper.dimension] + '</td></tr>'
                                    + '<tr><td>' + D3Utils.title(scope.helper.measure) + ': </td><td>' + value + '</td></tr></table>';
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

                Helper.prototype.setTotal = function (val) {
                    this.total = val;
                }

                return Helper;

            })();

            var Wordcloud = (function () {

                function Wordcloud(container, record, properties) {
                    this.container = container;
                    this.id = record.id;
                    this.originalData = record.data;
                    this.helper = new Helper(properties);
                    this.helper.setTotal(D3Utils.getSum(record.data, this.helper.measure));
                    this.margin = 15;

                    $('#wordcloud-' + this.id).remove();
                    var div = d3.select(container).append('div')
                        .attr('id', 'wordcloud-' + this.id)
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

                Wordcloud.prototype.updateChart = function (data) {
                    var me = this;

                    this.originalData = data;
                    this.renderChart();
                }

                Wordcloud.prototype.renderChart = function () {
                    var data = this.originalData;
                    var me = this;

                    var width = this.container.clientWidth - 2 * this.margin;
                    var height = this.container.clientHeight - 2 * this.margin;

                    var svg = d3.select(this.container).select('svg');

                    svg.selectAll('g').remove();

                    svg.attr('width', width)
                        .attr('height', height)
                        .style('margin', this.margin);

                    var values = data.map(function (d) { return d[me.helper.measure]; });

                    this.helper.setColorDomain(values);
                    this.helper.setFontSizeDomain(values);

                    var layout = d3.layout.cloud()
                        .size([width, height])
                        // .timeInterval(20)
                        .words(data)
                        .rotate(function () {
                            return ~~(Math.random() * 2) * 90;
                        })
                        .font('Impact')
                        .fontSize(function (d, i) {
                            return me.helper.fontSize(d[me.helper.measure]);
                        })
                        .fontWeight(['bold'])
                        .text(function (d) { return d[me.helper.dimension]; })
                        .spiral('rectangular')
                        .on('end', draw)
                        .start();

                    function draw(words) {
                        var wordcloud = svg.append('g')
                            .attr('class', 'wordcloud')
                            .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

                        var group = wordcloud.selectAll('g')
                            .data(words)
                            .enter().append('g')
                            .attr('class', 'word')
                            .on('mouseover', me.helper.toggleTooltip('visible', me))
                            .on('mousemove', function () {
                                var tooltip = d3.select(me.container).select('.tooltip_custom');
                                var offset = $(me.container).offset();
                                var x = d3.event.pageX - offset.left,
                                    y = d3.event.pageY - offset.top;

                                tooltip.style('top', y + 10 + 'px').style('left', x + 10 + 'px');
                                D3Utils.constrainTooltip(me.container, tooltip.node());
                            })
                            .on('mouseout', me.helper.toggleTooltip('hidden', me))
                            .on('click', function (d, i) {
                                if ($rootScope.filterSelection.id && $rootScope.filterSelection.id != record.id) {
                                    return;
                                }

                                var confirm = d3.select(me.container).select('.confirm')
                                    .style('visibility', 'visible');

                                var filter = {};

                                if ($rootScope.filterSelection.id) {
                                    filter = $rootScope.filterSelection.filter;
                                } else {
                                    $rootScope.filterSelection.id = me.id;
                                }

                                var text = d3.select(this).select('text');

                                if (text.classed('selected')) {
                                    text.classed('selected', false);
                                } else {
                                    text.classed('selected', true);
                                }

                                if (filter[me.helper.dimension]) {
                                    var temp = filter[me.helper.dimension];
                                    if (temp.indexOf(d[me.helper.dimension]) < 0) {
                                        temp.push(d[me.helper.dimension]);
                                    } else {
                                        temp.splice(temp.indexOf(d[me.helper.dimension]), 1);
                                    }
                                    filter[me.helper.dimension] = temp;
                                } else {
                                    filter[me.helper.dimension] = [d[me.helper.dimension]];
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

                        var text = group.append('text')
                            .attr('text-anchor', 'middle')
                            .attr('transform', function (d) {
                                return 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')';
                            })
                            .style('fill', function (d, i) {
                                return me.helper.getFillColor(d, i);
                            })
                            .transition()
                            .ease(d3.easeQuadIn)
                            .duration(100)
                            .delay(function (d, i) {
                                return i * 50;
                            })
                            .text(function (d) { return d.text; })
                            .style('font-size', function (d) {
                                return d.size + 'px';
                            })
                            .style('font-weight', function (d) {
                                return me.helper.getFontWeight();
                            })
                            .style('font-style', function (d) {
                                return me.helper.getFontStyle();
                            })
                            .style('font-size', function (d) {
                                return me.helper.getFontSize();
                            })
                            .style('font-family', function (d) {
                                return d.font;
                            });
                    }
                }

                return Wordcloud;

            })();

            if (Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                if ($rootScope.filterSelection.id != record.id) {
                    var wordcloud = $rootScope.updateWidget[record.id];
                    wordcloud.updateChart(record.data);
                }
            } else {
                var wordcloud = new Wordcloud(element[0], record, getProperties(VisualizationUtils, record));
                wordcloud.renderChart();

                $rootScope.updateWidget[record.id] = wordcloud;
            }
        }
    }
}
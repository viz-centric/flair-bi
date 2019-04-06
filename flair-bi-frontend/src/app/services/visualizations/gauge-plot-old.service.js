import angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .factory('GenerateGaugePlot', GenerateGaugePlot);

GenerateGaugePlot.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils'];

function GenerateGaugePlot(VisualizationUtils, $rootScope, D3Utils) {
    return {
        build: function (record, element, panel) {

            function getProperties(VisualizationUtils, record) {
                var result = {};

                var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
                    measures = features.measures;

                result['measures'] = D3Utils.getNames(measures);

                result['gaugeType'] = VisualizationUtils.getPropertyValue(record.properties, 'Gauge Type').toLowerCase();

                result['displayName'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Display name');
                result['fontStyle'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font style');
                result['fontWeight'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font weight');
                result['showValues'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Value on Points');
                result['displayColor'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Display colour');
                result['isGradient'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Enable Gradient Color');
                result['textColor'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Text colour');
                result['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Number format');

                result['targetDisplayName'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Display name');
                result['targetFontStyle'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Font style');
                result['targetFontWeight'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Font weight');
                result['targetShowValues'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Value on Points');
                result['targetDisplayColor'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Display colour');
                result['targetTextColor'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Text colour');
                result['targetNumberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Number format');

                return result;
            }

            var Helper = (function () {

                function Helper(config) {
                    this.config = config;
                    this.measures = config.measures;
                    this.gaugeType = config.gaugeType;
                    this.displayName = config.displayName;
                    this.fontStyle = config.fontStyle;
                    this.fontWeight = config.fontWeight;
                    this.showValues = config.showValues;
                    this.displayColor = config.displayColor;
                    this.isGradient = config.isGradient;
                    this.textColor = config.textColor;
                    this.numberFormat = config.numberFormat;

                    this.targetDisplayName = config.targetDisplayName;
                    this.targetFontStyle = config.targetFontStyle;
                    this.targetFontWeight = config.targetFontWeight;
                    this.targetShowValues = config.targetShowValues;
                    this.targetDisplayColor = config.targetDisplayColor;
                    this.targetTextColor = config.targetTextColor;
                    this.targetNumberFormat = config.targetNumberFormat;

                    this.minValue = null;
                    this.maxValue = null;
                }

                Helper.prototype.getGaugeType = function () {
                    return this.gaugeType;
                }

                Helper.prototype.getMinimumValue = function (data) {
                    if (this.minValue) {
                        return this.minValue;
                    }

                    var targetVal = this.getMeasureSum(data, true),
                        measureVal = this.getMeasureSum(data);

                    this.minValue = Math.min(targetVal, measureVal);
                    this.minValue = this.minValue > 0 ? 0 : this.minValue;

                    return this.minValue;
                }

                Helper.prototype.getMaximumValue = function (data) {
                    if (this.maxValue) {
                        return this.maxValue;
                    }

                    var targetVal = this.getMeasureSum(data, true),
                        measureVal = this.getMeasureSum(data);

                    this.maxValue = Math.max(targetVal, measureVal);
                    this.maxValue = this.maxValue < 0 ? 0 : this.maxValue * 1.25;

                    return this.maxValue;
                }

                Helper.prototype.getDisplayName = function (target) {
                    if (target) {
                        return this.targetDisplayName;
                    }

                    return this.displayName;
                }

                Helper.prototype.getFontStyle = function (target) {
                    if (target) {
                        return this.targetFontStyle;
                    }

                    return this.fontStyle;
                }

                Helper.prototype.getFontWeight = function (target) {
                    if (target) {
                        return this.targetFontWeight;
                    }

                    return this.fontWeight;
                }

                Helper.prototype.getDisplayColor = function (target) {
                    if (target) {
                        return this.targetDisplayColor;
                    }

                    return this.displayColor;
                }

                Helper.prototype.getTextColor = function (target) {
                    if (target) {
                        return this.targetTextColor;
                    }

                    return this.textColor;
                }

                Helper.prototype.getNumberFormat = function (target) {
                    if (target) {
                        return this.targetNumberFormat;
                    }

                    return this.numberFormat;
                }

                Helper.prototype.percToDeg = function (perc) {
                    return perc * 360;
                }

                Helper.prototype.percToRad = function (perc) {
                    return this.degToRad(this.percToDeg(perc));
                }

                Helper.prototype.degToRad = function (deg) {
                    return deg * Math.PI / 180;
                }

                Helper.prototype.getValueVisibility = function (target) {
                    if (target) {
                        return this.targetShowValues ? 'visible' : 'hidden';
                    }

                    return this.showValues ? 'visible' : 'hidden';
                }

                Helper.prototype.getTxCenter = function (width, height) {
                    if (this.gaugeType == 'radial') {
                        return 'translate(' + (width / 2) + ', ' + (height / 2) + ')';
                    } else {
                        return 'translate(' + (width / 2) + ', ' + (height - 15) + ')';
                    }
                }

                Helper.prototype.getMeasureSum = function (data, target) {
                    var me = this;

                    if (target) {
                        return d3.sum(data, function (d) { return d[me.measures[1]]; })
                    }

                    return d3.sum(data, function (d) { return d[me.measures[0]]; })
                }

                Helper.prototype.getFormattedValue = function (num, format) {
                    var result,
                        decimal = 0;

                    switch (format) {
                        case "K":
                            result = D3Utils.roundNumber((num / '1e3'), decimal);
                            result = isNaN(result) ? 0 : result;
                            result += " K";
                            break;

                        case "M":
                            result = D3Utils.roundNumber((num / '1e6'), decimal);
                            result = isNaN(result) ? 0 : result;
                            result += " M";
                            break;

                        case "B":
                            result = D3Utils.roundNumber((num / '1e9'), decimal);
                            result = isNaN(result) ? 0 : result;
                            result += " B";
                            break;

                        case "Percent":
                            var divisor = this.getMaximumValue() - this.getMinimumValue();
                            result = D3Utils.roundNumber(((num / divisor) * 100), decimal) + " %";
                            break;

                        default:
                            result = D3Utils.roundNumber(num, decimal);
                    }

                    return result;
                }


                return Helper;

            })();

            var Gauge = (function () {

                function Gauge(container, record, properties) {
                    this.container = container;
                    this.id = record.id;
                    this.originalData = record.data;
                    this.helper = new Helper(properties);

                    $('#gauge-' + this.id).remove();
                    var div = d3.select(container).append('div')
                        .attr('id', 'gauge-' + this.id)
                        .style('width', this.container.clientWidth + 'px')
                        .style('height', this.container.clientHeight + 'px')
                        .style('overflow', 'hidden')
                        .style('text-align', 'center')
                        .style('position', 'relative');

                    div.append('svg');
                }

                Gauge.prototype.updateChart = function (data) {
                    var me = this;

                    this.ring.moveTo(me.helper.getMeasureSum(data), me.helper.getMeasureSum(data, true));
                }

                Gauge.prototype.renderChart = function () {
                    var data = this.originalData;
                    var me = this;

                    var width = this.container.clientWidth;
                    var height = this.container.clientHeight;

                    var svg = d3.select(this.container).select('svg');

                    svg.selectAll('g').remove();

                    svg.attr('width', width)
                        .attr('height', height);

                    var Ring = (function () {

                        // Private methods
                        var repaintGauge = function (perc, divisor) {
                            var start = this.config.totalPercent,
                                arcStartRad = this.helper.percToRad(start),
                                arcEndRad = arcStartRad + this.helper.percToRad(perc / divisor);

                            start += perc / divisor;

                            this.fillArc.startAngle(arcStartRad)
                                .endAngle(arcEndRad);

                            arcStartRad = this.helper.percToRad(start);
                            arcEndRad = arcStartRad + this.helper.percToRad((1 - perc) / divisor);

                            this.emptyArc.startAngle(arcStartRad)
                                .endAngle(arcEndRad - this.config.padRad);

                            this.chart.select('#gauge-fill')
                                .attr('d', this.fillArc);

                            this.chart.select('#gauge-empty')
                                .attr('d', this.emptyArc);

                        }

                        function Ring(container, config, helper) {
                            this.container = container;
                            this.config = config;
                            this.oldData = 0;
                            this.helper = helper;
                        }

                        // Extended Public Methods
                        Ring.prototype.render = function () {
                            var me = this,
                                svg = this.container,
                                radius = this.config.radius || this.config.minRadius,
                                ringInset = this.config.ringInset || radius * 0.3,
                                ringWidth = this.config.ringWidth || radius * 0.2;

                            var chart = this.chart = svg.append('g')
                                .attr('transform', me.helper.getTxCenter(width, height));

                            chart.append('path')
                                .attr('id', 'gauge-fill')
                                .attr('fill', me.config.fillColor);

                            chart.append('path')
                                .attr('id', 'gauge-empty')
                                .attr('fill', me.config.emptyColor);

                            chart.append('path')
                                .attr('id', 'gauge-target')
                                .attr('fill', me.config.targetColor);

                            chart.append('text')
                                .attr('id', 'measure-value')
                                .attr('text-anchor', 'middle')
                                .attr('fill', me.config.valueColor)
                                .attr('dy', function () {
                                    if (me.helper.getGaugeType() === 'radial') {
                                        return 0;
                                    } else {
                                        return -15;
                                    }
                                })
                                .style('font-size', '1.7em')
                                .style('font-weight', me.helper.getFontWeight())
                                .style('font-style', me.helper.getFontStyle())
                                .style('visibility', me.helper.getValueVisibility())
                                .text(0);

                            chart.append('text')
                                .attr('id', 'target-value')
                                .attr('text-anchor', 'middle')
                                .attr('fill', me.config.valueColor)
                                .attr('dy', function () {
                                    if (me.helper.getGaugeType() === 'radial') {
                                        return 15;
                                    } else {
                                        return 0;
                                    }
                                })
                                .style('font-size', '1.1em')
                                .style('font-weight', me.helper.getFontWeight(true))
                                .style('font-style', me.helper.getFontStyle(true))
                                .style('visibility', me.helper.getValueVisibility(true))
                                .text(0);

                            this.fillArc = d3.arc()
                                .outerRadius(radius - ringInset)
                                .innerRadius(radius - ringInset - ringWidth);

                            this.emptyArc = d3.arc()
                                .outerRadius(radius - ringInset)
                                .innerRadius(radius - ringInset - ringWidth);

                            this.targetArc = d3.arc()
                                .outerRadius((radius - ringInset) * 1.01)
                                .innerRadius((radius - ringInset - ringWidth) * 0.98);
                        }

                        Ring.prototype.moveTo = function (data, target) {
                            var me = this,
                                svg = this.container;

                            this.chart.transition()
                                .delay(0)
                                .ease(d3.easeQuadIn)
                                .duration(2200)
                                .tween('progress', function () {
                                    var range = me.config.range,
                                        valOld = me.oldData,
                                        valNew = data,
                                        divisor;

                                    range.every(function (d) {
                                        if (d === undefined) {
                                            range = [0, 100];
                                            return;
                                        }
                                    });

                                    if (valOld === undefined) {
                                        valOld = 0;
                                    }

                                    if (valNew === undefined) {
                                        valNew = 0;
                                    }

                                    var perc = (valNew - range[0]) / (range[1] - range[0]),
                                        oldPerc = (valOld - range[0]) / (range[1] - range[0]);

                                    perc = (perc < 0) ? 0 : (perc > 1) ? 1 : perc;

                                    if (me.helper.getGaugeType() === 'radial') {
                                        divisor = 1;
                                    } else {
                                        divisor = 2;
                                    }

                                    return function (percentOfPercent) {
                                        var progress = oldPerc + percentOfPercent * (perc - oldPerc);
                                        repaintGauge.call(me, progress, divisor);
                                        return true;
                                    }
                                });

                            this.chart.select('text#measure-value')
                                .transition()
                                .ease(d3.easeQuadIn)
                                .duration(2200)
                                .delay(0)
                                .tween('text', function () {
                                    var self = d3.select(this),
                                        i = d3.interpolateNumber(self.text(), data),
                                        numberFormat = me.helper.getNumberFormat(),
                                        text;

                                    return function (t) {
                                        text = me.helper.getDisplayName()
                                            + ": "
                                            + me.helper.getFormattedValue(i(t), numberFormat);
                                        self.text(text);
                                        self.text(D3Utils.getTruncatedLabel(
                                            self.node(),
                                            text,
                                            (2 * me.fillArc.innerRadius()())
                                        ));
                                    }
                                })
                                .on('end', function () {
                                    me.oldData = data;
                                });

                            var range = me.config.range;

                            range.every(function (d) {
                                if (d === undefined) {
                                    range = [0, 100];
                                }
                            });

                            var targetPerc = (target - range[0]) / (range[1] - range[0]);

                            targetPerc = (targetPerc < 0) ? 0 : (targetPerc > 1) ? 1 : targetPerc;

                            if (this.helper.getGaugeType() != 'radial') {
                                targetPerc /= 2;
                            }

                            var startAngle = this.helper.percToRad(this.config.totalPercent + targetPerc);

                            this.targetArc.startAngle(startAngle)
                                .endAngle(startAngle + this.config.targetWidth);

                            this.chart.select('#gauge-target')
                                .attr('d', this.targetArc);

                            var targetText = me.helper.getDisplayName(true)
                                + ": "
                                + this.helper.getFormattedValue(
                                    target,
                                    this.helper.getNumberFormat(true)
                                );

                            this.chart.select('text#target-value')
                                .text(targetText)
                                .text(function () {
                                    return D3Utils.getTruncatedLabel(
                                        this,
                                        targetText,
                                        (2 * me.fillArc.innerRadius()())
                                    )
                                })
                        }

                        return Ring;

                    })();

                    var ring = this.ring = new Ring(svg, {
                        radius: (function () {
                            var radius;
                            if (me.helper.getGaugeType() === 'radial') {
                                radius = Math.min(width, height) / 2;
                            } else {
                                radius = Math.max(width, height) / 2;
                                radius = radius > Math.min(width, height) ? Math.min(width, height) : radius;
                            }
                            return radius;
                        })(),
                        padRad: 0.005,
                        minRadius: 60,
                        range: [me.helper.getMinimumValue(data), me.helper.getMaximumValue(data)],
                        totalPercent: (function () {
                            if (me.helper.getGaugeType() === 'radial') {
                                return 0.5;
                            }
                            return 0.75;
                        })(),
                        fillColor: me.helper.getDisplayColor(),
                        emptyColor: '#efefef',
                        targetColor: me.helper.getDisplayColor(true),
                        targetWidth: 0.02,
                        valueColor: me.helper.getTextColor(),
                        targetValueColor: me.helper.getTextColor(true)
                    }, this.helper);

                    ring.render();
                    ring.moveTo(me.helper.getMeasureSum(data), me.helper.getMeasureSum(data, true));
                }

                return Gauge;

            })();

            if (Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                if ($rootScope.filterSelection.id != record.id) {
                    var gauge = $rootScope.updateWidget[record.id];
                    gauge.updateChart(record.data);
                }
            } else {
                var gauge = new Gauge(element[0], record, getProperties(VisualizationUtils, record));
                gauge.renderChart();

                $rootScope.updateWidget[record.id] = gauge;
            }
        }
    }
}
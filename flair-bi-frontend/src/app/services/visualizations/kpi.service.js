import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .factory('GenerateKPI', GenerateKPI);

GenerateKPI.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils'];

function GenerateKPI(VisualizationUtils, $rootScope, D3Utils) {
    return {
        build: function (record, element, panel) {

            function getProperties(VisualizationUtils, record) {
                var result = {};

                var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
                    dimension = features.dimensions,
                    measures = features.measures,
                    eachMeasure,
                    allMeasures = [];

                result['measures'] = D3Utils.getNames(measures);

                for (var i = 0; i < measures.length; i++) {
                    eachMeasure = {};
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
                    allMeasures.push(eachMeasure);
                }

                result['forEachMeasure'] = allMeasures;

                return result;
            }

            var Helper = (function () {

                var DEFAULT_COLOR = "#dedede";

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
                    this.measures = config.measures;
                    this.forEachMeasure = config.forEachMeasure;
                }

                Helper.prototype.getAlignment = function (index) {
                    return this.forEachMeasure[index]['alignment'];
                }

                Helper.prototype.getNumberFormat = function (index) {
                    var si = this.forEachMeasure[index]['numberFormat'],
                        nf = D3Utils.getNumberFormatter(si);

                    return nf;
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

                Helper.prototype.getTextColorExpression = function (index, value) {
                    var textColor = this.getTextColor(index),
                        textColorExpression = this.forEachMeasure[index]['textColorExpression'];

                    if (textColorExpression.length == 0) {
                        return textColor || DEFAULT_COLOR;
                    }

                    if (isNaN(value)) {
                        return textColorExpression.filter(function (t) { return t.hasOwnProperty('default'); })[0]['colorCode'] || DEFAULT_COLOR;
                        // return textColorExpression.find(obj => obj.hasOwnProperty('default'))['colorCode'] || DEFAULT_COLOR;
                    }

                    return expressionEvaluator(textColorExpression, value, 'colorCode');
                }

                Helper.prototype.getIcon = function (index, value) {
                    var icon = this.forEachMeasure[index]['icon'],
                        iconExpression = this.forEachMeasure[index]['iconExpression'];

                    if (iconExpression.length == 0) {
                        return icon;
                    }

                    if (isNaN(value)) {
                        return iconExpression.filter(function (t) { return t.hasOwnProperty('default'); })[0]['icon'] || icon;
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
                        return DEFAULT_COLOR;
                    }

                    if (isNaN(value)) {
                        return iconExpression.filter(function (i) { return i.hasOwnProperty('default'); })[0]['colorCode'] || DEFAULT_COLOR;
                        // return iconExpression.find(obj => obj.hasOwnProperty('default'))['colorCode'] || DEFAULT_COLOR;
                    }

                    return expressionEvaluator(iconExpression, value, 'colorCode');
                }

                Helper.prototype.displayKPI = function (measure, index) {
                    var result = "";

                    var style = {
                        'background-color': this.getBackgroundColor(index),
                        'font-style': this.getTextFontStyle(index),
                        'font-weight': this.getTextFontWeight(index),
                        'font-size': this.getTextFontSize(index),
                        'color': this.getTextColorExpression(index, measure)
                    };

                    if (index === 0) {
                        // primary measure
                        style['padding'] = "5px 8px";
                        // style['font-size'] = "3em";
                    } else {
                        // secondary measure
                        style['padding'] = "5px 8px 5px 5px";
                        // style['font-size'] = "1.5em";
                    }

                    style = JSON.stringify(style);
                    style = style.replace(/["{}]/g, '').replace(/,/g, ';');

                    result += "<span style=\"" + style + "\">" + this.getNumberFormat(index)(D3Utils.roundNumber(measure, 2)) + this.iconDisplay(measure, index) + "</span>";

                    return result;
                }

                Helper.prototype.iconDisplay = function (measure, index) {
                    var result = "";

                    var style = {
                        'font-weight': this.getIconWeight(index),
                        'color': this.getIconColor(index, measure)
                    };

                    style = JSON.stringify(style);
                    style = style.replace(/["{}]/g, '').replace(/,/g, ';');

                    result += "&nbsp;<i class=\"" + this.getIcon(index, measure) + "\" style=\"" + style + "\" aria-hidden=\"true\"></i>"

                    return result;
                }

                Helper.prototype.processTemplate = function (measures) {
                    var me = this,
                        result = "";

                    measures.forEach(function (m, i) {
                        result += "<div style=\"text-align: " + me.getAlignment(i) + "\">"
                            + me.displayKPI(m, i)
                            + "</div>";
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

                return Helper;

            })();

            var KPI = (function () {

                function KPI(container, record, properties) {
                    this.container = container;
                    this.id = record.id;
                    this.originalData = record.data;
                    this.helper = new Helper(properties);

                    $('#kpi-' + this.id).remove();

                    var div = d3.select(container).append('div')
                        .attr('id', 'kpi-' + this.id)
                        .attr('class', 'kpi');
                }

                KPI.prototype.updateChart = function (data) {
                    var kpi = d3.select('#kpi-' + this.id);
                    kpi.select('div').remove();

                    this.originalData = data;
                    this.renderChart();
                }

                KPI.prototype.renderChart = function () {
                    var data = this.originalData;
                    var me = this;

                    var width = this.container.clientWidth;
                    var height = this.container.clientHeight;

                    $('#kpi-' + this.id).css('width', width)
                        .css('height', height);

                    var kpi = d3.select('#kpi-' + this.id);

                    kpi.append('div')
                        .attr('class', 'parent')
                        .style('padding', '10px')
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
                }

                return KPI;

            })();

            if (Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                if ($rootScope.filterSelection.id != record.id) {
                    var kpi = $rootScope.updateWidget[record.id];
                    kpi.updateChart(record.data);
                }
            } else {
                var kpi = new KPI(element[0], record, getProperties(VisualizationUtils, record));
                kpi.renderChart();

                $rootScope.updateWidget[record.id] = kpi;
            }
        }
    }
}
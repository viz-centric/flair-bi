(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('GenerateTextObject', GenerateTextObject);

    GenerateTextObject.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils'];

    function GenerateTextObject(VisualizationUtils, $rootScope, D3Utils) {
        return {
            build: function (record, element, panel) {

                function getProperties(VisualizationUtils, record) {
                    var result = {};

                    var data = record.data[0];

                    var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
                        dimensions = features.dimensions,
                        measures = features.measures,
                        eachMeasure,
                        allMeasures = [];

                    result['descriptive'] = VisualizationUtils.getPropertyValue(record.properties, 'Descriptive');
                    result['alignment'] = VisualizationUtils.getPropertyValue(record.properties, 'Alignment');

                    for(var i=0; i<measures.length; i++) {
                        eachMeasure = {};
                        eachMeasure['value'] = data[measures[i]['feature']['name']];
                        eachMeasure['backgroundColor'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Background Colour');
                        eachMeasure['textColor'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour');
                        eachMeasure['underline'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Underline');
                        eachMeasure['fontStyle'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style');
                        eachMeasure['fontWeight'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight');
                        eachMeasure['fontSize'] = parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size'));
                        eachMeasure['icon'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon name');
                        eachMeasure['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'); 
                        allMeasures.push(eachMeasure);
                    }

                    result['measures'] = allMeasures;

                    return result;
                }

                var Helper = (function() {

                    var escapeRegExp = function(str) {
                        return str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
                    }

                    var escapeSubstitute = function(str) {
                        return str.replace(/\$/g, '$$$$');
                    }

                    var replace = function(target, placeHolder, replacement) {
                        var re = new RegExp(escapeRegExp(placeHolder), 'g');
                        return target.replace(re, escapeSubstitute(replacement));
                    }

                    function Helper(config) {
                        this.config = config;
                        this.alignment = config.alignment;
                        this.descriptive = config.descriptive;
                        this.measures = config.measures;
                    }

                    Helper.prototype.getAlignment = function() {
                        return this.alignment;
                    }

                    Helper.prototype.formatMeasure = function(measure) {
                        var result = "<span style=\"" 
                            + "background-color: " + (measure.backgroundColor ? measure.backgroundColor : "inherit") + ";"
                            + "color: " + measure.textColor + ";"
                            + "font-style: " + measure.fontStyle + ";"
                            + "font-weight: " + measure.fontWeight + ";"
                            + "font-size: " + measure.fontSize + ";"
                            + "\">"
                            + "<i class=\"" + measure.icon + "\" aria-hidden=\"true\"></i>&nbsp;";

                        var nf = D3Utils.getNumberFormatter(measure.numberFormat);
                        var value = nf(measure.value);

                        if(value.indexOf("G") != -1) {
                            value = value.slice(0, -1) + "B";
                        }

                        if(measure.underline) {
                            result += "<u>" + value + "</u></span>";
                        } else {
                            result += value + "</span>";
                        }

                        return result;
                    }

                    Helper.prototype.processTemplate = function(data) {
                        var me = this;
                        var placeHolder = "",
                            result = data;

                        this.measures.forEach(function(m, i) {
                            placeHolder = "{{" + i + "}}";
                            result = replace(result, placeHolder, me.formatMeasure(m));
                        });

                        return result;
                    }

                    return Helper;

                })();

                var Textobject = (function() {

                    function Textobject(container, record, properties) {
                        this.container = container;
                        this.id = record.id;
                        this.originalData = properties.descriptive;
                        this.helper = new Helper(properties);

                        $('#textobject-' + this.id).remove();

                        var div = d3.select(container).append('div')
                            .attr('id', 'textobject-' + this.id)
                            .attr('class', 'textobject');
                    }

                    Textobject.prototype.renderChart = function() {
                        var data = this.originalData;
                        var me = this;

                        var width = this.container.clientWidth;
                        var height = this.container.clientHeight;

                        $('#textobject-' + this.id).css('width', width)
                            .css('height', height);

                        var textobject = d3.select('#textobject-' + this.id);

                        textobject.append('div')
                            .style('text-align', me.helper.getAlignment())
                            .style('line-height', 1.3)
                            .style('padding', '10px')
                            .html(me.helper.processTemplate(data))
                            .transition()
                            .duration(400)
                            .ease(d3.easeQuadIn)
                            .styleTween('font-size', function() {
                                var i = d3.interpolateNumber(0, me.helper.measures.fontSize);
                                return function(t) {
                                    return i(t) + "px";
                                };
                            });
                    }

                    return Textobject;

                })();

                var textObject = new Textobject(element[0], record, getProperties(VisualizationUtils, record));
                textObject.renderChart();

            }
        }
    }
})();
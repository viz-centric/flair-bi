(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('GenerateTable', GenerateTable);

    GenerateTable.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils'];

    function GenerateTable(VisualizationUtils, $rootScope, D3Utils) {
        return {
            build: function (record, element, panel) {
                record.data = [{
                    "order_status": "Kathmandu",
                    "order_item_subtotal": 50,
                    "product_price": 80
                }, {
                    "order_status": "Delhi",
                    "order_item_subtotal": 90,
                    "product_price": 80
                }, {
                    "order_status": "Detroit",
                    "order_item_subtotal": 910,
                    "product_price": 800
                }, {
                    "order_status": "London",
                    "order_item_subtotal": 240,
                    "product_price": 500
                }, {
                    "order_status": "Washington",
                    "order_item_subtotal": 300,
                    "product_price": 600
                }, {
                    "order_status": "Berlin",
                    "order_item_subtotal": 120,
                    "product_price": 500
                }, {
                    "order_status": "Perth",
                    "order_item_subtotal": 110,
                    "product_price": 80
                }, {
                    "order_status": "Ottawa",
                    "order_item_subtotal": 180,
                    "product_price": 90
                }];
                function getProperties(VisualizationUtils, record) {
                    var result = {};

                    var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
                        dimensions = features.dimensions,
                        measures = features.measures,
                        eachMeasure,
                        eachDimension,
                        allMeasures = [],
                        allDimensions = [];

                    result['dimensions'] = D3Utils.getNames(dimensions);
                    result['measures'] = D3Utils.getNames(measures);

                    result['maxDim'] = dimensions.length;
                    result['maxMes'] = measures.length;

                    for (var i = 0; i < result.maxDim; i++) {
                        eachDimension = {};
                        eachDimension['dimension'] = result['dimensions'][i];
                        eachDimension['displayName'] = VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Display name');
                        eachDimension['cellColor'] = VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Cell colour');
                        eachDimension['fontStyle'] = VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font style');
                        eachDimension['fontWeight'] = VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font weight');
                        eachDimension['fontSize'] = parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font size'));
                        eachDimension['textColor'] = VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Text colour');
                        eachDimension['textColorExpression'] = VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Text colour expression');
                        eachDimension['textAlignment'] = VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Alignment').toLowerCase();
                        allDimensions.push(eachDimension);
                    }

                    result['dimensionProp'] = allDimensions;

                    for (var i = 0; i < result.maxMes; i++) {
                        eachMeasure = {};
                        eachMeasure['measure'] = result['measures'][i];
                        eachMeasure['displayName'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name');
                        eachMeasure['cellColor'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Cell colour');
                        eachMeasure['cellColorExpression'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Cell colour expression');
                        eachMeasure['fontStyle'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style');
                        eachMeasure['fontWeight'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight');
                        eachMeasure['fontSize'] = parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size'));
                        eachMeasure['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format');
                        eachMeasure['textColor'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour');
                        eachMeasure['textAlignment'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Text alignment').toLowerCase();
                        eachMeasure['textColorExpression'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour expression');
                        eachMeasure['iconName'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon name');
                        eachMeasure['iconPosition'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon position');
                        eachMeasure['iconExpression'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon Expression');
                        allMeasures.push(eachMeasure);
                    }

                    result['measureProp'] = allMeasures;

                    return result;
                }

                var Helper = (function () {

                    var DEFAULT_COLOR = "#bdbdbd";

                    function Helper(config) {
                        this.config = config;
                        this.dimensions = config.dimensions;
                        this.measures = config.measures;
                        this.maxDim = config.maxDim;
                        this.maxMes = config.maxMes;
                        this.dimensionProp = config.dimensionProp;
                        this.measureProp = config.measureProp;
                    }

                    Helper.prototype.getDisplayName = function (index, isDimension) {
                        if (isDimension) {
                            return this.dimensionProp[index]['displayName'];
                        }
                        return this.measureProp[index]['displayName'];
                    }

                    Helper.prototype.getCellColor = function (index, isDimension) {
                        if (isDimension) {
                            return this.dimensionProp[index]['cellColor'];
                        }
                        return this.measureProp[index]['cellColor'];
                    }

                    Helper.prototype.getCellColorExpression = function (index) {
                        return this.measureProp[index]['cellColorExpression'];
                    }

                    Helper.prototype.getFontStyle = function (index, isDimension) {
                        if (isDimension) {
                            return this.dimensionProp[index]['fontStyle'];
                        }
                        return this.measureProp[index]['fontStyle'];
                    }

                    Helper.prototype.getFontWeight = function (index, isDimension) {
                        if (isDimension) {
                            return this.dimensionProp[index]['fontWeight'];
                        }
                        return this.measureProp[index]['fontWeight'];
                    }

                    Helper.prototype.getFontSize = function (index, isDimension) {
                        if (isDimension) {
                            return this.dimensionProp[index]['fontSize'] + "px";
                        }
                        return this.measureProp[index]['fontSize'] + "px";
                    }

                    Helper.prototype.getTextColor = function (index, isDimension) {
                        if (isDimension) {
                            return this.dimensionProp[index]['textColor'];
                        }
                        return this.measureProp[index]['textColor'];
                    }

                    Helper.prototype.getTextAlignment = function (index, isDimension) {
                        if (isDimension) {
                            return this.dimensionProp[index]['textAlignment'];
                        }
                        return this.measureProp[index]['textAlignment'];
                    }

                    // TODO: this part needs to be implemented
                    Helper.prototype.getTextColorExpression = function (index) {
                        if (isDimension) {
                            return this.dimensionProp[index]['textColorExpression'];
                        }
                        return this.measureProp[index]['textColorExpression'];
                    }

                    Helper.prototype.getIcon = function (index) {
                        if (this.getIconName(index) !== "") {
                            return '<span style="display:block; text-align:' + this.getIconPosition(index) + ';"><i class="' + this.getIconName(index) + '" aria-hidden="true"></i></span>';
                        }

                        return "";
                    }

                    Helper.prototype.getIconName = function (index) {
                        return this.measureProp[index]['iconName'];
                    }

                    Helper.prototype.getIconPosition = function (index) {
                        return this.measureProp[index]['iconPosition'];
                    }

                    Helper.prototype.getIconExpression = function (index) {
                        return this.measureProp[index]['iconExpression'];
                    }

                    Helper.prototype.getValueNumberFormat = function (index) {
                        var si = this.measureProp[index]['numberFormat'],
                            nf = D3Utils.getNumberFormatter(si);

                        return nf;
                    }

                    return Helper;

                })();

                var Table = (function () {

                    function Table(container, record, properties) {
                        this.container = container;
                        this.id = record.id;
                        this.originalData = record.data;
                        this.helper = new Helper(properties);

                        $('#table-' + this.id).remove();

                        var div = d3.select(container).append('div')
                            .attr('id', 'table-' + this.id)
                            .attr('class', 'table-c');
                    }

                    Table.prototype.renderChart = function () {
                        var data = this.originalData;
                        var me = this;

                        var width = this.container.clientWidth;
                        var height = this.container.clientHeight;

                        $('#table-' + this.id).css('width', width)
                            .css('height', height).css('overflow-y', 'hidden').css('overflow-x', 'auto');

                        var table = $('<table id="viz_table" class="display nowrap" style="width:100%"></table>').addClass('table table-condensed table-hover');

                        var thead = "<thead><tr>",
                            tbody = "<tbody>";

                        this.helper.dimensions.forEach(function (item, index) {
                            var title = me.helper.getDisplayName(index, true),
                                style = {
                                    'text-align': me.helper.getTextAlignment(index, true),
                                    'background-color': '#f1f1f1',
                                    'font-weight': 'bold'
                                };

                            style = JSON.stringify(style);
                            style = style.replace(/","/g, ';').replace(/["{}]/g, '');

                            if (title != "") {
                                thead += "<th style=\"" + style + "\">" + title + "</th>";
                            } else {
                                thead += "<th style=\"" + style + "\">" + item + "</th>";
                            }
                        });

                        this.helper.measures.forEach(function (item, index) {
                            var title = me.helper.getDisplayName(index),
                                style = {
                                    'text-align': me.helper.getTextAlignment(index),
                                    'background-color': '#f1f1f1',
                                    'font-weight': 'bold'
                                };

                            style = JSON.stringify(style);
                            style = style.replace(/","/g, ';').replace(/["{}]/g, '');

                            if (title != "") {
                                thead += "<th style=\"" + style + "\">" + title + "</th>";
                            } else {
                                thead += "<th style=\"" + style + "\">" + item + "</th>";
                            }
                        });

                        thead += "</tr></thead>";
                        table.append(thead);

                        data.forEach(function (d) {
                            tbody += "<tr>";
                            me.helper.dimensions.forEach(function (item, index) {
                                var style = {
                                    'text-align': me.helper.getTextAlignment(index, true),
                                    'background-color': me.helper.getCellColor(index, true),
                                    'font-style': me.helper.getFontStyle(index, true),
                                    'font-weight': me.helper.getFontWeight(index, true),
                                    'font-size': me.helper.getFontSize(index, true),
                                    'color': me.helper.getTextColor(index, true)
                                };

                                style = JSON.stringify(style);
                                style = style.replace(/","/g, ';').replace(/["{}]/g, '');
                                tbody += "<td style=\"" + style + "\">" + d[item] + "</td>";
                            });

                            me.helper.measures.forEach(function (item, index) {
                                var style = {
                                    'text-align': me.helper.getTextAlignment(index),
                                    'background-color': me.helper.getCellColor(index),
                                    'font-style': me.helper.getFontStyle(index),
                                    'font-weight': me.helper.getFontWeight(index),
                                    'font-size': me.helper.getFontSize(index),
                                    'color': me.helper.getTextColor(index)
                                };

                                style = JSON.stringify(style);
                                style = style.replace(/","/g, ';').replace(/["{}]/g, '');
                                tbody += "<td style=\"" + style + "\">" + me.helper.getIcon(index) + D3Utils.getFormattedValue(d[item], me.helper.getValueNumberFormat(index)) + "</td>";
                            });
                            tbody += "</tr>";
                        });

                        tbody += "</tbody>";
                        table.append(tbody);

                        $('#table-' + this.id).append(table);

                        $('#table-' + this.id).find('#viz_table').dataTable({
                            scrollY: height - 80,
                            scrollX: true,
                            scrollCollapse: true,
                            ordering: true,
                            info: true,
                            searching: false,
                            dom: '<"table-header">rt<"table-footer"lp>',
                            fnDrawCallback: function (oSettings) {
                                if (oSettings._iDisplayLength > oSettings.fnRecordsDisplay()) {
                                    $(oSettings.nTableWrapper).find('.dataTables_paginate').hide();
                                    $(oSettings.nTableWrapper).find('.dataTables_info').hide();
                                }
                            }
                        });
                    }

                    return Table;

                })();

                var table = new Table(element[0], record, getProperties(VisualizationUtils, record));
                table.renderChart();
            }
        }
    }
})();
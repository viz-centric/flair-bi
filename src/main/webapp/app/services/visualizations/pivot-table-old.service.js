(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('GeneratePivotTable', GeneratePivotTable);

    GeneratePivotTable.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils'];

    function GeneratePivotTable(VisualizationUtils, $rootScope, D3Utils) {
        return {
            build: function (record, element, panel) {

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

                    for(var i=0; i<result.maxDim; i++) {
                        eachDimension = {};
                        eachDimension['dimension'] = result['dimensions'][i];
                        eachDimension['displayName'] = VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Display name');
                        eachDimension['cellColor'] = VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Cell colour');
                        eachDimension['fontStyle'] = VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font style');
                        eachDimension['fontWeight'] = VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font weight');
                        eachDimension['fontSize'] = parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font size'));
                        eachDimension['textColor'] = VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Text colour');
                        eachDimension['textAlignment'] = VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Alignment').toLowerCase();
                        eachDimension['isPivoted'] = VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Pivot');
                        allDimensions.push(eachDimension);
                    }

                    result['dimensionProp'] = allDimensions;

                    for(var i=0; i<result.maxMes; i++) {
                        eachMeasure = {};
                        eachMeasure['measure'] = result['measures'][i];
                        eachMeasure['displayName'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name');
                        eachMeasure['cellColor'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Cell colour');
                        eachMeasure['fontStyle'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style');
                        eachMeasure['fontWeight'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight');
                        eachMeasure['fontSize'] = parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size'));
                        eachMeasure['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format');
                        eachMeasure['textColor'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour');
                        eachMeasure['textAlignment'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Text alignment').toLowerCase();
                        allMeasures.push(eachMeasure);
                    }

                    result['measureProp'] = allMeasures; 

                    return result;
                }

                var Helper = (function() {

                    var DEFAULT_COLOR = "#dedede";

                    function Helper(config) {
                        this.config = config;
                        this.dimensions = config.dimensions;
                        this.measures = config.measures;
                        this.maxDim = config.maxDim;
                        this.maxMes = config.maxMes;
                        this.dimensionProp = config.dimensionProp;
                        this.measureProp = config.measureProp;
                    }

                    Helper.prototype.getDisplayName = function(value, isDimension) {
                        if(isDimension) {
                            return this.dimensionProp.filter(function(item) {
                                return item['dimension'] == value;
                            })[0]['displayName'];
                        }
                        return this.measureProp.filter(function(item) {
                            return item['measure'] == value;
                        })[0]['displayName'];
                    }

                    Helper.prototype.getCellColor = function(value, isDimension) {
                        if(isDimension) {
                            return this.dimensionProp.filter(function(item) {
                                return item['dimension'] == value;
                            })[0]['cellColor'];
                        }
                        return this.measureProp.filter(function(item) {
                            return item['measure'] == value;
                        })[0]['cellColor'];
                    }

                    Helper.prototype.getFontStyle = function(value, isDimension) {
                        if(isDimension) {
                            return this.dimensionProp.filter(function(item) {
                                return item['dimension'] == value;
                            })[0]['fontStyle'];
                        }
                        return this.measureProp.filter(function(item) {
                            return item['measure'] == value;
                        })[0]['fontStyle'];
                    }

                    Helper.prototype.getFontWeight = function(value, isDimension) {
                        if(isDimension) {
                            return this.dimensionProp.filter(function(item) {
                                return item['dimension'] == value;
                            })[0]['fontWeight'];
                        }
                        return this.measureProp.filter(function(item) {
                            return item['measure'] == value;
                        })[0]['fontWeight'];
                    }

                    Helper.prototype.getFontSize = function(value, isDimension) {
                        if(isDimension) {
                            return this.dimensionProp.filter(function(item) {
                                return item['dimension'] == value;
                            })[0]['fontSize'] + 'px';
                        }
                        return this.measureProp.filter(function(item) {
                            return item['measure'] == value;
                        })[0]['fontSize'] + 'px';
                    }

                    Helper.prototype.getTextColor = function(value, isDimension) {
                        if(isDimension) {
                            return this.dimensionProp.filter(function(item) {
                                return item['dimension'] == value;
                            })[0]['textColor'];
                        }
                        return this.measureProp.filter(function(item) {
                            return item['measure'] == value;
                        })[0]['textColor'];
                    }

                    Helper.prototype.getTextAlignment = function(value, isDimension) {
                        if(isDimension) {
                            return this.dimensionProp.filter(function(item) {
                                return item['dimension'] == value;
                            })[0]['textAlignment'];
                        }
                        return this.measureProp.filter(function(item) {
                            return item['measure'] == value;
                        })[0]['textAlignment'];
                    }

                    Helper.prototype.getValueNumberFormat = function(value) {
                        var si = this.measureProp.filter(function(item) {
                                return item['measure'] == value;
                            })[0]['numberFormat'],
                            nf = D3Utils.getNumberFormatter(si);

                        return nf;
                    }

                    Helper.prototype.getPivotedDimension = function() {
                        var me = this,
                            result = [];

                        this.dimensionProp.forEach(function(dp, i) {
                            if(dp.isPivoted) {
                                result.push(me.dimensions[i]);
                            }
                        });

                        return result;
                    }

                    Helper.prototype.getUnPivotedDimension = function() {
                        var me = this,
                            result = [];

                        this.dimensionProp.forEach(function(dp, i) {
                            if(!dp.isPivoted) {
                                result.push(me.dimensions[i]);
                            }
                        });

                        return result;
                    }

                    Helper.prototype.getUniqueData = function(data, pivoted_dimension) {
                        var result = [];

                        data.forEach(function(d) {
                            if(result.indexOf(d[pivoted_dimension]) == -1) {
                                result.push(d[pivoted_dimension]);
                            }
                        });

                        return result;
                    }

                    Helper.prototype.getColspanValue = function(mapper, index) {
                        var arr = mapper.values().slice(index),
                            multiplier = 1;

                        arr.forEach(function(v) {
                            multiplier *= v.length;
                        });

                        return multiplier;
                    }

                    Helper.prototype.getCloneFactor = function(mapper, index) {
                        var arr = mapper.values(),
                            multiplier = this.maxMes;

                        for(var i = 0; i < index; i++) {
                            multiplier *= arr[i].length;
                        }

                        return multiplier;
                    }

                    return Helper;

                })();

                var PivotTable = (function() {

                    function PivotTable(container, record, properties) {
                        this.container = container;
                        this.id = record.id;
                        this.originalData = record.data;
                        this.helper = new Helper(properties);

                        $('#pivottable-' + this.id).remove();

                        var div = d3.select(container).append('div')
                            .attr('id', 'pivottable-' + this.id)
                            .attr('class', 'pivottable');
                    }

                    PivotTable.prototype.renderChart = function() {
                        var data = this.originalData;
                        var me = this;

                        var width = this.container.clientWidth;
                        var height = this.container.clientHeight;

                        $('#pivottable-' + this.id).css('width', width)
                        .css('height', height).css('overflow-y', 'hidden').css('overflow-x', 'auto');

                        var nester = d3.nest(),
                            pivotedDimension = this.helper.getPivotedDimension();

                        var unpivotedDimension = this.helper.getUnPivotedDimension();

                        unpivotedDimension.forEach(function(dim) {
                            nester = nester.key(function(d) {
                                return d[dim];
                            })
                        });

                        nester.rollup(function(values) {
                            var _sorter = function(x, y, i) {
                                if(typeof(pivotedDimension[i]) === 'undefined') {
                                    return 0;
                                }

                                return x[pivotedDimension[i]] < y[pivotedDimension[i]]
                                    ? -1 : x[pivotedDimension[i]] > y[pivotedDimension[i]] ? 1 : _sorter(x, y, i + 1);
                            }

                            var sortedValues = values.sort(function(x, y) {
                                return _sorter(x, y, 0);
                            });

                            sortedValues = values;

                            var leafNode = function(data, measure, value) {
                                var leafDim = "";
                                
                                pivotedDimension.forEach(function(pd) {
                                    leafDim += "_" + data[pd];
                                });

                                return {
                                    name: measure + leafDim,
                                    value: value
                                };
                            }

                            var result = [];

                            me.helper.measures.forEach(function(m) {
                                var temp = sortedValues.map(function(d) {
                                    return leafNode(d, m, d[m]);
                                });

                                result = Array.prototype.concat(result, temp);
                            });

                            return result;
                        });

                        var nestedData = nester.entries(data),
                            pivotedData = [];

                        var getGeneratedPivotData = function(nestedData, depth, obj) {
                            nestedData.forEach(function(kv) {
                                var a = kv.key;
                                obj = (depth !== 0) ? (jQuery.extend(true, {}, obj) || {}) : {};
                                obj[unpivotedDimension[depth]] = a;

                                if(kv.value) {
                                    kv.value.forEach(function(d) {
                                        obj[d.name] = d.value;
                                    });
                                    pivotedData.push(obj);
                                } else {
                                    getGeneratedPivotData(kv.values, depth + 1, obj);
                                }
                            });
                        }

                        getGeneratedPivotData(nestedData, 0);

                        var mapper = d3.map();

                        pivotedDimension.forEach(function(pd) {
                            mapper.set(pd, me.helper.getUniqueData(data, pd));
                        });

                        var table = $('<table id="viz_pivot-table" class="display nowrap" style="width:100%"></table>').addClass('table table-condensed table-hover');

                        var thead = "<thead><tr>",
                            tbody = "<tbody>";

                        if(this.helper.dimensions.length === unpivotedDimension.length) {
                            unpivotedDimension.forEach(function(upd, i) {
                                var style = {
                                    'text-align': me.helper.getTextAlignment(upd, true),
                                    'background-color': '#f7f7f7',
                                    'font-weight': 'bold'
                                };

                                style = JSON.stringify(style);
                                style = style.replace(/","/g, ';').replace(/["{}]/g, '');

                                thead += "<th style=\"" + style + "\">" + upd + "</th>";
                            });
                        } else {
                            thead += "<th colspan=\"" + unpivotedDimension.length + "\" rowspan=\"" + pivotedDimension.length + "\"></th>";
                        }

                        this.helper.measures.forEach(function(m) {
                            var style = {
                                'text-align': me.helper.getTextAlignment(m),
                                'background-color': '#f7f7f7',
                                'font-weight': 'bold'
                            };

                            style = JSON.stringify(style);
                            style = style.replace(/","/g, ';').replace(/["{}]/g, '');

                            thead += "<th colspan=\"" + me.helper.getColspanValue(mapper, 0) + "\" style=\"" + style + "\">" + m + "</th>";
                        });

                        thead += "</tr>";

                        var createHeaders = function(iterator, key, depth) {
                            var row = "<tr>",
                                content = "",
                                output = "";

                            iterator.forEach(function(item) {
                                var style = {
                                    'text-align': me.helper.getTextAlignment(key, true),
                                    'background-color': me.helper.getCellColor(key, true),
                                    'font-style': me.helper.getFontStyle(key, true),
                                    'font-weight': me.helper.getFontWeight(key, true),
                                    'font-size': me.helper.getFontSize(key, true),
                                    'color': me.helper.getTextColor(key, true)
                                };

                                style = JSON.stringify(style);
                                style = style.replace(/","/g, ';').replace(/["{}]/g, '');

                                content += "<th style=\"" + style + "\" colspan=\"" + me.helper.getColspanValue(mapper, depth + 1) + "\">" + item + "</th>";
                            });

                            for(var i = 0; i < me.helper.getCloneFactor(mapper, depth); i++) {
                                output += content;
                            }

                            if(depth == (pivotedDimension.length - 1)) {
                                var temp = "";

                                unpivotedDimension.forEach(function(upd) {
                                    var style = {
                                        'text-align': me.helper.getTextAlignment(upd, true),
                                        'background-color': '#f7f7f7',
                                        'font-weight': 'bold'
                                    };

                                    style = JSON.stringify(style);
                                    style = style.replace(/","/g, ';').replace(/["{}]/g, '');

                                    temp += "<th style=\"" + style + "\">" + upd + "</th>";
                                });

                                output = temp + output;
                            }

                            row += output + "</tr>";
                            return row;
                        }

                        mapper.entries().forEach(function(entry, index) {
                            thead += createHeaders(entry.value, entry.key, index);
                        });

                        thead += "</thead>";

                        var temp = mapper.values();

                        var getGeneratedRecord = function(content, parent, depth, datum) {
                            if(typeof(temp[depth]) == 'object') {
                                temp[depth].forEach(function(item) {
                                    parent.push(item);
                                    content = getGeneratedRecord(content, parent, depth + 1, datum);
                                });
                            } else {
                                var style = {
                                    'text-align': me.helper.getTextAlignment(parent[0]),
                                    'background-color': me.helper.getCellColor(parent[0]),
                                    'font-style': me.helper.getFontStyle(parent[0]),
                                    'font-weight': me.helper.getFontWeight(parent[0]),
                                    'font-size': me.helper.getFontSize(parent[0]),
                                    'color': me.helper.getTextColor(parent[0])
                                };

                                style = JSON.stringify(style);
                                style = style.replace(/","/g, ';').replace(/["{}]/g, '');

                                content += "<td style=\"" + style + "\">" + ((datum[parent.join('_')] !== undefined) ? me.helper.getValueNumberFormat(parent[0])(datum[parent.join('_')]) : "-") + "</td>";
                            }

                            parent.pop();
                            return content;
                        }

                        var createEntries = function(datum) {
                            var content = "";

                            unpivotedDimension.forEach(function(upd) {
                                var style = {
                                    'text-align': me.helper.getTextAlignment(upd, true),
                                    'background-color': me.helper.getCellColor(upd, true),
                                    'font-style': me.helper.getFontStyle(upd, true),
                                    'font-weight': me.helper.getFontWeight(upd, true),
                                    'font-size': me.helper.getFontSize(upd, true),
                                    'color': me.helper.getTextColor(upd, true)
                                };

                                style = JSON.stringify(style);
                                style = style.replace(/","/g, ';').replace(/["{}]/g, '');

                                content += "<td style=\"" + style + "\">" + datum[upd] + "</td>";
                            });

                            me.helper.measures.forEach(function(m) {
                                content = getGeneratedRecord(content, [m], 0, datum);
                            });

                            return content;
                        }

                        pivotedData.forEach(function(pd) {
                            tbody += "<tr>" + createEntries(pd) + "</tr>";
                        });

                        tbody += "</tbody></table>";

                        table.append((thead + tbody));

                        $('#pivottable-' + this.id).append(table);

                        $('#pivottable-' + this.id).find('#viz_pivot-table').dataTable({
                            scrollY:height-50,
                            scrollX: true,
                            scrollCollapse: true,
                            ordering: true,
                            info: true,
                            searching: false,
                            'sDom': 't'
                        });
                    }

                    return PivotTable;

                })();

                var pivotTable = new PivotTable(element[0], record, getProperties(VisualizationUtils, record));
                pivotTable.renderChart();

                // data undefined case in pivot table
            }
        }
    }
})();
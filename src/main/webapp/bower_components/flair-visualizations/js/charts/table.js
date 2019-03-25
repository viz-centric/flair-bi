var COMMON = require('../extras/common.js')(),
    UTIL = require('../extras/util.js')(),
    LEGEND = require('../extras/legend.js')();

function table() {

    var _NAME = 'table';

    var _config = [],
        _dimension = [],
        _displayNameForDimension = [],
        _cellColorForDimension = [],
        _fontStyleForDimension = [],
        _fontWeightForDimension = [],
        _fontSizeForDimension = [],
        _textColorForDimension = [],
        _textColorExpressionForDimension = [],
        _textAlignmentForDimension = [],
        _measure = [],
        _displayNameForMeasure = [],
        _cellColorForMeasure = [],
        _cellColorExpressionForMeasure = [],
        _fontStyleForMeasure = [],
        _fontSizeForMeasure = [],
        _numberFormatForMeasure = [],
        _textColorForMeasure = [],
        _textAlignmentForMeasure = [],
        _textColorExpressionForMeasure = [],
        _iconNameForMeasure = [],
        _iconPositionForMeasure = [],
        _iconExpressionForMeasure = [],
        _iconFontWeight = [],
        _iconColor = [],
        _fontWeightForMeasure = [];

    var _localData, filterData = [];

    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.measure(config.measure);
        this.displayNameForDimension(config.displayNameForDimension);
        this.cellColorForDimension(config.cellColorForDimension);
        this.fontStyleForDimension(config.fontStyleForDimension);
        this.fontWeightForDimension(config.fontWeightForDimension);
        this.fontSizeForDimension(config.fontSizeForDimension);
        this.textColorForDimension(config.textColorForDimension);
        this.textColorExpressionForDimension(config.textColorExpressionForDimension);
        this.textAlignmentForDimension(config.textAlignmentForDimension);
        this.displayNameForMeasure(config.displayNameForMeasure);
        this.cellColorForMeasure(config.cellColorForMeasure);
        this.cellColorExpressionForMeasure(config.cellColorExpressionForMeasure);
        this.fontStyleForMeasure(config.fontStyleForMeasure);
        this.fontSizeForMeasure(config.fontSizeForMeasure);
        this.numberFormatForMeasure(config.numberFormatForMeasure);
        this.textColorForMeasure(config.textColorForMeasure);
        this.textAlignmentForMeasure(config.textAlignmentForMeasure);
        this.textColorExpressionForMeasure(config.textColorExpressionForMeasure);
        this.iconNameForMeasure(config.iconNameForMeasure);
        this.iconPositionForMeasure(config.iconPositionForMeasure);
        this.iconExpressionForMeasure(config.iconExpressionForMeasure);
        this.fontWeightForMeasure(config.fontWeightForMeasure);

        this.iconFontWeight(config.iconFontWeight);
        this.iconColor(config.iconColor);
    }

    var _baseAccessor = function (value, measure) {
        var me = this;

        if (!arguments.length) {
            /**
             * Getter method call with no arguments
             * E.g. <chart>.<accessor_function>() ==> [<item1>, <item2>]
             */
            return me;
        }

        if (value instanceof Array && measure == void 0) {
            /**
             * Setter method call with only value argument
             * E.g. <chart>.<accessor_function>([<item1>, <item2>]) ==> <chart_function>
             */
            me.splice(0, me.length);
            me.push.apply(me, value);
            return chart;
        }

        var index = _measure.indexOf(measure);

        if (index === -1) {
            throw new Error('Invalid measure provided');
        }

        if (value == void 0) {
            /**
             * Getter method call with only measure argument
             * E.g. <chart>.<accessor_function>(<measure>) ==> <item>
             */
            return me[index];
        } else {
            /**
             * Setter method call with both value and measure arguments
             * E.g. <chart>.<accessor_function>(<item>, <measure>) ==> <chart_function>
             */
            me[index] = value;
        }

        return chart;
    }

    var getIcon = function (index, endValue) {
        var iconOutput = "";

        var iconStyle = {
            'font-weight': _iconFontWeight[index] || COMMON.DEFAULT_FONTWEIGHT,
            'color': _iconColor[index] || COMMON.DEFAULT_COLOR,
            'font-size': _fontSizeForMeasure[index] || COMMON.DEFAULT_FONTSIZE,
            'text-align': getIconPosition(index)
        };

        if (_iconExpressionForMeasure[index].length) {
            _iconNameForMeasure[index] = UTIL.expressionEvaluator(_iconExpressionForMeasure[index], endValue, 'icon');
            iconStyle['color'] = UTIL.expressionEvaluator(_iconExpressionForMeasure[index], endValue, 'color');
        }

        iconStyle = JSON.stringify(iconStyle);
        iconStyle = iconStyle.replace(/["{}]/g, '').replace(/,/g, ';');

        iconOutput += "<i  class=\"" + _iconNameForMeasure[index] + "\" style=\"" + iconStyle + "\" aria-hidden=\"true\"></i>";



        if (getIconName(index) !== "") {
            return iconOutput;
        }
        return "";
    }
    var getIconPosition = function (index) {
        return _iconPositionForMeasure[index];
    }
    var getIconName = function (index) {
        return _iconNameForMeasure[index];
    }
    var applyFilter = function () {
        return function () {
            var d = _localData.filter(function (val) {
                for (var index = 0; index < filterData.length; index++) {
                    if (val[filterData[index].key] == filterData[index].value) {
                        return val;
                    }
                }

            });
            d3.select('#donut')
                .datum(d)
                .call(chart);

            _local_svg.html('')

            chart(_local_svg)
        }
    }
    var clearFilter = function () {
        return function () {
            d3.select('#donut')
                .datum(_localData)
                .call(chart);

            _local_svg.html('')

            chart(_local_svg)
        }
    }
    chart.readerTableChart = function (str, ctr, _local_svg, key) {
        var confirm = d3.select('.confirm')
            .style('visibility', 'visible');
        var searchObj = filterData.find(o => o[key] === str);
        if (searchObj == undefined) {
            var obj = Object();
            obj.key = key;
            obj.value = str;
            filterData.push(obj);
        }
        $(ctr).toggleClass('selected')

    }
    function chart(selection) {
        _local_svg = selection;

        selection.each(function (data) {
            _localData = data
            var margin = {
                top: 0,
                right: 0,
                bottom: 0,
                left: 45
            };

            var div = d3.select(this);

            var width = +div.attr('width');
            var height = +div.attr('height');
            var disv = d3.select("#donut");
            $('#donut').css('width', width)
                .css('height', height).css('overflow-y', 'hidden').css('overflow-x', 'auto');

            var table = $('<table id="viz_table" class="display nowrap" style="width:100%"></table>').addClass('table table-condensed table-hover');

            var thead = "<thead><tr>",
                tbody = "<tbody>";

            _dimension.forEach(function (item, index) {
                var title = _displayNameForDimension[index],
                    style = {
                        'text-align': _textAlignmentForDimension[index],
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

            _measure.forEach(function (item, index) {
                var title = _displayNameForMeasure[index],
                    style = {
                        'text-align': _textAlignmentForMeasure[index],
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
                _dimension.forEach(function (item, index) {

                    var style = {
                        'text-align': _textAlignmentForDimension[index],
                        'background-color': _cellColorForDimension[index],
                        'font-style': _fontStyleForDimension[index],
                        'font-weight': _fontWeightForDimension[index],
                        'font-size': _fontSizeForDimension[index],
                        'color': _textColorForDimension[index]
                    };
                    style['color'] = UTIL.expressionEvaluator(_textColorExpressionForDimension[index], d[_dimension[index]], 'color');

                    style = JSON.stringify(style);
                    style = style.replace(/","/g, ';').replace(/["{}]/g, '');
                    tbody += "<td onClick=\"chart.readerTableChart('" + d[_dimension[index]] + "',this,_local_svg,'" + item + "')\" style=\"" + style + "\">" + d[_dimension[index]] + "</td>";
                });

                _measure.forEach(function (item, index) {
                    var style = {
                        'text-align': _textAlignmentForMeasure[index],
                        'background-color': _cellColorForMeasure[index],
                        'font-style': _fontStyleForMeasure[index],
                        'font-weight': _fontWeightForMeasure[index],
                        'font-size': _fontSizeForMeasure[index],
                        'color': _textColorForMeasure[index]
                    };
                    style['color'] = UTIL.expressionEvaluator(_textColorExpressionForMeasure[index], d[_measure[index]], 'color');
                    style['background-color'] = UTIL.expressionEvaluator(_cellColorExpressionForMeasure[index], d[_measure[index]], 'color');
                    style = JSON.stringify(style);
                    style = style.replace(/","/g, ';').replace(/["{}]/g, '');
                    tbody += "<td onClick=\"chart.readerTableChart('" + d[_measure[index]] + "',this,_local_svg,'" + item + "')\" style=\"" + style + "\">" + getIcon(index, d[_measure[index]]) + UTIL.getFormattedValue(d[_measure[index]], UTIL.getValueNumberFormat(index, _numberFormatForMeasure)) + "</td>";
                });
                tbody += "</tr>";
            });

            tbody += "</tbody>";
            table.append(tbody);

            $('#donut').append(table);

            $('#donut').find('#viz_table').dataTable({
                scrollY: height - 150,
                scrollX: true,
                scrollCollapse: true,
                ordering: true,
                info: true,

                pagingType: "full_numbers",
                aLengthMenu: [[2, 5, 10, 15, 20, 25, -1], [2, 5, 10, 15, 20, 25, "All"]],
                iDisplayLength: 20,
                bDestroy: true,
                dom: '<"table-header">rt<"table-footer"lp>',
                fnDrawCallback: function (oSettings) {
                    if (oSettings._iDisplayLength > oSettings.fnRecordsDisplay()) {
                        $(oSettings.nTableWrapper).find('.dataTables_paginate').hide();
                        $(oSettings.nTableWrapper).find('.dataTables_info').hide();
                    }
                }
            });

            d3.select('.btn-primary')
                .on('click', applyFilter());

            d3.select('.btn-default')
                .on('click', clearFilter());
        }

        );
    }
    /**
     * Builds the html data for the tooltip
     *
     * @param {object} datum Datum forming the arc
     * @param {function} chart Pie chart function
     * @return {string} String encoded HTML data
     */
    chart._legendInteraction = function (event, data) {
        var arcGroup = d3.selectAll('g.arc')
            .filter(function (d) {
                return d.data[_dimension[0]] === data[_dimension[0]];
            });

        if (event === 'mouseover') {
            arcGroup.select('path')
                .style('fill', COMMON.HIGHLIGHTER);
        } else if (event === 'mousemove') {
            // do something
        } else if (event === 'mouseout') {
            arcGroup.select('path')
                .style('fill', function (d, i) {
                    return COMMON.COLORSCALE(d.data[_dimension[0]]);
                });
        } else if (event === 'click') {

        }
    }

    chart._getName = function () {
        return _NAME;
    }

    chart.config = function (value) {
        if (!arguments.length) {
            return _config;
        }
        _config = value;
        _setConfigParams.call(chart, _config);
        return chart;
    }

    chart.dimension = function (value) {
        if (!arguments.length) {
            return _dimension;
        }
        _dimension = value;
        return chart;
    }

    chart.measure = function (value) {
        if (!arguments.length) {
            return _measure;
        }
        _measure = value;
        return chart;
    }

    chart.displayNameForDimension = function (value, measure) {
        return _baseAccessor.call(_displayNameForDimension, value, measure);
    }

    chart.cellColorForDimension = function (value, measure) {
        return _baseAccessor.call(_cellColorForDimension, value, measure);;
    }

    chart.fontStyleForDimension = function (value, measure) {
        return _baseAccessor.call(_fontStyleForDimension, value, measure);
    }

    chart.fontWeightForDimension = function (value, measure) {
        return _baseAccessor.call(_fontWeightForDimension, value, measure);
    }

    chart.fontSizeForDimension = function (value, measure) {
        return _baseAccessor.call(_fontSizeForDimension, value, measure);
    }

    chart.textColorForDimension = function (value, measure) {
        return _baseAccessor.call(_textColorForDimension, value, measure);
    }

    chart.textColorExpressionForDimension = function (value, measure) {
        if (!arguments.length) {
            return _textColorExpressionForDimension;
        }

        if (value instanceof Array && measure == void 0) {
            _textColorExpressionForDimension = value.map(function (v) {
                return UTIL.getExpressionConfig(v, ['color']);
            });
            return chart;
        }

        var index = _measure.indexOf(measure);

        if (index === -1) {
            throw new Error('Invalid measure provided');
        }

        if (value == void 0) {
            return _textColorExpressionForDimension[index];
        } else {
            _textColorExpressionForDimension[index] = UTIL.getExpressionConfig(value, ['color']);
        }
    }

    chart.textAlignmentForDimension = function (value, measure) {
        return _baseAccessor.call(_textAlignmentForDimension, value, measure);
    }

    chart.displayNameForMeasure = function (value, measure) {
        return _baseAccessor.call(_displayNameForMeasure, value, measure);
    }

    chart.cellColorForMeasure = function (value, measure) {
        return _baseAccessor.call(_cellColorForMeasure, value, measure);
    }

    chart.cellColorExpressionForMeasure = function (value, measure) {
        if (!arguments.length) {
            return _cellColorExpressionForMeasure;
        }

        if (value instanceof Array && measure == void 0) {
            _cellColorExpressionForMeasure = value.map(function (v) {
                return UTIL.getExpressionConfig(v, ['color']);
            });
            return chart;
        }

        var index = _measure.indexOf(measure);

        if (index === -1) {
            throw new Error('Invalid measure provided');
        }

        if (value == void 0) {
            return _cellColorExpressionForMeasure[index];
        } else {
            _cellColorExpressionForMeasure[index] = UTIL.getExpressionConfig(value, ['color']);
        }
    }

    chart.fontStyleForMeasure = function (value, measure) {
        return _baseAccessor.call(_fontStyleForMeasure, value, measure);
    }

    chart.fontSizeForMeasure = function (value, measure) {
        return _baseAccessor.call(_fontSizeForMeasure, value, measure);
    }

    chart.numberFormatForMeasure = function (value, measure) {
        return _baseAccessor.call(_numberFormatForMeasure, value, measure);
    }

    chart.textColorForMeasure = function (value, measure) {
        return _baseAccessor.call(_textColorForMeasure, value, measure);
    }

    chart.textAlignmentForMeasure = function (value, measure) {
        return _baseAccessor.call(_textAlignmentForMeasure, value, measure);
    }

    chart.textColorExpressionForMeasure = function (value, measure) {
        if (!arguments.length) {
            return _textColorExpressionForMeasure;
        }

        if (value instanceof Array && measure == void 0) {
            _textColorExpressionForMeasure = value.map(function (v) {
                return UTIL.getExpressionConfig(v, ['color']);
            });
            return chart;
        }

        var index = _measure.indexOf(measure);

        if (index === -1) {
            throw new Error('Invalid measure provided');
        }

        if (value == void 0) {
            return _textColorExpressionForMeasure[index];
        } else {
            _textColorExpressionForMeasure[index] = UTIL.getExpressionConfig(value, ['color']);
        }
    }

    chart.iconNameForMeasure = function (value, measure) {
        return _baseAccessor.call(_iconNameForMeasure, value, measure);
    }

    chart.iconPositionForMeasure = function (value, measure) {
        return _baseAccessor.call(_iconPositionForMeasure, value, measure);
    }

    chart.iconExpressionForMeasure = function (value, measure) {
        if (!arguments.length) {
            /**
             * Getter method call with no arguments
             * E.g. <chart>.kpiIconExpression() ==> [<item1>, <item2>]
             */
            return _iconExpressionForMeasure;
        }

        if (value instanceof Array && measure == void 0) {
            /**
             * Setter method call with only value argument
             * E.g. <chart>.kpiIconExpression([<item1>, <item2>]) ==> <chart_function>
             */
            _iconExpressionForMeasure = value.map(function (v) {
                return UTIL.getExpressionConfig(v, ['icon', 'color']);
            });
            return chart;
        }

        var index = _measure.indexOf(measure);

        if (index === -1) {
            throw new Error('Invalid measure provided');
        }

        if (value == void 0) {
            /**
             * Getter method call with only measure argument
             * E.g. <chart>.kpiIconExpression(<measure>) ==> <item>
             */
            return _iconExpressionForMeasure[index];
        } else {
            /**
             * Setter method call with both value and measure arguments
             * E.g. <chart>.kpiIconExpression(<item>, <measure>) ==> <chart_function>
             */
            _iconExpressionForMeasure[index] = UTIL.getExpressionConfig(value, ['icon', 'color']);
        }

        return chart;
    }

    chart.fontWeightForMeasure = function (value, measure) {
        return _baseAccessor.call(_fontWeightForMeasure, value, measure);
    }

    chart.iconFontWeight = function (value, measure) {
        return _baseAccessor.call(_iconFontWeight, value, measure);
    }


    chart.iconColor = function (value, measure) {
        return _baseAccessor.call(_iconColor, value, measure);
    }
    return chart;
}

module.exports = table;

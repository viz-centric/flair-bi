var COMMON = require('../extras/common.js')(),
    UTIL = require('../extras/util.js')(),
    LEGEND = require('../extras/legend.js')();

function combo() {

    /* These are the constant global variable for the function combo.
     */
    var _NAME = 'combo';

    /* These are the private variables that is initialized by the arguments sent
     * by the users and can be updated using public methods.
     */

    var _config,
        _dimension,
        _measure,
        _xAxis,
        _yAxis,
        _xAxisColor,
        _yAxisColor,
        _displayName,
        _legendData,
        _comboChartType,
        _showValues,
        _displayNameForMeasure,
        _fontStyle,
        _fontWeight,
        _numberFormat,
        _textColor,
        _displayColor,
        _borderColor,
        _fontSize,
        _lineType,
        _pointType;

    var x0, x1, y;

    var _local_svg, _Local_data, _originalData, _localLabelStack = [], legendBreakCount = 1;

    var parentWidth, parentHeight, plotWidth, plotHeight;

    var legendSpace = 20, axisLabelSpace = 20, offsetX = 16, offsetY = 3, div;

    var filter = false, filterData = [];

    var measuresBar = [], measuresLine = [];
    var margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 45
    };
    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.measure(config.measure);
        this.xAxis(config.xAxis);
        this.yAxis(config.yAxis);
        this.xAxisColor(config.xAxisColor);
        this.yAxisColor(config.yAxisColor);
        this.xAxisLabel(config.xAxisLabel);
        this.yAxisLabel(config.yAxisLabel);
        this.legend(config.legend);
        this.legendPosition(config.legendPosition);
        this.grid(config.grid);
        this.dimensionDisplayName(config.dimensionDisplayName);
        this.measureShowValue(config.measureShowValue);
        this.measureDisplayName(config.measureDisplayName);
        this.measureFontStyle(config.measureFontStyle);
        this.measureFontWeight(config.measureFontWeight);
        this.measureFontSize(config.measureFontSize);
        this.measureNumberFormat(config.measureNumberFormat);
        this.measureTextColor(config.measureTextColor);
        this.measureDisplayColor(config.measureDisplayColor);
        this.measureBorderColor(config.measureBorderColor);
        this.measureChartType(config.measureChartType);
        this.measurePointType(config.measurePointType);
        this.tooltip(config.tooltip);
    }

    var _setAxisColor = function(axis, color) {
        var path = axis.select('path'),
            ticks = axis.selectAll('.tick');

        path.style('stroke', color);

        ticks.select('line')
            .style('stroke', color);

        ticks.select('text')
            .style('fill', color);
    }

    /* Builds the html data for the tooltip
     *
     * @param {object} datum Datum forming the bar
     * @param {function} chart Clustered Vertical Bar chart function
     * @return {string} String encoded HTML data
     */
    var _buildTooltipData = function(datum, chart) {
        var output = "";

        output += "<table><tr>"
            + "<th>" + (_dimensionDisplayName || _dimension[0]) + ": </th>"
            + "<td>" + datum[_dimension[0]] + "</td>"
            + "</tr><tr>"
            + "<th>" + (_measureDisplayName[_measure.indexOf(datum['measure'])] || datum['measure']) + ": </th>"
            + "<td>" + datum[datum['measure']] + "</td>"
            + "</tr></table>";

        return output;
    }

    var _handleMouseOverFn = function(tooltip, container) {
        var me = this;

        return function(d, i) {
            d3.select(this).style('cursor', 'pointer');

            var barGroup = container.selectAll('g.bar')
                .filter(function(d1) {
                    return (d1[_dimension[0]] === d[_dimension[0]]) && (d1['measure'] === d['measure']);
                });

            barGroup.select('rect:not(.bar-rect-mask)')
                .style('fill', COMMON.HIGHLIGHTER)
                .style('stroke', COMMON.HIGHLIGHTER);

            barGroup.select('rect.bar-rect-mask')
                .attr('visibility', 'visible');

            if(tooltip) {
                UTIL.showTooltip(tooltip);
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me), container);
            }
        }
    }

    var _handleMouseMoveFn = function(tooltip, container) {
        var me = this;

        return function(d, i) {
            if(tooltip) {
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me), container);
            }
        }
    }

    var _handleMouseOutFn = function(tooltip, container) {
        var me = this;

        return function(d, i) {
            d3.select(this).style('cursor', 'default');

            var barGroup = container.selectAll('g.bar')
                .filter(function(d1) {
                    return (d1[_dimension[0]] === d[_dimension[0]]) && (d1['measure'] === d['measure']);
                });

            barGroup.select('rect:not(.bar-rect-mask)')
                .style('fill', function(d1, i1) {
                    if(typeof _measureDisplayColor[i1] == 'undefined' || _measureDisplayColor[i1].trim() == '') {
                        return COMMON.COLORSCALE(d1['measure']);
                    }
                    return _measureDisplayColor[i1];
                })
                .style('stroke', function(d1, i1) {
                    if(typeof _measureBorderColor[i1] == 'undefined' || _measureBorderColor[i1].trim() == '') {
                        return COMMON.COLORSCALE(d1['measure']);
                    }
                    return _measureBorderColor[i1];
                });

            barGroup.select('rect.bar-rect-mask')
                .attr('visibility', 'hidden');

            if(tooltip) {
                UTIL.hideTooltip(tooltip);
            }
        }
    }

    var _legendMouseOver = function(data) {
        d3.selectAll('g.arc')
            .filter(function(d) {
                return d.data[_dimension[0]] === data[_dimension[0]];
            })
            .select('path')
            .style('fill', COMMON.HIGHLIGHTER);

        d3.selectAll('g.arc-mask')
            .filter(function(d) {
                return d.data[_dimension[0]] === data[_dimension[0]];
            })
            .select('path')
            .style('visibility', 'visible');
    }

    var _legendMouseMove = function(data) {

    }

    var _legendMouseOut = function(data) {
        d3.selectAll('g.arc')
            .filter(function(d) {
                return d.data[_dimension[0]] === data[_dimension[0]];
            })
            .select('path')
            .style('fill', function(d, i) {
                return COMMON.COLORSCALE(d.data[_dimension[0]]);
            });

        d3.selectAll('g.arc-mask')
            .filter(function(d) {
                return d.data[_dimension[0]] === data[_dimension[0]];
            })
            .select('path')
            .style('visibility', 'hidden');
    }

    var _legendClick = function(data) {
        if(_localLabelStack.indexOf(data[_dimension[0]]) < 0) {
            _localLabelStack.push(data[_dimension[0]]);
        } else {
            _localLabelStack.splice(_localLabelStack.indexOf(data[_dimension[0]]), 1);
        }

        chart.update(_localData);
    }

    var _drawLinePlot = function(plotHeight) {
        var me = this;

        var clusterGroup = this.append('g')
            .attr('id', 'cluster-group-line')
            .selectAll('.cluster')
            .data(_localMeasureAreaChart)
            .enter().append('g')
                .classed('cluster', true);

        var lineGroup = clusterGroup.append('g')
            .attr('id', function(d, i) {
                return 'line-group-' + i;
            })
            .classed('line', true);

        lineGroup.append('path')
            .classed('line-path', true)
            .datum(function(m, i) {
                var clone = jQuery.extend(true, [], _localData); // deep copy

                return clone.map(function(d) {
                    d['measure'] = m;
                    return d;
                });
            })
            .style('fill', 'none')
            .style('stroke', function(d, i) {
                var index = _measure.indexOf(d[0]['measure']);

                if(typeof _measureBorderColor[index] == 'undefined' || _measureBorderColor[index].trim() == '') {
                    return COMMON.COLORSCALE(_measure[index]);
                }

                return _measureBorderColor[index];
            })
            .style('stroke-linejoin', 'round')
            .style('stroke-linecap', 'round')
            .style('stroke-width', 3)
            .attr('d', _line)
            .transition()
            .duration(COMMON.DURATION)
            .attrTween('stroke-dasharray', function() {
                var l = this.getTotalLength(),
                    interpolator = d3.interpolateString('0,' + l, l + ',' + l);

                return function(t) {
                    return interpolator(t);
                }
            });

        lineGroup.append('path')
            .classed('area-path', true)
            .datum(function(m, i) {
                var clone = jQuery.extend(true, [], _localData); // deep copy

                return clone.map(function(d) {
                    d['measure'] = m;
                    return d;
                });
            })
            .style('fill', function(d, i) {
                var index = _measure.indexOf(d[0]['measure']);

                if(typeof _measureDisplayColor[index] == 'undefined' || _measureDisplayColor[index].trim() == '') {
                    return COMMON.COLORSCALE(_measure[index]);
                }

                return _measureDisplayColor[index];
            })
            .style('stroke-width', 0)
            .style('fill-opacity', 0.3)
            .style('opacity', 0)
            .attr('d', _area)
            .transition()
            .duration(COMMON.DURATION)
            .styleTween('opacity', function() {
                var interpolator = d3.interpolateNumber(0, 1);

                return function(t) {
                    return interpolator(t);
                }
            });

        lineGroup.selectAll('.line-point')
            .data(function(m, i) {
                var clone = jQuery.extend(true, [], _localData); // deep copy

                return clone.map(function(d) {
                    d['measure'] = m;
                    return d;
                });
            })
            .enter().append('path')
                .classed('line-point', true)
                .style('fill', function(d, i) {
                    var index = _measure.indexOf(d['measure']);

                    if(typeof _measureDisplayColor[index] == 'undefined' || _measureDisplayColor[index].trim() == '') {
                        return COMMON.COLORSCALE(_measure[index]);
                    }
                    return _measureDisplayColor[index];
                })
                .attr('d', function(d, i) {
                    var index = _measure.indexOf(d['measure']);
                    return d3.symbol()
                        .type(UTIL.getSymbolForPointType(_measurePointType[index]))
                        .size(40)();
                })
                .attr('transform', function(d) {
                    return 'translate(' + _x(d[_dimension[0]]) + ',' + _y(d[d['measure']]) + ')';
                })
                .on('mouseover', _handleMouseOverFn.call(chart, _localTooltip, _localSVG))
                .on('mousemove', _handleMouseMoveFn.call(chart, _localTooltip, _localSVG))
                .on('mouseout', _handleMouseOutFn.call(chart, _localTooltip, _localSVG))
                .on('click', function(d, i) {

                });

        var text = lineGroup.selectAll('.line-text')
            .data(function(m, i) {
                var clone = jQuery.extend(true, [], _localData); // deep copy

                return clone.map(function(d) {
                    d['measure'] = m;
                    return d;
                });
            })
            .enter().append('text')
            .classed('line-text', true)
            .attr('x', function(d, i) {
                return _x(d[_dimension[0]]);
            })
            .attr('y', function(d, i) {
                return plotHeight;
            })
            .attr('dy', function(d, i) {
                return -COMMON.OFFSET;
            })
            .attr('opacity', 0)
            .attr('visibility', function(d, i) {
                var index = _measure.indexOf(d['measure']);

                return _measureShowValue[index] ? "visible" : "hidden";
            })
            .style('font-style', function(d, i) {
                var index = _measure.indexOf(d['measure']);

                return _measureFontStyle[index] || COMMON.DEFAULT_FONTSTYLE;
            })
            .style('font-weight', function(d, i) {
                var index = _measure.indexOf(d['measure']);

                return _measureFontWeight[index] || COMMON.DEFAULT_FONTWEIGHT;
            })
            .style('font-size', function(d, i) {
                var index = _measure.indexOf(d['measure']);

                return _measureFontSize[index] || COMMON.DEFAULT_FONTSIZE;
            })
            .style('fill', function(d, i) {
                var index = _measure.indexOf(d['measure']);

                if(typeof _measureTextColor[index] == 'undefined' || _measureTextColor[index].trim() == '') {
                    return COMMON.DEFAULT_COLOR;
                }
                return _measureTextColor[index];
            })
            .style('text-anchor', 'middle');

        text.transition()
            .duration(COMMON.DURATION)
            .attr('opacity', 1)
            .attr('y', function(d, i) {
                return _y(d[d['measure']]);
            })
            .text(function(d, i) {
                var index = _measure.indexOf(d['measure']);

                var formatter = UTIL.getNumberFormatterFn(_measureNumberFormat[index]),
                    value = d[d['measure']],
                    lt = _localTotal.filter(function(lt) {
                        return lt['measure'] == d['measure'];
                    })[0],
                    positiveTotal = lt['positiveTotal'],
                    negativeTotal = lt['negativeTotal'];

                if(_measureNumberFormat[index] == 'percent') {
                    value = (value >= 0) ? (value / positiveTotal) : (value / negativeTotal);
                }

                return formatter(UTIL.roundNumber(value, 2)).toUpperCase();
            });
    }

    var _drawBarPlot = function(plotHeight) {
        var me = this;

        selection.each(function (data) {
            _Local_data = _originalData = data;
            div = d3.select(this).node().parentNode;

            var _local_svg = d3.select(this),
                width = div.clientWidth,
                height = div.clientHeight;

            });

            _local_svg.attr('width', width)
                .attr('height', height)

        var rectMask = barGroup.append('rect')
            .classed('bar-rect-mask', true)
            .attr('width', _xMeasure.bandwidth())
            .attr('height', 1)
            .attr('x', function(d, i) {
                return _xMeasure(d['measure']);
            })
            .attr('y', function(d, i) {
                return plotHeight;
            })
            .attr('visibility', 'hidden')
            .style('fill', function(d, i) {
                if(typeof _measureDisplayColor[i] == 'undefined' || _measureDisplayColor[i].trim() == '') {
                    return COMMON.COLORSCALE(d['measure']);
                }
                return _measureDisplayColor[i];
            })
            .style('stroke', function(d, i) {
                if(typeof _measureBorderColor[i] == 'undefined' || _measureBorderColor[i].trim() == '') {
                    return COMMON.COLORSCALE(d['measure']);
                }
                return _measureBorderColor[i];
            })
            .style('stroke-width', 1);

        rectMask.transition()
            .duration(COMMON.DURATION)
            .attr('y', function(d, i) {
                return _y(d[d['measure']]) - (COMMON.OFFSET / 3);
            });

        var text = barGroup.append('text')
            .attr('x', function(d, i) {
                return _xMeasure(d['measure']) + (_xMeasure.bandwidth() / 2);
            })
            .attr('y', function(d, i) {
                return plotHeight;
            })
            .attr('dy', function(d, i) {
                return COMMON.OFFSET;
            })
            .attr('opacity', 0)
            .attr('visibility', function(d, i) {
                return _measureShowValue[i] ? "visible" : "hidden";
            })
            .style('font-style', function(d, i) {
                return _measureFontStyle[i] || COMMON.DEFAULT_FONTSTYLE;
            })
            .style('font-weight', function(d, i) {
                return _measureFontWeight[i] || COMMON.DEFAULT_FONTWEIGHT;
            })
            .style('font-size', function(d, i) {
                return _measureFontSize[i] || COMMON.DEFAULT_FONTSIZE;
            })
            .style('fill', function(d, i) {
                if(typeof _measureTextColor[i] == 'undefined' || _measureTextColor[i].trim() == '') {
                    return COMMON.DEFAULT_COLOR;
                }
                return _measureTextColor[i];
            })
            .style('text-anchor', 'middle');

            $(document).on('click', '_local_svg', function (e) {
                if ($("#myonoffswitch").prop('checked') == false) {
                    var element = e.target
                    if (element.tagName == "_local_svg") {
                        $('#Modal_' + $(div).attr('id') + ' .measure').val('')
                        $('#Modal_' + $(div).attr('id') + ' .threshold').val('')
                        $('#Modal_' + $(div).attr('id') + ' .measure').attr('disabled', false)
                        $('#Modal_' + $(div).attr('id')).modal('toggle');
                    }
                }

                return formatter(UTIL.roundNumber(value, 2)).toUpperCase();
            });
    }

    function chart(selection) {
        _localSVG = selection;

        selection.each(function(data) {
            var svg = d3.select(this),
                width = +svg.attr('width'),
                height = +svg.attr('height'),
                parentWidth = width - 2 * COMMON.PADDING,
                parentHeight = height - 2 * COMMON.PADDING;

            /* store the data in local variable */
            _localData = data;

            /* total sum of the measure values */
            _localTotal = _measure.map(function(m) {
                return {
                    measure: m,
                    positiveTotal: d3.sum(data.map(function(d) { return (d[m] >= 0) ? d[m] : 0; })),
                    negativeTotal: d3.sum(data.map(function(d) { return (d[m] < 0) ? Math.abs(d[m]) : 0; }))
                }
            });

            container = _local_svg.append('g')
                .attr('transform', 'translate(' + COMMON.PADDING + ', ' + COMMON.PADDING + ')');

            var legendWidth = 0,
                legendHeight = 0,
                plotWidth = parentWidth - (_yAxis ? COMMON.AXIS_THICKNESS : 0),
                plotHeight = parentHeight - (_xAxis ? (COMMON.AXIS_THICKNESS / 1.5) : 0);

            if(_legend) {
                _localLegend = LEGEND.bind(chart);

                var result = _localLegend(_measure, container, {
                    width: parentWidth,
                    height: parentHeight
                });

                legendWidth = result.legendWidth;
                legendHeight = result.legendHeight;

                switch(_legendPosition) {
                    case 'top':
                    case 'bottom':
                        plotHeight = plotHeight - legendHeight - (_xAxis ? (COMMON.AXIS_THICKNESS / 1.5) : 0);
                        break;
                    case 'right':
                        plotWidth = plotWidth - legendWidth - (COMMON.AXIS_THICKNESS / 2)
                        break;
                    case 'left':
                        plotWidth = plotWidth - legendWidth;
                        break;
                }
            }

            drawPlot.call(this, data)
        });
    }
    var drawViz = function (element) {
        var me = this;

        element.append('rect')
            .attr('width', x1.bandwidth())
            .style('fill', function (d, i) {
                return UTIL.getDisplayColor(_measure.indexOf(d['tag']), _displayColor);
            })
            .style('stroke', function (d, i) {
                return UTIL.getBorderColor(_measure.indexOf(d['tag']), _borderColor);
            })
            .style('stroke-width', 1)
            .attr('x', function (d, i) {
                return x1(measuresBar[i]);
            })
            .attr('y', function (d, i) {
                if ((d['data'][measuresBar[i]] === null) || (isNaN(d['data'][measuresBar[i]]))) {
                    return 0;
                } else if (d['data'][measuresBar[i]] > 0) {
                    return y(d['data'][measuresBar[i]]);
                }

                return y(0);
            })
            .attr('height', function (d, i) {
                if ((d['data'][measuresBar[i]] === null) || (isNaN(d['data'][measuresBar[i]]))) return 0;
                return Math.abs(y(0) - y(d['data'][measuresBar[i]]));
            })
            .on('mouseover', _handleMouseOverFn.call(chart, tooltip, _local_svg))
            .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, _local_svg))
            .on('mouseout', _handleMouseOutFn.call(chart, tooltip, _local_svg))
            .on('click', function (d) {
                if ($("#myonoffswitch").prop('checked') == false) {
                    $('#Modal_' + $(div).attr('id') + ' .measure').val(d.measure);
                    $('#Modal_' + $(div).attr('id') + ' .threshold').val('');
                    $('#Modal_' + $(div).attr('id') + ' .measure').attr('disabled', true);;
                    $('#Modal_' + $(div).attr('id')).modal('toggle');
                }
                else {
                    var confirm = d3.select('.confirm')
                        .style('visibility', 'visible');
                    var _filter = chart._Local_data.filter(function (d1) {
                        return d.data[_dimension[0]] === d1[_dimension[0]]
                    })
                    var rect = d3.select(this);
                    if (rect.classed('selected')) {
                        rect.classed('selected', false);
                        filterData.map(function (val, i) {
                            if (val[_dimension[0]] == d[_dimension[0]]) {
                                filterData.splice(i, 1)
                            }
                        })
                    } else {
                        rect.classed('selected', true);
                        var isExist = filterData.filter(function (val) {
                            if (val[_dimension[0]] == d[_dimension[0]]) {
                                return val
                            }
                        })
                        if (isExist.length == 0) {
                            filterData.push(_filter[0]);
                        }
                    }
                }
            })
    }
    var drawPlot = function (data) {
        var me = this;
        _Local_data = data;
        var keys = UTIL.getMeasureList(data[0], _dimension);

        measuresBar = [],
            measuresLine = [];
        keys.forEach(function (m, i) {
            if (_comboChartType[_measure.indexOf(m)] == "bar") {
                measuresBar.push(m);
            } else {
                measuresLine.push(m);
            }
        });

        var xLabels = getXLabels(data);

        var plot = container.append('g')
            .attr('class', 'combo-plot')
            .classed('plot', true)
            .attr('transform', function () {
                if (_legendPosition == 'Top') {
                    return 'translate(' + margin.left + ', ' + parseInt(legendSpace * 2 + (20 * parseInt(legendBreakCount))) + ')';
                } else if (_legendPosition == 'Bottom') {
                    return 'translate(' + margin.left + ', 0)';
                } else if (_legendPosition == 'Left') {
                    return 'translate(' + (legendSpace + margin.left + axisLabelSpace) + ', 0)';
                } else if (_legendPosition == 'Right') {
                    return 'translate(' + margin.left + ', 0)';
                }
            });

        var content = plot.append('g')
            .attr('class', 'chart')

        var labelStack = [];

        x0 = d3.scaleBand()
            .domain(xLabels)
            .rangeRound([0, plotWidth])
            .padding([0.2]);

        x1 = d3.scaleBand()
            .domain(measuresBar)
            .rangeRound([0, x0.bandwidth()])
            .padding([0.2]);

        y = d3.scaleLinear()
            .range([plotHeight, 0]);

        y.domain([0, d3.max(data, function (d) {
            return d3.max(keys, function (key) {
                return parseInt(d[key]);
            });
        })]).nice();

        var tickLength = d3.scaleLinear()
            .domain([22, 34])
            .range([4, 6]);

        var areaGenerator = d3.area()
            .curve(d3.curveLinear)
            .x(function (d, i) {
                return x0(d['data'][_dimension[0]]) + x0.bandwidth() / 2;
            })
            .y0(plotHeight)
            .y1(function (d) {
                return y(d['data'][d['tag']]);
            });

        var lineGenerator = d3.line()
            .curve(d3.curveLinear)
            .x(function (d, i) {
                return x0(d['data'][_dimension[0]]) + x0.bandwidth() / 2;
            })
            .y(function (d, i) {
                return y(d['data'][d['tag']]);
            });

        var clusterBar = content.selectAll('.cluster_bar')
            .data(data)
            .enter().append('g')
            .attr('class', 'cluster_bar')
            .attr('transform', function (d) {
                return 'translate(' + x0(d[_dimension[0]]) + ', 0)';
            });

        var bar = clusterBar.selectAll('g.bar')
            .data(function (d) {
                return measuresBar
                    .filter(function (m) { return labelStack.indexOf(m) == -1; })
                    .map(function (m) { return { "tag": m, "data": d }; });
            })
            .enter().append('g')
            .attr('class', 'bar');

        drawViz(bar)

        var clusterLine = content.selectAll('.cluster_line')
            .data(measuresLine.filter(function (m) { return labelStack.indexOf(m) == -1; }))
            .enter().append('g')
            .attr('class', 'cluster_line');

        var area = clusterLine.append('path')
            .datum(function (d, i) {
                return data.map(function (datum) { return { "tag": d, "data": datum }; });
            })
            .attr('class', 'area')
            .attr('fill', function (d, i) {
                return UTIL.getDisplayColor(_measure.indexOf(d[0]['tag']), _displayColor);
            })
            .attr('visibility', function (d, i) {
                if (_lineType[(_measure.indexOf(d[0]['tag']))] == "area") {
                    return 'visible'
                }
                else {
                    return 'hidden';
                }

            })
            .style('fill-opacity', 0.5)
            .attr('stroke', 'none')
            .attr('d', areaGenerator);

        var line = clusterLine.append('path')
            .datum(function (d, i) {
                return data.map(function (datum) { return { "tag": d, "data": datum }; });
            })
            .attr('class', 'line')
            .attr('fill', 'none')
            .attr('stroke', function (d, i) {
                return UTIL.getBorderColor(_measure.indexOf(d[0]['tag']), _borderColor);
            })
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('stroke-width', 1)
            .on("mouseover", function (d) {
                d3.select(this)
                    .style("stroke-width", "2.5px")
                    .style("cursor", "pointer");
            })
            .on("mouseout", function (d) {
                d3.select(this)
                    .style("stroke-width", "1.5px")
                    .style("cursor", "none");
            })
            .attr('d', lineGenerator);

        var point = clusterLine.selectAll('point')
            .data(function (d, i) {
                return data.map(function (datum) { return { "tag": d, "data": datum }; });
            })
            .enter().append('path')
            .attr('class', 'point')
            .attr('fill', function (d, i) {
                return UTIL.getDisplayColor(_measure.indexOf(d.tag), _displayColor);
            })
            .attr('d', function (d, i) {
                return d3.symbol()
                    .type(getPointType(_measure.indexOf(d.tag)))
                    .size(40)();
            })
            .attr('transform', function (d) {
                return 'translate('
                    + (x0(d['data'][_dimension[0]]) + x0.bandwidth() / 2)
                    + ',' + y(d['data'][d['tag']]) + ')';
            })
            .on('mouseover', _handleMouseOverFn.call(chart, tooltip, _local_svg))
            .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, _local_svg))
            .on('mouseout', _handleMouseOutFn.call(chart, tooltip, _local_svg));

        plot.append("g")
            .attr("class", "x_axis")
            .attr("transform", "translate(0," + plotHeight + ")")
            .call(d3.axisBottom(x0))
            .append("text")
            .attr("x", plotWidth / 2)
            .attr("y", 2 * axisLabelSpace)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .style('text-anchor', 'middle')
            .style('visibility', UTIL.getVisibility(_showXaxisLabel))
            .text(function () {
                return _displayName;
            });

        plot.append("g")
            .attr("class", "y_axis")
            .call(d3.axisLeft(y).ticks(null, "s"))
            .append("text")
            .attr("x", plotHeight / 2)
            .attr("y", 2 * axisLabelSpace)
            .attr("transform", function (d) { return "rotate(" + 90 + ")"; })
            .attr("dy", "0.32em")
            .style('visibility', UTIL.getVisibility(_showYaxisLabel))
            .attr("font-weight", "bold")
            .style('text-anchor', 'middle')
            .text(function () {
                return _displayNameForMeasure.map(function (p) { return p; }).join(', ');
            });

        UTIL.setAxisColor(_local_svg, _yAxisColor, _xAxisColor, _showYaxis, _showXaxis, _showYaxis, _showXaxis);
        _local_svg.select('g.sort').remove();
        UTIL.sortingView(container, parentHeight, parentWidth + margin.left, legendBreakCount, axisLabelSpace, offsetX);

        _local_svg.select('g.sort').selectAll('text')
            .on('click', function () {
                var order = d3.select(this).attr('class')
                switch (order) {
                    case 'ascending':
                        UTIL.toggleSortSelection(me, 'ascending', drawPlot, _local_svg, keys, _Local_data);
                        break;
                    case 'descending':
                        UTIL.toggleSortSelection(me, 'descending', drawPlot, _local_svg, keys, _Local_data);
                        break;
                    case 'reset': {
                        _local_svg.select(me.parentElement).select('.plot').remove();
                        drawPlot.call(me, _Local_data);
                        break;
                    }
                }
            }
            );

        d3.select(div).select('.btn-primary')
            .on('click', applyFilter(chart));

        d3.select(div).select('.btn-default')
            .on('click', clearFilter());

        var lasso = d3.lasso()
            .hoverSelect(true)
            .closePathSelect(true)
            .closePathDistance(100)
            .items(bar)
            .targetArea(_local_svg);

        lasso.on('start', onLassoStart(lasso, chart))
            .on('draw', onLassoDraw(lasso, chart))
            .on('end', onLassoEnd(lasso, chart));

        _local_svg.call(lasso);
    }
    chart._legendInteraction = function (event, data) {
        switch (event) {
            case 'mouseover':
                _legendMouseOver(data);
                break;
            case 'mousemove':
                _legendMouseMove(data);
                break;
            case 'mouseout':
                _legendMouseOut(data);
                break;
            case 'click':
                _legendClick(data);
                break;
        }
    }
    var _legendMouseOver = function (data) {

        var clustered = d3.selectAll('g.bar')
            .filter(function (d) {
                return d.tag === data;
            });

        var line = d3.selectAll('.line')
            .filter(function (d, i) {
                return d[i].tag === data;
            });

        clustered.select('rect')
            .style('fill', COMMON.HIGHLIGHTER);
        line
            .style("stroke-width", "2.5px")
            .style('stroke', COMMON.HIGHLIGHTER);
    }

    var _legendMouseMove = function (data) {

    }

    var _legendMouseOut = function (data) {
        var clustered = d3.selectAll('g.bar')
            .filter(function (d) {
                return d.tag === data;
            });

        var line = d3.selectAll('.line')
            .filter(function (d, i) {
                return d[i].tag === data;
            });
        clustered.select('rect')
            .style('fill', function (d, i) {
                return UTIL.getDisplayColor(_measure.indexOf(d.tag), _displayColor);
            });
        line
            .style("stroke-width", "1.5px")
            .style('stroke', function (d, i) {
                return UTIL.getBorderColor(_measure.indexOf(d[0]['tag']), _borderColor);
            });
    }

    var _legendClick = function (data) {
        var _filter = UTIL.getFilterData(_localLabelStack, data, _originalData)
        drawPlot.call(this, _filter);
    }
    chart._getName = function () {
        return _NAME;
    }

    chart.update = function (data) {

        chart._Local_data = data,
            _local_svg = _local_svg;
        filterData = [];
        var xLabels = getXLabels(data);
        var keys = Object.keys(data[0]);

        keys.splice(keys.indexOf(_dimension[0]), 1);
        measuresBar = [], measuresLine = [];
        keys.forEach(function (m, i) {
            if (_comboChartType[_measure.indexOf(m)] == "bar") {
                measuresBar.push(m);
            } else {
                measuresLine.push(m);
            }
        });

        /* Minimum and Maximum value of the measures */
        _measure.forEach(function(m) {
            var temp = d3.min(data, function(d) { return d[m]; });
            _localMin = _localMin > temp ? temp : _localMin;

            temp = d3.max(data, function(d) { return d[m]; });
            _localMax = _localMax < temp ? temp : _localMax;
        });

        /* Update the axes scales */
        _xDimension.domain(_localXLabels);
        _xDimensionGrid.domain([0, _localXLabels.length]);
        _xMeasure.rangeRound([0, _xDimension.bandwidth()]);
        _x.domain(_localXLabels);
        _y.domain([_localMin, _localMax])
            .nice();

        if(_legend) {
            svg.select('.legend').remove();

            _localLegend(_measure, svg.select('g'), {
                width: parentWidth,
                height: parentHeight
                // labelStack: _localLabelStack
            });
        }

        var plot = _local_svg.select('.plot')
        var chartploat = _local_svg.select('.chart')
        var labelStack = [];

        clusterGroupBar.enter().append('g')
            .attr('id', function(d, i) {
                return 'cluster-group-' + i;
            })
            .classed('cluster', true)
            .attr('transform', function(d) {
                return 'translate(' + _xDimension(d[_dimension[0]]) + ', 0)';
            });

        var barGroup = clusterGroupBar.selectAll('.bar')
            .data(function(d) {
                return _localMeasureBarChart.map(function(m) {
                    var obj = {};
                    obj[_dimension[0]] = d[_dimension[0]];
                    obj[m] = d[m];
                    obj['measure'] = m;
                    return obj;
                });
            })
            .enter().append('g')
                .attr('id', function(d, i) {
                    return 'bar-group-' + i;
                })
                .classed('bar', true);

        var rect = barGroup.append('rect')
            .attr('width', _xMeasure.bandwidth())
            .attr('height', 0)
            .style('fill', function(d, i) {
                if(typeof _measureDisplayColor[i] == 'undefined' || _measureDisplayColor[i].trim() == '') {
                    return COMMON.COLORSCALE(d['measure']);
                }
                return _measureDisplayColor[i];
            })
            .style('stroke', function(d, i) {
                if(typeof _measureBorderColor[i] == 'undefined' || _measureBorderColor[i].trim() == '') {
                    return COMMON.COLORSCALE(d['measure']);
                }
                return _measureBorderColor[i];
            })
            .y(function (d, i) {
                return y(d['data'][d.tag[0].tag]) != undefined ? y(d['data'][d.tag[0].tag]) : y(d.tag[0].tag[0].tag);
            });

        var text = barGroup.append('text')
            .attr('y', function(d, i) {
                return plotHeight;
            })
            .attr('dy', function(d, i) {
                return COMMON.OFFSET;
            })
            .attr('opacity', 0)
            .attr('visibility', function(d, i) {
                return _measureShowValue[i];
            })
            .style('font-style', function(d, i) {
                return _measureFontStyle[i] || COMMON.DEFAULT_FONTSTYLE;
            })
            .style('font-weight', function(d, i) {
                return _measureFontWeight[i] || COMMON.DEFAULT_FONTWEIGHT;
            })
            .style('font-size', function(d, i) {
                return _measureFontSize[i] || COMMON.DEFAULT_FONTSIZE;
            })
            .style('fill', function(d, i) {
                if(typeof _measureTextColor[i] == 'undefined' || _measureTextColor[i].trim() == '') {
                    return COMMON.DEFAULT_COLOR;
                }
                return _measureTextColor[i];
            })
            .style('text-anchor', 'middle');

        var rectMask = barGroup.append('rect')
            .classed('bar-rect-mask', true)
            .attr('width', _xMeasure.bandwidth())
            .attr('height', 1)
            .attr('visibility', 'hidden')
            .style('fill', function(d, i) {
                if(typeof _measureDisplayColor[i] == 'undefined' || _measureDisplayColor[i].trim() == '') {
                    return COMMON.COLORSCALE(d['measure']);
                }
                return _measureDisplayColor[i];
            })
            .style('stroke', function(d, i) {
                if(typeof _measureBorderColor[i] == 'undefined' || _measureBorderColor[i].trim() == '') {
                    return COMMON.COLORSCALE(d['measure']);
                }
                return _measureBorderColor[i];
            })
            .style('stroke-width', 1);

        clusterGroupBar.merge(clusterGroupBar)
            .transition()
            .duration(COMMON.DURATION)
            .attr('transform', function(d) {
                return 'translate(' + _xDimension(d[_dimension[0]]) + ', 0)';
            });

        clusterGroupBar.selectAll('.bar').select('rect:not(.bar-rect-mask)')
            .transition()
            .duration(COMMON.DURATION)
            .attr('height', function(d, i) {
                return _y(0) - _y(d[d['measure']]);
            })
            .attr('width', _xMeasure.bandwidth())
            .attr('x', function(d, i) {
                return _xMeasure(d['measure']);
            })
            .attr('y', function(d, i) {
                return _y(d[d['measure']]);
            });

        clusterGroupBar.selectAll('.bar').select('rect.bar-rect-mask')
            .transition()
            .duration(COMMON.DURATION)
            .attr('width', _xMeasure.bandwidth())
            .attr('x', function(d, i) {
                return _xMeasure(d['measure']);
            })
            .attr('y', function(d, i) {
                return _y(d[d['measure']]) - (COMMON.OFFSET / 3);
            });

        clusterGroupBar.selectAll('.bar').select('text')
            .transition()
            .duration(COMMON.DURATION)
            .attr('opacity', 1)
            .attr('x', function(d, i) {
                return _xMeasure(d['measure']) + (_xMeasure.bandwidth() / 2);
            })
            .attr('y', function(d, i) {
                return _y(d[d['measure']]);
            })
            .text(function(d, i) {
                var formatter = UTIL.getNumberFormatterFn(_measureNumberFormat[i]),
                    value = d[d['measure']],
                    lt = _localTotal.filter(function(lt) {
                        return lt['measure'] == d['measure'];
                    })[0],
                    positiveTotal = lt['positiveTotal'],
                    negativeTotal = lt['negativeTotal'];

                if(_measureNumberFormat[i] == 'percent') {
                    value = (value >= 0) ? (value / positiveTotal) : (value / negativeTotal);
                }

                return formatter(UTIL.roundNumber(value, 2)).toUpperCase();
            });

        clusterGroupBar.exit().selectAll('rect:not(.bar-rect-mask)')
            .transition()
            .duration(COMMON.DURATION)
            .attr('height', 0)
            .attr('y', _y(0))
            .remove();

        clusterGroupBar.exit().selectAll('rect.bar-rect-mask')
            .transition()
            .duration(COMMON.DURATION)
            .attr('y', _y(0))
            .remove();

        clusterGroupBar.exit().selectAll('text')
            .transition()
            .duration(COMMON.DURATION)
            .attr('y', _y(0))
            .remove();

        /* Update Line */
        var lineGroup = svg.select('#cluster-group-line').selectAll('.cluster')
            .selectAll('.line')

        lineGroup.select('path.line-path')
            .datum(function(m, i) {
                var clone = jQuery.extend(true, [], _localData); // deep copy

                return clone.map(function(d) {
                    d['measure'] = m;
                    return d;
                });
            })
            .transition()
            .duration(COMMON.DURATION)
            .attr('d', _line)
            .attr('stroke-dasharray', 'none');

        bar.select('rect')
            .attr('width', x1.bandwidth())
            .style('stroke-width', 1)
            .attr('x', function (d, i) {
                return x1(measuresBar[measuresBar.indexOf(d.tag)]);
            })
            .attr('y', function (d, i) {
                if ((d["data"][d.tag] === null) || (isNaN(d["data"][d.tag]))) {
                    return 0;
                } else if (d["data"][d.tag] > 0) {
                    return y(d["data"][d.tag]);
                }
                return _measureDisplayColor[index];
            })
            .on('mouseover', _handleMouseOverFn.call(chart, _localTooltip, _localSVG))
            .on('mousemove', _handleMouseMoveFn.call(chart, _localTooltip, _localSVG))
            .on('mouseout', _handleMouseOutFn.call(chart, _localTooltip, _localSVG))
            .on('click', function(d, i) {

            });

        linePoint.merge(linePoint)
            .transition()
            .duration(COMMON.DURATION)
            .attr('d', function(d, i) {
                var index = _measure.indexOf(d['measure']);
                return d3.symbol()
                    .type(UTIL.getSymbolForPointType(_measurePointType[index]))
                    .size(40)();
            })
            .attr('transform', function(d) {
                return 'translate(' + _x(d[_dimension[0]]) + ',' + _y(d[d['measure']]) + ')';
            });

        linePoint.exit()
            .remove();

        var lineText = lineGroup.selectAll('.line-text')
            .data(function(m, i) {
                var clone = jQuery.extend(true, [], _localData); // deep copy

        drawViz(newBars)

                return _measureFontWeight[index] || COMMON.DEFAULT_FONTWEIGHT;
            })
            .style('font-size', function(d, i) {
                var index = _measure.indexOf(d['measure']);

                return _measureFontSize[index] || COMMON.DEFAULT_FONTSIZE;
            })
            .style('fill', function(d, i) {
                var index = _measure.indexOf(d['measure']);

                if(typeof _measureTextColor[index] == 'undefined' || _measureTextColor[index].trim() == '') {
                    return COMMON.DEFAULT_COLOR;
                }
                return _measureTextColor[index];
            })
            .style('text-anchor', 'middle');

        lineText.merge(lineText)
            .transition()
            .duration(COMMON.DURATION)
            .attr('x', function(d, i) {
                return _x(d[_dimension[0]]);
            })
            .attr('y', function(d, i) {
                return _y(d[d['measure']]);
            })
            .attr('opacity', 1)
            .text(function(d, i) {
                var index = _measure.indexOf(d['measure']);

                var formatter = UTIL.getNumberFormatterFn(_measureNumberFormat[index]),
                    value = d[d['measure']],
                    lt = _localTotal.filter(function(lt) {
                        return lt['measure'] == d['measure'];
                    })[0],
                    positiveTotal = lt['positiveTotal'],
                    negativeTotal = lt['negativeTotal'];

                if(_measureNumberFormat[index] == 'percent') {
                    value = (value >= 0) ? (value / positiveTotal) : (value / negativeTotal);
                }

                return formatter(UTIL.roundNumber(value, 2)).toUpperCase();
            });

        lineText.exit()
            .transition()
             .duration(COMMON.DURATION)
            .call(d3.axisBottom(x0));

        svg.select('.x.grid')
            .transition()
             .duration(COMMON.DURATION)
            .call(d3.axisLeft(y).ticks(null, "s"));

        UTIL.setAxisColor(_local_svg, _yAxisColor, _xAxisColor, _showYaxis, _showXaxis);
        UTIL.displayThreshold(threshold, data, keys);
    }

    chart.config = function(value) {
        if(!arguments.length) {
            return _config;
        }
        _config = value;
        _setConfigParams.call(chart, _config);
        return chart;
    }

    chart.dimension = function(value) {
        if(!arguments.length) {
            return _dimension;
        }
        _dimension = value;
        return chart;
    }

    chart.measure = function(value) {
        if(!arguments.length) {
            return _measure;
        }
        _measure = value;
        return chart;
    }

    chart.xAxis = function(value) {
        if(!arguments.length) {
            return _xAxis;
        }
        _xAxis = value;
        return chart;
    }

    chart.yAxis = function(value) {
        if(!arguments.length) {
            return _yAxis;
        }
        _yAxis = value;
        return chart;
    }

    chart.xAxisColor = function(value) {
        if(!arguments.length) {
            return _xAxisColor;
        }
        _xAxisColor = value;
        return chart;
    }

    chart.yAxisColor = function(value) {
        if(!arguments.length) {
            return _yAxisColor;
        }
        _yAxisColor = value;
        return chart;
    }

    chart.xAxisLabel = function(value) {
        if(!arguments.length) {
            return _xAxisLabel;
        }
        _xAxisLabel = value;
        return chart;
    }

    chart.yAxisLabel = function(value) {
        if(!arguments.length) {
            return _yAxisLabel;
        }
        _yAxisLabel = value;
        return chart;
    }

    chart.legend = function(value) {
        if(!arguments.length) {
            return _legend;
        }
        _legend = value;
        return chart;
    }

    chart.legendPosition = function(value) {
        if(!arguments.length) {
            return _legendPosition;
        }
        _legendPosition = value;
        return chart;
    }

    chart.grid = function(value) {
        if(!arguments.length) {
            return _grid;
        }
        _grid = value;
        return chart;
    }

    chart.dimensionDisplayName = function(value) {
        if(!arguments.length) {
            return _dimensionDisplayName;
        }
        _dimensionDisplayName = value;
        return chart;
    }

    /**
     * Combo Measure Showvalue accessor function
     *
     * @param {boolean|array(boolean)|null} value Measure Showvalue value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {boolean|array(boolean)|function}
     */
    chart.measureShowValue = function(value, measure) {
        return UTIL.baseAccessor.call(_measureShowValue, value, measure, _measure);
    }

    /**
     * Combo Measure Displayname accessor function
     *
     * @param {string|array(string)|null} value Measure Displayname value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.measureDisplayName = function(value, measure) {
        return UTIL.baseAccessor.call(_measureDisplayName, value, measure, _measure);
    }

    /**
     * Combo Measure FontStyle accessor function
     *
     * @param {string|array(string)|null} value Measure FontStyle value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.measureFontStyle = function(value, measure) {
        return UTIL.baseAccessor.call(_measureFontStyle, value, measure, _measure);
    }

    /**
     * Combo Measure FontWeight accessor function
     *
     * @param {number|array(number)|null} value Measure FontWeight value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {number|array(number)|function}
     */
    chart.measureFontWeight = function(value, measure) {
        return UTIL.baseAccessor.call(_measureFontWeight, value, measure, _measure);
    }

    /**
     * Combo Measure FontSize accessor function
     *
     * @param {number|array(number)|null} value Measure FontSize value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {number|array(number)|function}
     */
    chart.measureFontSize = function(value, measure) {
        return UTIL.baseAccessor.call(_measureFontSize, value, measure, _measure);
    }

    /**
     * Combo Measure NumberFormat accessor function
     *
     * @param {string|array(string)|null} value Measure NumberFormat value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.measureNumberFormat = function(value, measure) {
        return UTIL.baseAccessor.call(_measureNumberFormat, value, measure, _measure);
    }

    /**
     * Combo Measure TextColor accessor function
     *
     * @param {string|array(string)|null} value Measure TextColor value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.measureTextColor = function(value, measure) {
        return UTIL.baseAccessor.call(_measureTextColor, value, measure, _measure);
    }

    /**
     * Combo Measure DisplayColor accessor function
     *
     * @param {string|array(string)|null} value Measure DisplayColor value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.measureDisplayColor = function(value, measure) {
        return UTIL.baseAccessor.call(_measureDisplayColor, value, measure, _measure);
    }

    /**
     * Combo Measure BorderColor accessor function
     *
     * @param {string|array(string)|null} value Measure BorderColor value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.measureBorderColor = function(value, measure) {
        return UTIL.baseAccessor.call(_measureBorderColor, value, measure, _measure);
    }

    /**
     * Combo Measure ChartType accessor function
     *
     * @param {string|array(string)|null} value Measure ChartType value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.measureChartType = function(value, measure) {
        return UTIL.baseAccessor.call(_measureChartType, value, measure, _measure);
    }

    /**
     * Combo Measure PointType accessor function
     *
     * @param {string|array(string)|null} value Measure PointType value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.measurePointType = function(value, measure) {
        return UTIL.baseAccessor.call(_measurePointType, value, measure, _measure);
    }

    chart.tooltip = function(value) {
        if(!arguments.length) {
            return _tooltip;
        }
        _tooltip = value;
        return chart;
    }

    chart.redraw = function() {
        // Do something
    }

    return chart;
}

module.exports = combo;

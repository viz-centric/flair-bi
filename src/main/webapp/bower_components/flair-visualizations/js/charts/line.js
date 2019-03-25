var COMMON = require('../extras/common.js')(),
    UTIL = require('../extras/util.js')(),
    LEGEND = require('../extras/legend.js')();

function line() {

    /* These are the constant global variable for the function line.
     */
    var _NAME = 'line';

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
        _xAxisLabel,
        _yAxisLabel,
        _legend,
        _legendPosition,
        _grid,
        _stacked,
        _dimensionDisplayName,
        _measureShowValue = [],
        _measureDisplayName = [],
        _measureFontStyle = [],
        _measureFontWeight = [],
        _measureFontSize = [],
        _measureNumberFormat = [],
        _measureTextColor = [],
        _measureDisplayColor = [],
        _measureBorderColor = [],
        _measureLineType = [],
        _measurePointType = [],
        _tooltip;

    /* These are the common variables that is shared across the different private/public 
     * methods but is initialized/updated within the methods itself.
     */
    var _localSVG,
        _localTotal = [],
        _localXAxis,
        _localYAxis,
        _localXGrid,
        _localYGrid,
        _localData,
        _localXLabels = [],
        _localMin = 0,
        _localMax = 0,
        _localLegend,
        _localTooltip;
        // _localLabelStack;

    /* These are the common private functions that is shared across the different private/public 
     * methods but is initialized beforehand.
     */
    var _x = d3.scalePoint()
            .padding(0.5),
        _xGrid = d3.scaleLinear(),
        _y = d3.scaleLinear(),
        _line = d3.line(),
        _area = d3.area();

    /* -------------------------------------------------------------------------------- */
    var _setConfigParams = function(config) {
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
        this.stacked(config.stacked);
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
        this.measureLineType(config.measureLineType);
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
     * @param {function} chart Line Vertical Bar chart function
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

    /* Returns the D3 symbol for the given point shape
     *
     * @param {string} pointType Name of the point shape
     * @return {object} D3 symbol
     */
    var _getSymbolForPointType = function(pointType) {
        var symbol = null;

        switch(pointType.toLowerCase()) {
            case "rectrounded":
                symbol = d3.symbolDiamond;
                break;

            case "rectrot":
                symbol = d3.symbolDiamond;
                break;

            case "star":
                symbol = d3.symbolStar;
                break;

            case "triangle":
                symbol = d3.symbolTriangle;
                break;

            case "circle":
                symbol = d3.symbolCircle;
                break;

            case "cross":
                symbol = d3.symbolCross;
                break;

            case "crossrot":
                symbol = d3.symbolCross;
                break;

            case "dash":
                symbol = d3.symbolWye;
                break;

            case "line":
                symbol = d3.symbolWye;
                break;

            case "rect":
                symbol = d3.symbolSquare;
                break;

            default:
                symbol = d3.symbolCircle;
        }

        return symbol;
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

            /* applying sort operation to the data */
            // UTIL.sorter(data, _measure, _sort);

            var container = svg.append('g')
                .classed('container', true)
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

            if(_tooltip) {
                _localTooltip = d3.select(this.parentNode).select('#tooltip');
            }

            /* Label values for the dimension */
            _localXLabels = data.map(function(d) {
                return d[_dimension[0]];
            });

            /* Minimum and Maximum value of the measures */
            _measure.forEach(function(m) {
                var temp = d3.min(data, function(d) { return d[m]; });
                _localMin = _localMin > temp ? temp : _localMin;

                temp = d3.max(data, function(d) { return d[m]; });
                _localMax = _localMax < temp ? temp : _localMax;
            });
            
            _x.domain(_localXLabels)
                .rangeRound([0, plotWidth]);

            _xGrid.domain([0, _localXLabels.length])
                .range([0, plotWidth]);

            _y.domain([_localMin, _localMax])
                .range([plotHeight, 0])
                .nice();

            _line.x(function(d) {
                    return _x(d[_dimension[0]]);
                })
                .y(function(d) {
                    return _y(d[d['measure']]);
                });

            _area.x(function(d) {
                    return _x(d[_dimension[0]]);
                })
                .y0(plotHeight)
                .y1(function(d) {
                    return _y(d[d['measure']]);
                });

            var plot = container.append('g')
                .attr('id', 'line-plot')
                .attr('transform', function() {
                    var translate = [0, 0];

                    switch(_legendPosition) {
                        case 'top':
                            translate = [COMMON.AXIS_THICKNESS, (legendHeight + (_xAxis ? COMMON.AXIS_THICKNESS : 0) / 1.5)];
                            break;
                        case 'bottom':
                        case 'right':
                            translate = [(_yAxis ? COMMON.AXIS_THICKNESS : 0), 0];
                            break;
                        case 'left':
                            translate = [(legendWidth + (_yAxis ? COMMON.AXIS_THICKNESS : 0)), 0]
                    }

                    return 'translate(' + translate.toString() + ')';
                });

            /* Axes Grid */
            _localXGrid = d3.axisBottom()
                .ticks(_localXLabels.length)
                .tickFormat('')
                .tickSize(-plotHeight);

            _localYGrid = d3.axisLeft()
                .tickFormat('')
                .tickSize(-plotWidth);
        
            _localXGrid.scale(_xGrid);
            _localYGrid.scale(_y);

            plot.append('g')
                .attr('class', 'x grid')
                .attr('visibility', function() {
                    return _grid ? 'visible' : 'hidden';
                })
                .attr('transform', 'translate(0, ' + plotHeight + ')')
                .call(_localXGrid);

            plot.append('g')
                .attr('class', 'y grid')
                .attr('visibility', function() {
                    return _grid ? 'visible' : 'hidden';
                })
                .call(_localYGrid);

            var cluster = plot.selectAll('.cluster')
                .data(_measure)
                .enter().append('g')
                    .classed('cluster', true);

            var lineGroup = cluster.append('g')
                .attr('id', function(d, i) {
                    return 'line-group-' + i;
                })
                .classed('line', true);

            lineGroup.append('path')
                .datum(function(m, i) {
                    var clone = jQuery.extend(true, [], data); // deep copy

                    return clone.map(function(d) {
                        d['measure'] = m;
                        return d;
                    });
                })
                .style('fill', 'none')
                .style('stroke', function(d, i) {
                    if(typeof _measureBorderColor[i] == 'undefined' || _measureBorderColor[i].trim() == '') {
                        return COMMON.COLORSCALE(_measure[i]);
                    }
                    return _measureBorderColor[i];
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
                .datum(function(m, i) {
                    var clone = jQuery.extend(true, [], data); // deep copy

                    return clone.map(function(d) {
                        d['measure'] = m;
                        return d;
                    });
                })
                .style('fill', function(d, i) {
                    if(typeof _measureDisplayColor[i] == 'undefined' || _measureDisplayColor[i].trim() == '') {
                        return COMMON.COLORSCALE(_measure[i]);
                    }
                    return _measureDisplayColor[i];
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
                    var clone = jQuery.extend(true, [], data); // deep copy

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
                            .type(_getSymbolForPointType(_measurePointType[index]))
                            .size(40)();
                    })
                    .attr('transform', function(d) {
                        return 'translate(' + _x(d[_dimension[0]]) + ',' + _y(d[d['measure']]) + ')';
                    })
                    .on('mouseover', _handleMouseOverFn.call(chart, _localTooltip, svg))
                    .on('mousemove', _handleMouseMoveFn.call(chart, _localTooltip, svg))
                    .on('mouseout', _handleMouseOutFn.call(chart, _localTooltip, svg))
                    .on('click', function(d, i) {
                        
                    });

            var text = lineGroup.selectAll('.line-text')
                .data(function(m, i) {
                    var clone = jQuery.extend(true, [], data); // deep copy

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

            /* Axes */
            var xAxisGroup,
                yAxisGroup;

            if(_xAxis) {
                _localXAxis = d3.axisBottom(_x)
                    .tickSize(0)
                    .tickPadding(10);

                xAxisGroup = plot.append('g')
                    .attr('class', 'x axis')
                    .attr('visibility', function() {
                        return 'visible';
                    })
                    .attr('transform', 'translate(0, ' + plotHeight + ')')
                    .call(_localXAxis);

                xAxisGroup.append('g')
                    .attr('class', 'label')
                    .attr('transform', function() {
                        return 'translate(' + (plotWidth) + ', ' + (COMMON.AXIS_THICKNESS / 1.5) + ')';
                    })
                    .append('text')
                        .style('text-anchor', 'end')
                        .style('font-weight', 'bold')
                        .style('fill', _xAxisColor)
                        .text(_xAxisLabel);

                _setAxisColor(xAxisGroup, _xAxisColor);
            }

            if(_yAxis) {
                _localYAxis = d3.axisLeft(_y)
                    .tickSize(0)
                    .tickPadding(8)
                    .tickFormat(function(d) {
                        return UTIL.shortScale(2)(d);
                    });

                yAxisGroup = plot.append('g')
                    .attr('class', 'y axis')
                    .attr('visibility', function() {
                        return 'visible';
                    })
                    .call(_localYAxis);

                yAxisGroup.append('g')
                    .attr('class', 'label')
                    .attr('transform', function() {
                        return 'translate(' + (-COMMON.AXIS_THICKNESS / 1.15) + ', ' + '0)';
                    })
                    .append('text')
                        .attr('transform', 'rotate(-90)')
                        .style('text-anchor', 'end')
                        .style('font-weight', 'bold')
                        .style('fill', _yAxisColor)
                        .text(_yAxisLabel);

                _setAxisColor(yAxisGroup, _yAxisColor);
            }
        });
    }

    /**
     * Private method that delegates legend interactions to respective controllers
     *
     * @param {object} event Mouseevent instance
     * @param {object} datum Record of the data binded to the legend item
     * @return {undefined}
     */
    chart._legendInteraction = function(event, data) {
        switch(event) {
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

    chart._getName = function() {
        return _NAME;
    }

    chart.update = function(data) {
        var svg = _localSVG,
            width = +svg.attr('width'),
            height = +svg.attr('height'),
            parentWidth = width - 2 * COMMON.PADDING,
            parentHeight = height - 2 * COMMON.PADDING,
            filteredData,
            _localMin = 0,
            _localMax = 0;

        /* store the data in local variable */
        _localData = data;

        /* Label values for the dimension */
        _localXLabels = data.map(function(d) {
            return d[_dimension[0]];
        });

        /* Minimum and Maximum value of the measures */
        _measure.forEach(function(m) {
            var temp = d3.min(data, function(d) { return d[m]; });
            _localMin = _localMin > temp ? temp : _localMin;

            temp = d3.max(data, function(d) { return d[m]; });
            _localMax = _localMax < temp ? temp : _localMax;
        });
        
        /* Update the axes scales */
        _x.domain(_localXLabels);
        _xGrid.domain([0, _localXLabels.length]);
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

        var clusterGroup = svg.selectAll('.cluster')
            .data(data);
            
        clusterGroup.enter().append('g')
            .attr('id', function(d, i) {
                return 'cluster-group-' + i;
            })
            .classed('cluster', true)
            .attr('transform', function(d) {
                return 'translate(' + _x(d[_dimension[0]]) + ', 0)';
            });

        var barGroup = clusterGroup.selectAll('.bar')
            .data(function(d) {
                return _measure.map(function(m) {
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
            .style('stroke-width', 1)
            .on('mouseover', _handleMouseOverFn.call(chart, _localTooltip, svg))
            .on('mousemove', _handleMouseMoveFn.call(chart, _localTooltip, svg))
            .on('mouseout', _handleMouseOutFn.call(chart, _localTooltip, svg))
            .on('click', function(d, i) {
                
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

        clusterGroup.merge(clusterGroup)
            .transition()
            .duration(COMMON.DURATION)
            .attr('transform', function(d) {
                return 'translate(' + _x(d[_dimension[0]]) + ', 0)';
            });

        clusterGroup.selectAll('.bar').select('rect:not(.bar-rect-mask)')
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

        clusterGroup.selectAll('.bar').select('rect.bar-rect-mask')
            .transition()
            .duration(COMMON.DURATION)
            .attr('width', _xMeasure.bandwidth())
            .attr('x', function(d, i) {
                return _xMeasure(d['measure']);
            })
            .attr('y', function(d, i) {
                return _y(d[d['measure']]) - (COMMON.OFFSET / 3);
            });

        clusterGroup.selectAll('.bar').select('text')
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

        clusterGroup.exit().selectAll('rect:not(.bar-rect-mask)')
            .transition()
            .duration(COMMON.DURATION)
            .attr('height', 0)
            .attr('y', _y(0))
            .remove();

        clusterGroup.exit().selectAll('text')
            .transition()
            .duration(COMMON.DURATION)
            .attr('y', _y(0))
            .remove();

        /* Update Axes */
        var xAxisGroup,
            yAxisGroup;

        if(_xAxis) {
            xAxisGroup = svg.select('.x.axis')
                .transition()
                .duration(COMMON.DURATION)
                .call(_localXAxis);

            _setAxisColor(xAxisGroup, _xAxisColor);
        }
           
        if(_yAxis) {
            yAxisGroup = svg.select('.y.axis')
                .transition()
                .duration(COMMON.DURATION)
                .call(_localYAxis);

            _setAxisColor(yAxisGroup, _yAxisColor);
        }

        /* Update Axes Grid */
        _localXGrid.ticks(_localXLabels.length);

        svg.select('.x.grid')
            .transition()
            .duration(COMMON.DURATION)
            .attr('visibility', function() {
                return _grid ? 'visible' : 'hidden';
            })
            .call(_localXGrid);

        svg.select('.y.grid')
            .transition()
            .duration(COMMON.DURATION)
            .attr('visibility', function() {
                return _grid ? 'visible' : 'hidden';
            })
            .call(_localYGrid);
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

    chart.stacked = function(value) {
        if(!arguments.length) {
            return _stacked;
        }
        _stacked = value;
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
     * Line Measure Showvalue accessor function
     *
     * @param {boolean|array(boolean)|null} value Measure Showvalue value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {boolean|array(boolean)|function}
     */
    chart.measureShowValue = function(value, measure) {
        return UTIL.baseAccessor.call(_measureShowValue, value, measure, _measure);
    }

    /**
     * Line Measure Displayname accessor function
     *
     * @param {string|array(string)|null} value Measure Displayname value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.measureDisplayName = function(value, measure) {
        return UTIL.baseAccessor.call(_measureDisplayName, value, measure, _measure);
    }

    /**
     * Line Measure FontStyle accessor function
     *
     * @param {string|array(string)|null} value Measure FontStyle value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.measureFontStyle = function(value, measure) {
        return UTIL.baseAccessor.call(_measureFontStyle, value, measure, _measure);
    }

    /**
     * Line Measure FontWeight accessor function
     *
     * @param {number|array(number)|null} value Measure FontWeight value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {number|array(number)|function}
     */
    chart.measureFontWeight = function(value, measure) {
        return UTIL.baseAccessor.call(_measureFontWeight, value, measure, _measure);
    }

    /**
     * Line Measure FontSize accessor function
     *
     * @param {number|array(number)|null} value Measure FontSize value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {number|array(number)|function}
     */
    chart.measureFontSize = function(value, measure) {
        return UTIL.baseAccessor.call(_measureFontSize, value, measure, _measure);
    }

    /**
     * Line Measure NumberFormat accessor function
     *
     * @param {string|array(string)|null} value Measure NumberFormat value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.measureNumberFormat = function(value, measure) {
        return UTIL.baseAccessor.call(_measureNumberFormat, value, measure, _measure);
    }

    /**
     * Line Measure TextColor accessor function
     *
     * @param {string|array(string)|null} value Measure TextColor value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.measureTextColor = function(value, measure) {
        return UTIL.baseAccessor.call(_measureTextColor, value, measure, _measure);
    }

    /**
     * Line Measure DisplayColor accessor function
     *
     * @param {string|array(string)|null} value Measure DisplayColor value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.measureDisplayColor = function(value, measure) {
        return UTIL.baseAccessor.call(_measureDisplayColor, value, measure, _measure);
    }

    /**
     * Line Measure BorderColor accessor function
     *
     * @param {string|array(string)|null} value Measure BorderColor value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.measureBorderColor = function(value, measure) {
        return UTIL.baseAccessor.call(_measureBorderColor, value, measure, _measure);
    }

    chart.measureLineType = function(value, measure) {
        return UTIL.baseAccessor.call(_measureLineType, value, measure, _measure);   
    }

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

    return chart;
}

module.exports = line;
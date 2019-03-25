var COMMON = require('../extras/common.js')(),
    UTIL = require('../extras/util.js')(),
    LEGEND = require('../extras/legend.js')();

function donut() {

    var _NAME = 'donut';

    var _config,
        _dimension,
        _measure,
        _showLegend,
        _legendPosition,
        _showValueAs,
        _valueAsArc,
        _valuePosition,
        _sort,
        _tooltip;

    var _local_svg,
        _Local_data,
        _local_total = 0,
        _local_transition_time = 500,
        _local_transition_map = d3.map(),
        _local_sorted_measure_value = [],
        _local_tooltip;

    var filter = false,
        filterData = [];

    var _pie = d3.pie()
        .sort(null);

    var _arc = d3.arc()
        .innerRadius(0);

    var _arcMask = d3.arc();

    var _labelArc = d3.arc();

    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.measure(config.measure);
        this.showLegend(config.showLegend);
        this.legendPosition(config.legendPosition);
        this.showValueAs(config.showValueAs);
        this.valueAsArc(config.valueAsArc);
        this.valuePosition(config.valuePosition);
    }

    /**
     * Period function that stretches the rendering process
     *
     * @param {number} extraDuration Additional duration value in milliseconds
     * @return {function} Accessor function that computes the duration period
     */
    var _durationFn = function (extraDuration) {
        if (extraDuration === void 0) { extraDuration = 0; }

        if (isNaN(+extraDuration)) {
            throw new TypeError('Not a number');
        }

        return function (d, i) {
            var t = _local_transition_map.get(d.value);

            if (!t) {
                t = _local_transition_time * (d.value / _local_total)
                _local_transition_map.set(d.value, t);
            }

            return (t + extraDuration);
        }
    }

    /**
     * Delay function that delays the start of rendering process
     *
     * @param {number} extraDelay Additional delay value in milliseconds
     * @return {function} Accessor function that computes the delay period
     */
    var _delayFn = function (extraDelay) {
        if (extraDelay === void 0) { extraDelay = 0; }

        if (isNaN(+extraDelay)) {
            throw new TypeError('TypeError: Not a number');
        }

        return function (d, i) {
            var i = _local_sorted_measure_value.indexOf(d.value),
                t = 0;

            while (i > 0) {
                i--;
                t += _local_transition_map.get(_local_sorted_measure_value[i]);
            }

            return (t + extraDelay);
        }
    }

    /**
     * Gives the value of hypotenuse using pythagorous theorem
     *
     * @param {number} x Value of perpendicular
     * @param {number} y Value of base
     * @return {number} Value of hypotenuse
     */
    var _pythagorousTheorem = function (x, y) {
        if (isNaN(+x) || isNaN(+y)) {
            throw new Error('TypeError: Not a number');
            return 0;
        }

        return Math.sqrt(Math.pow(+x, 2) + Math.pow(+y, 2));
    }

    /**
     * Label function to provide the label to be shown
     *
     * @return {function} Accessor function that identifies the label text
     */
    var _labelFn = function () {
        return function (d, i) {
            var result;

            switch (_showValueAs) {
                case 'label':
                    result = d.data[_dimension[0]];
                    break;
                case 'value':
                    result = d.data[_measure[0]];
                    break;
                case 'percentage':
                    result = (100 * d.data[_measure[0]] / _local_total).toFixed(2) + ' %';
                    break;
                default:
                    result = d.data[_dimension[0]];
            }

            return result;
        }
    }

    /**
     * Builds the html data for the tooltip
     *
     * @param {object} datum Datum forming the arc
     * @param {function} chart Pie chart function
     * @return {string} String encoded HTML data
     */
    var _buildTooltipData = function (datum, chart) {
        var output = "";

        output += "<table><tr>"
            + "<th>" + chart.dimension() + ": </th>"
            + "<td>" + datum[chart.dimension()] + "</td>"
            + "</tr><tr>"
            + "<th>" + chart.measure() + ": </th>"
            + "<td>" + datum[chart.measure()] + "</td>"
            + "</tr></table>";

        return output;
    }

    var onLassoStart = function (lasso, chart) {
        return function () {
            if (filter) {
                lasso.items().selectAll('path')
                    .classed('not_possible', true)
                    .classed('selected', false);
            }
        }
    }

    var onLassoDraw = function (lasso, chart) {
        return function () {
            filter = true;
            lasso.items().selectAll('path')
                .classed('selected', false);

            lasso.possibleItems().selectAll('path')
                .classed('not_possible', false)
                .classed('possible', true);

            lasso.notPossibleItems().selectAll('path')
                .classed('not_possible', true)
                .classed('possible', false);
        }
    }

    var onLassoEnd = function (lasso, chart) {
        return function () {
            var data = lasso.selectedItems().data();
            if (!filter) {
                return;
            }
            if (data.length > 0) {
                lasso.items().selectAll('path')
                    .classed('not_possible', false)
                    .classed('possible', false);
            }

            lasso.selectedItems().selectAll('path')
                .classed('selected', true)

            lasso.notSelectedItems().selectAll('path');

            var confirm = d3.select('.confirm')
                .style('visibility', 'visible');

            var _filter = [];
            data.forEach(function (d) {
                var obj = new Object();
                obj[chart.dimension()] = d.data[chart.dimension()]
                obj[chart.measure()] = d.data[chart.measure()]
                _filter.push(obj)
            });
            if (_filter.length > 0) {
                filterData = _filter;
            }
        }
    }

    var applyFilter = function (chart) {
        return function () {
            if (filterData.length > 0) {
                chart.update(filterData);
            }
        }
    }

    var _handleMouseOverFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            d3.select(this).style('cursor', 'pointer');

            var arcGroup = container.selectAll('g.arc')
                .filter(function (d1) {
                    return d1.data[_dimension[0]] === d.data[_dimension[0]];
                });

            arcGroup.select('path')
                .style('fill', COMMON.HIGHLIGHTER);

            var arcMaskGroup = container.selectAll('g.arc-mask')
                .filter(function (d1) {
                    return d1.data[_dimension[0]] === d.data[_dimension[0]];
                });

            arcMaskGroup.select('path')
                .style('visibility', 'visible');

            if (tooltip) {
                UTIL.showTooltip(tooltip);
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d.data, me), container);
            }
        }
    }

    var _handleMouseMoveFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            if (tooltip) {
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d.data, me), container);
            }
        }
    }

    var _handleMouseOutFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            d3.select(this).style('cursor', 'default');

            var arcGroup = container.selectAll('g.arc')
                .filter(function (d1) {
                    return d1.data[_dimension[0]] === d.data[_dimension[0]];
                });

            arcGroup.select('path')
                .style('fill', function (d1, i) {
                    return COMMON.COLORSCALE(d1.data[_dimension[0]]);
                });

            var arcMaskGroup = container.selectAll('g.arc-mask')
                .filter(function (d1) {
                    return d1.data[_dimension[0]] === d.data[_dimension[0]];
                });

            arcMaskGroup.select('path')
                .style('visibility', 'hidden');

            if (tooltip) {
                UTIL.hideTooltip(tooltip);
            }
        }
    }

    function chart(selection) {
        _local_svg = selection;

        selection.each(function (data) {
            chart._Local_data = data;
            var svg = d3.select(this),
                width = +svg.attr('width'),
                height = +svg.attr('height'),
                parentWidth = width - 2 * COMMON.PADDING,
                parentHeight = height - 2 * COMMON.PADDING,
                outerRadius,
                tooltip;

            /* total sum of the measure values */
            _local_total = d3.sum(data.map(function (d) { return d[_measure[0]]; }));

            /* applying sort operation to the data */
            UTIL.sorter(data, _measure, _sort);

            /* extracting measure values only from the data */
            _local_sorted_measure_value = data.map(function (d) { return +d[_measure[0]]; })

            var container = svg.append('g')
                .attr('transform', 'translate(' + COMMON.PADDING + ', ' + COMMON.PADDING + ')');

            var legendWidth = 0,
                legendHeight = 0,
                plotWidth = parentWidth,
                plotHeight = parentHeight;

            if (_showLegend) {
                var donutLegend = LEGEND.bind(chart);

                var result = donutLegend(data, container, {
                    width: parentWidth,
                    height: parentHeight
                });

                legendWidth = result.legendWidth;
                legendHeight = result.legendHeight;

                switch (_legendPosition) {
                    case 'top':
                    case 'bottom':
                        plotHeight = parentHeight - legendHeight;
                        break;
                    case 'right':
                    case 'left':
                        plotWidth = parentWidth - legendWidth;
                        break;
                }
            }

            if (_tooltip) {
                tooltip = d3.select(this.parentNode).select('#tooltip');
            }

            chart.drawPlot = function (data) {
                var me = this;
                _Local_data = data;

                outerRadius = Math.min(plotWidth, plotHeight) / 2.25;
                var innerRadius = outerRadius * .5;

                /* setting the outerradius of the arc */
                _arc.outerRadius(outerRadius);
                _arc.innerRadius(innerRadius);

                /* setting the innerradius and outerradius of the masking arc */
                _arcMask.outerRadius(outerRadius * 1.02)
                    .innerRadius(outerRadius * 1.01);

                /* setting the outerradius and innerradius of the arc */
                _labelArc.outerRadius(outerRadius)
                    .innerRadius(outerRadius * 0.8);

                var plot = container.append('g')
                    .attr('id', 'pie-plot')
                    .classed('plot', true)
                    .attr('transform', function () {
                        var translate = [0, 0];

                        switch (_legendPosition) {
                            case 'top':
                                translate = [(plotWidth / 2), legendHeight + (plotHeight / 2)];
                                break;
                            case 'bottom':
                            case 'right':
                                translate = [(plotWidth / 2), (plotHeight / 2)];
                                break;
                            case 'left':
                                translate = [legendWidth + (plotWidth / 2), (plotHeight / 2)]
                        }

                        return 'translate(' + translate.toString() + ')';
                    });

                var pieMask = plot.append('g')
                    .selectAll('.arc-mask')
                    .data(_pie(data))
                    .enter().append('g')
                    .attr('id', function (d, i) {
                        return 'arc-mask-group-' + i;
                    })
                    .attr('class', 'arc-mask')
                    .append('path')
                    .attr('id', function (d, i) {
                        return 'arc-mask-path-' + i;
                    })
                    .attr('d', _arcMask)
                    .style('visibility', 'hidden')
                    .style('fill', function (d) {
                        return COMMON.COLORSCALE(d.data[_dimension[0]]);
                    })

                var pieArcGroup = plot.append('g')
                    .selectAll('.arc')
                    .data(_pie(data))
                    .enter().append('g')
                    .attr('id', function (d, i) {
                        return 'arc-group-' + i;
                    })
                    .attr('class', 'arc')

                var pieArcPath = pieArcGroup.append('path')
                    .attr('id', function (d, i) {
                        return 'arc-path-' + i;
                    })
                    .style('fill', function (d) {
                        return COMMON.COLORSCALE(d.data[_dimension[0]]);
                    })
                    .on('mouseover', _handleMouseOverFn.call(chart, tooltip, svg))
                    .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, svg))
                    .on('mouseout', _handleMouseOutFn.call(chart, tooltip, svg))
                    .on('click', function (d, i) {
                        var confirm = d3.select('.confirm')
                            .style('visibility', 'visible');
                        filter = false;
                        var filter = {};
                        var point = d3.select(this);
                        if (point.classed('selected')) {
                            point.classed('selected', false);
                        } else {
                            point.classed('selected', true);
                        }
                        var obj = new Object();
                        obj[chart.dimension()] = d.data[chart.dimension()]
                        obj[chart.measure()] = d.data[chart.measure()]
                        filterData.push(obj)
                    });

                pieArcPath.transition()
                    .duration(_durationFn())
                    .delay(_delayFn())
                    .attrTween('d', function (d) {
                        var i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
                        return function (t) {
                            d.endAngle = i(t);
                            return _arc(d)
                        }
                    });

                var pieLabel;

                if (_valueAsArc) {
                    pieLabel = pieArcGroup.append('text')
                        .attr('dy', function (d, i) {
                            if (_valuePosition == 'inside') {
                                return 10;
                            } else {
                                return -5;
                            }
                        })

                    pieLabel.append('textPath')
                        .attr('xlink:href', function (d, i) {
                            return '#arc-path-' + i;
                        })
                        .attr('text-anchor', function () {
                            return 'middle';
                        })
                        .transition()
                        .delay(_delayFn(200))
                        .on('start', function () {
                            d3.select(this).attr('startOffset', function (d) {
                                var length = pieArcPath.nodes()[d.index].getTotalLength(),
                                    diff = d.endAngle - d.startAngle,
                                    x = 2 * (outerRadius - innerRadius) + diff * innerRadius;

                                return 50 * (length - x) / length + "%";
                            })
                                .text(_labelFn())
                                .filter(function (d, i) {
                                    var diff = d.endAngle - d.startAngle;
                                    return outerRadius * diff - 5 < this.getComputedTextLength();
                                })
                                .remove();
                        });
                } else {
                    var pieArcTextGroup = plot.selectAll('.arc-text')
                        .data(_pie(data))
                        .enter().append('g')
                        .attr('id', function (d, i) {
                            return 'arc-text-group-' + i;
                        })
                        .attr('class', 'arc-text');

                    pieLabel = pieArcTextGroup.append('text')
                        .attr('transform', function (d) {
                            var centroid = _labelArc.centroid(d),
                                x = centroid[0],
                                y = centroid[1],
                                h = _pythagorousTheorem(x, y);

                            if (_valuePosition == 'inside') {
                                return 'translate('
                                    + outerRadius * (x / h) * 0.85
                                    + ', '
                                    + outerRadius * (y / h) * 0.85
                                    + ')';
                            } else {
                                return 'translate('
                                    + outerRadius * (x / h) * 1.05
                                    + ', '
                                    + outerRadius * (y / h) * 1.05
                                    + ')';
                            }
                        })
                        .attr('dy', '0.35em')
                        .attr('text-anchor', function (d) {
                            if (_valuePosition == 'inside') {
                                return 'middle';
                            } else {
                                return (d.endAngle + d.startAngle) / 2 > Math.PI
                                    ? 'end' : (d.endAngle + d.startAngle) / 2 < Math.PI
                                        ? 'start' : 'middle';
                            }
                        })
                        .transition()
                        .delay(_delayFn(200))
                        .on('start', function () {
                            d3.select(this).text(_labelFn())
                                .filter(function (d) {
                                    /* length of arc = angle in radians * radius */
                                    var diff = d.endAngle - d.startAngle;
                                    return outerRadius * diff < this.getComputedTextLength();
                                })
                                .remove();
                        });
                }

                svg.select('g.lasso').remove()
                var lasso = d3.lasso()
                    .hoverSelect(true)
                    .closePathSelect(true)
                    .closePathDistance(100)
                    .items(pieArcGroup)
                    .targetArea(plot);

                lasso.on('start', onLassoStart(lasso, chart))
                    .on('draw', onLassoDraw(lasso, chart))
                    .on('end', onLassoEnd(lasso, chart));

                d3.select('.confirm')
                    .on('click', applyFilter(chart));

                plot.call(lasso);
            }
            chart.drawPlot.call(this, data);
        });
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

    var _mergeForTransition = function (fData, sData) {
        var secondSet = d3.set();

        sData.forEach(function (d) {
            secondSet.add(d[_dimension[0]]);
        });

        var onlyFirst = fData.filter(function (d) {
            return !secondSet.has(d[_dimension[0]]);
        })
            .map(function (d) {
                var obj = {};

                obj[_dimension[0]] = d[_dimension[0]];
                obj[_measure[0]] = 0;

                return obj;
            });

        return d3.merge([sData, onlyFirst])
            .sort(function (a, b) {
                return a[_measure[0]] > b[_measure] ? _sort
                    : a[_measure[0]] < b[_measure] ? -_sort
                        : 0;
            })
    }

    chart.update = function (data) {
        var svg = _local_svg;
        filter = false;
        filterData = [];
        var key = function (d) {
            return d.data[_dimension[0]];
        };

        var prevData = svg.selectAll('g.arc')
            .data().map(function (d) { return d.data });

        if (prevData.length == 0) {
            prevData = data;
        }

        var oldFilteredData = _mergeForTransition(data, prevData),
            newFilteredData = _mergeForTransition(prevData, data);

        d3.selectAll('path.selected').classed('selected', false);

        var pieArcGroup = svg.selectAll('g.arc')
            .data(_pie(oldFilteredData), key)
            .enter()
            .insert('g')
            .attr('id', function (d, i) {
                return 'arc-group-' + i;
            })
            .attr('class', 'arc');

        var pieArcPath = pieArcGroup.append('path')
            .attr('id', function (d, i) {
                return 'arc-path-' + i;
            })
            .style('fill', function (d) {
                return COMMON.COLORSCALE(d.data[_dimension[0]]);
            })
            .each(function (d) {
                this._current = d;
            });

        pieArcGroup = svg.selectAll('g.arc')
            .data(_pie(newFilteredData), key);

        pieArcGroup.select('path')
            .transition().duration(1000)
            .attrTween('d', function (d) {
                var interpolate = d3.interpolate(this._current, d);
                var _this = this;
                return function (t) {
                    _this._current = interpolate(t);
                    return _arc(_this._current);
                };
            });

        pieArcGroup = svg.selectAll('g.arc')
            .data(_pie(data), key);

        pieArcGroup.exit()
            .transition()
            .delay(1000)
            .duration(0)
            .remove();
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
        _pie.value(function (d) { return d[_measure[0]]; });
        return chart;
    }

    chart.showLegend = function (value) {
        if (!arguments.length) {
            return _showLegend;
        }
        _showLegend = value;
        return chart;
    }

    chart.legendPosition = function (value) {
        if (!arguments.length) {
            return _legendPosition;
        }
        _legendPosition = value;
        return chart;
    }

    chart.showValueAs = function (value) {
        if (!arguments.length) {
            return _showValueAs;
        }
        _showValueAs = value;
        return chart;
    }

    chart.valueAsArc = function (value) {
        if (!arguments.length) {
            return _valueAsArc;
        }
        _valueAsArc = value;
        return chart;
    }

    chart.valuePosition = function (value) {
        if (!arguments.length) {
            return _valuePosition;
        }
        _valuePosition = value;
        return chart;
    }

    chart.sort = function (value) {
        if (!arguments.length) {
            return _sort;
        }
        _sort = value;
        return chart;
    }

    chart.tooltip = function (value) {
        if (!arguments.length) {
            return _tooltip;
        }
        _tooltip = value;
        return chart;
    }

    return chart;
}

module.exports = donut;

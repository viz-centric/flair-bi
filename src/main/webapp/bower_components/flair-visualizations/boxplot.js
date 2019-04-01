function boxplot() {

    var _NAME = 'boxplot';

    var _config,
        _dimension,
        _measure,
        _sort,
        _tooltip,
        showXaxis,
        showYaxis,
        axisColor,
        showLabels,
        labelColor,
        numberFormat = []
    displayColor = [];

    var x, y;
    var margin = {
        top: 15,
        right: 15,
        bottom: 35,
        left: 35
    };
    var _local_svg, _Local_data, _originalData, horizontalLineConfigs, legendBreakCount = 1;
    var div;
    var width, gWidth, height, gHeight, container;

    var filter = false, filterData = [];
    var threshold = [];

    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.measure(config.measure);
        this.showXaxis(config.showXaxis);
        this.showYaxis(config.showYaxis);
        this.axisColor(config.axisColor);
        this.showLabels(config.showLabels);
        this.labelColor(config.labelColor);
        this.numberFormat(config.numberFormat);
        this.displayColor(config.displayColor);

    }

    var _buildTooltipData = function (datum, chart) {
        var output = "";
        output += "<table>"
            + "<tr>"
            + "<th>" + _dimension[0] + ": </th>"
            + "<td>" + datum[_dimension[0]] + "</td>"
            + "</tr>"
            + "<tr>"
            + "<th>" + _measure[0] + ": </th>"
            + "<td>" + datum[_measure[0]] + "</td>"
            + "</tr>"
            + "<tr>"
            + "<th>" + _measure[1] + ": </th>"
            + "<td>" + datum[_measure[1]] + "</td>"
            + "</tr>"
            + "<tr>"
            + "<th>" + _measure[2] + ": </th>"
            + "<td>" + datum[_measure[2]] + "</td>"
            + "</tr>"
            + "<tr>"
            + "<th>" + _measure[3] + ": </th>"
            + "<td>" + datum[_measure[3]] + "</td>"
            + "</tr>"
            + "<tr>"
            + "<th>" + _measure[4] + ": </th>"
            + "<td>" + datum[_measure[4]] + "</td>"
            + "</tr>"
            + "</table>";

        return output;
    }

    var onLassoStart = function (lasso, chart) {
        return function () {
            if (filter) {
                lasso.items().selectAll('rect')
                    .classed('not_possible', true)
                    .classed('selected', false);
            }
        }
    }

    var onLassoDraw = function (lasso, chart) {
        return function () {
            filter = true;
            lasso.items().selectAll('rect')
                .classed('selected', false);

            lasso.possibleItems().selectAll('rect').each(function (d, i) {
                var item = d3.select(this).node().className.baseVal.split(' ')[0];
                d3.selectAll('rect.' + item)
                    .classed('not_possible', false)
                    .classed('possible', true);

            });
            lasso.possibleItems().selectAll('rect')
                .classed('not_possible', false)
                .classed('possible', true);

            lasso.notPossibleItems().selectAll('rect')
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
                lasso.items().selectAll('rect')
                    .classed('not_possible', false)
                    .classed('possible', false);
            }

            lasso.selectedItems().selectAll('rect')
                .classed('selected', true)

            lasso.notSelectedItems().selectAll('rect');

            var confirm = d3.select('.confirm')
                .style('visibility', 'visible');

            if (data.length > 0) {
                filterData = data;
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

    var clearFilter = function () {
        return function () {
            chart.update(_originalData);
        }
    }

    var _handleMouseOverFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {

            d3.select(this).style('cursor', 'pointer')
                .style('cursor', 'pointer')
                .style('fill', COMMON.HIGHLIGHTER);
            var border = d3.select(this).attr('fill')
            if (tooltip) {
                UTIL.showTooltip(tooltip);
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me), container, border);
            }
        }
    }

    var _handleMouseMoveFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            if (tooltip) {
                var border = d3.select(this).attr('fill')
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me, border), container, border);
            }
        }
    }

    var _handleMouseOutFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            d3.select(this).style('cursor', 'default')


            if (tooltip) {
                UTIL.hideTooltip(tooltip);
            }
        }
    }
    var getXLabels = function (data) {
        return data.map(function (d) { return d[_dimension[0]]; })
    }

    var getGlobalMinMax = function (data) {
        var me = this;

        var allValues = [],
            min,
            max;

        data.forEach(function (d) {
            _measure.forEach(function (m) {
                allValues.push(d[m] || 0);
            })
        });

        min = Math.min.apply(Math, allValues);
        max = Math.max.apply(Math, allValues);

        min = min > 0 ? 0 : min

        return [min, max];
    }

    function chart(selection) {
        _local_svg = selection;

        selection.each(function (data) {
            _Local_data = _originalData = data;
            div = d3.select(this).node().parentNode;

            var svg = _local_svg = d3.select(this);

            width = div.clientWidth,
                height = div.clientHeight;

            svg.attr("width", width).
                attr("height", height);

            var globalMin, globalMax, xLabels;

            var minMax = getGlobalMinMax(data);
            globalMin = minMax[0];
            globalMax = minMax[1];

            xLabels = getXLabels(data);

            gWidth = width - margin.left - margin.right,
                gHeight = height - margin.top - margin.bottom;

            var barWidth = Math.floor(gWidth / data.length / 2);

            if (_tooltip) {
                tooltip = d3.select(this.parentNode).select('.tooltip');
            }

            x = d3
                .scalePoint()
                .domain(xLabels)
                .rangeRound([0, gWidth])
                .padding([0.5]);

            y = d3
                .scaleLinear()
                .domain([globalMin, globalMax])
                .range([gHeight, 0]);

            var plot = svg
                .append("g")
                .attr("class", "plot")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            d3.selectAll('text.tick')
                .attr("transform", "rotate(-20)");

            var boxPlot = plot
                .append("g")
                .attr("transform", "translate(0,0)");

            var verticalLines = boxPlot
                .selectAll(".verticalLines")
                .data(data)
                .enter()
                .append("line")
                .attr('class', 'verticalLines')
                .attr("stroke", "#000")
                .attr("stroke-width", 1)
                .style("stroke-dasharray", 3)
                .attr("fill", "none");

            var box = boxPlot
                .selectAll(".box")
                .data(data)
                .enter()
                .append("g")
                .attr('class', 'box')
                .attr("id", function (d, i) {
                    return "box" + i;
                })
                .on('mouseover', _handleMouseOverFn.call(chart, tooltip, _local_svg))
                .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, _local_svg))
                .on('mouseout', _handleMouseOutFn.call(chart, tooltip, _local_svg))
                .on('click', function (d) {
                    var confirm = d3.select('.confirm')
                        .style('visibility', 'visible');
                    var _filter = _Local_data.filter(function (d1) {
                        return d[_dimension[0]] === d1[_dimension[0]]
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
                })

            var lowerBox = box
                .append("rect")
                .attr("width", barWidth)
                .attr('class', 'lowerBox')
                .attr("x", function (d) {
                    return (
                        x(d[_dimension[0]]) -
                        barWidth / 2
                    );
                })
                .attr("y", function (d) {
                    return y(d[_measure[2]]);
                })
                .attr("fill", displayColor[1])
                .attr("stroke", function (d) {
                    return d3
                        .rgb(displayColor[1])
                        .darker();
                })
                .attr("stroke-width", 1)
                .attr("height", 0)
                .transition()
                .duration(800)
                .ease(d3.easeQuadIn)
                .attr("height", function (d) {
                    return y(d[_measure[1]]) - y(d[_measure[2]]);
                });


            var upperBox = box
                .append("rect")
                .attr("width", barWidth)
                .attr('class', 'upperBox')
                .attr("x", function (d) {
                    return (
                        x(d[_dimension[0]]) -
                        barWidth / 2
                    );
                })
                .attr("fill", displayColor[3])
                .attr("stroke", function (d) {
                    return d3
                        .rgb(displayColor[3])
                        .darker();
                })
                .attr("stroke-width", 1)
                .attr("y", function (d) {
                    return y(d[_measure[2]]);
                })
                .attr("height", 0)
                .transition()
                .duration(800)
                .ease(d3.easeQuadIn)
                .attr("height", function (d) {
                    var height =
                        y(d[_measure[2]]) -
                        y(d[_measure[3]]);
                    return height;
                })
                .attr("y", function (d) {
                    return y(d[_measure[3]]);
                })
                .on("end", afterTransition);

            horizontalLineConfigs = [
                {
                    label: _measure[4],
                    x1: function (d) {
                        return (
                            x(d[_dimension[0]]) -
                            barWidth / 2
                        );
                    },
                    y1: function (d) {
                        return y(d[_measure[4]]);
                    },
                    x2: function (d) {
                        return (
                            x(d[_dimension[0]]) +
                            barWidth / 2
                        );
                    },
                    y2: function (d) {
                        return y(d[_measure[4]]);
                    }
                },
                {
                    label: _measure[2],
                    x1: function (d) {
                        return (
                            x(d[_dimension[0]]) -
                            barWidth / 2
                        );
                    },
                    y1: function (d) {
                        return y(d[_measure[2]]);
                    },
                    x2: function (d) {
                        return (
                            x(d[_dimension[0]]) +
                            barWidth / 2
                        );
                    },
                    y2: function (d) {
                        return y(d[_measure[2]]);
                    }
                },
                {
                    label: _measure[0],
                    x1: function (d) {
                        return (
                            x(d[_dimension[0]]) -
                            barWidth / 2
                        );
                    },
                    y1: function (d) {
                        return y(d[_measure[0]]);
                    },
                    x2: function (d) {
                        return (
                            x(d[_dimension[0]]) +
                            barWidth / 2
                        );
                    },
                    y2: function (d) {
                        return y(d[_measure[0]]);
                    }
                }
            ];

            function afterTransition() {
                verticalLines
                    .attr("x1", function (d) {
                        return x(d[_dimension[0]]);
                    })
                    .attr("y1", function (d) {
                        return y(d[_measure[0]]);
                    })
                    .attr("x2", function (d) {
                        return x(d[_dimension[0]]);
                    })
                    .attr("y2", function (d) {
                        return y(d[_measure[4]]);
                    });

                horizontalLineConfigs.forEach(function (config) {
                    plot
                        .selectAll(".horizontalLines")
                        .data(data)
                        .enter()
                        .append("line")
                        .attr('class', 'horizontalLines')
                        .attr("x1", config.x1)
                        .attr("y1", config.y1)
                        .attr("x2", config.x2)
                        .attr("y2", config.y2)
                        .attr("stroke", function (d) {
                            return displayColor[_measure.indexOf(config.label)];
                        })
                        .attr("stroke-width", 2)
                        .attr("fill", "none");
                });
            }

            plot.append("g")
                .attr("class", "x_axis")
                .attr("transform", "translate(0," + gHeight + ")")
                .call(d3.axisBottom(x))

            plot.append("g")
                .attr("class", "y_axis")
                .call(d3.axisLeft(y).ticks(null, "s"))

            UTIL.setAxisColor(_local_svg, "", "", true, true, true, true);

            d3.select(div).select('.btn-primary')
                .on('click', applyFilter(chart));

            d3.select(div).select('.btn-default')
                .on('click', clearFilter());

            var lasso = d3
                .lasso()
                .hoverSelect(true)
                .closePathSelect(true)
                .closePathDistance(100)
                .items(box)
                .targetArea(svg);

            lasso.on('start', onLassoStart(lasso, chart))
                .on('draw', onLassoDraw(lasso, chart))
                .on('end', onLassoEnd(lasso, chart));

            boxPlot.call(lasso);
        });
    }

    chart._getName = function () {
        return _NAME;
    }

    chart.update = function (data) {

        _Local_data = data,
            filterData = [];

        var minMax = getGlobalMinMax(data);
        globalMin = minMax[0];
        globalMax = minMax[1];

        xLabels = getXLabels(data);
        var plot = _local_svg.select('.plot');
        gWidth = width - margin.left - margin.right,
            gHeight = height - margin.top - margin.bottom;

        var barWidth = Math.floor(gWidth / data.length / 2);

        if (_tooltip) {
            tooltip = d3.select(this.parentNode).select('.tooltip');
        }

        x = d3
            .scalePoint()
            .domain(xLabels)
            .rangeRound([0, gWidth])
            .padding([0.5]);

        y = d3
            .scaleLinear()
            .domain([globalMin, globalMax])
            .range([gHeight, 0]);

        var verticalLines = plot.selectAll('.verticalLines')
            .data(data);

        verticalLines.exit().remove();

        verticalLines
            .attr("x1", function (d) {
                return x(d[_dimension[0]]);
            })
            .attr("y1", function (d) {
                return y(d[_measure[0]]);
            })
            .attr("x2", function (d) {
                return x(d[_dimension[0]]);
            })
            .attr("y2", function (d) {
                return y(d[_measure[4]]);
            });


        var verticalLinesNew = verticalLines.enter().append('line')
            .attr('class', 'verticalLines');

        verticalLinesNew
            .attr("stroke", "#000")
            .attr("stroke-width", 1)
            .style("stroke-dasharray", 3)
            .attr("fill", "none")
            .attr("x1", function (d) {
                return x(d[_dimension[0]]);
            })
            .attr("y1", function (d) {
                return y(d[_measure[0]]);
            })
            .attr("x2", function (d) {
                return x(d[_dimension[0]]);
            })
            .attr("y2", function (d) {
                return y(d[_measure[4]]);
            });


        var horizontalLines = plot.selectAll('.horizontalLines')
            .data(data);

        horizontalLines.exit().remove();

        horizontalLines.enter().append('line')
            .attr('class', 'horizontalLines');

        var box = plot.selectAll('.box')
            .data(data);

        box.exit().remove();

        box.selectAll('.lowerBox')

            .attr("width", barWidth)
            .classed('selected', false)
            .attr('class', 'lowerBox')
            .attr("x", function (d) {
                return (
                    x(d[_dimension[0]]) -
                    barWidth / 2
                );
            })
            .attr("y", function (d) {
                return y(d[_measure[2]]);
            })
            .attr("fill", displayColor[1])
            .attr("stroke", function (d) {
                return d3
                    .rgb(displayColor[1])
                    .darker();
            })
            .attr("stroke-width", 1)
            .attr("height", 0)
            .transition()
            .duration(800)
            .ease(d3.easeQuadIn)
            .attr("height", function (d) {
                return y(d[_measure[1]]) - y(d[_measure[2]]);
            });



        box.selectAll('.upperBox')
            .attr("width", barWidth)
            .classed('selected', false)
            .attr("x", function (d) {
                return (
                    x(d[_dimension[0]]) -
                    barWidth / 2
                );
            })
            .attr("fill", displayColor[3])
            .attr("stroke", function (d) {
                return d3
                    .rgb(displayColor[3])
                    .darker();
            })
            .attr("stroke-width", 1)
            .attr("y", function (d) {
                return y(d[_measure[2]]);
            })
            .attr("height", 0)
            .transition()
            .duration(800)
            .ease(d3.easeQuadIn)
            .attr("height", function (d) {
                var height =
                    y(d[_measure[2]]) -
                    y(d[_measure[3]]);
                return height;
            })
            .attr("y", function (d) {
                return y(d[_measure[3]]);
            })


        var newBox = box.enter().append('g')
            .attr('class', 'box')
            .attr("id", function (d, i) {
                return "box" + i;
            })
            .on('mouseover', _handleMouseOverFn.call(chart, tooltip, _local_svg))
            .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, _local_svg))
            .on('mouseout', _handleMouseOutFn.call(chart, tooltip, _local_svg))

        var lowerBox = newBox
            .append("rect")
            .attr("width", barWidth)
            .attr('class', 'lowerBox')
            .attr("x", function (d) {
                return (
                    x(d[_dimension[0]]) -
                    barWidth / 2
                );
            })
            .attr("y", function (d) {
                return y(d[_measure[2]]);
            })
            .attr("fill", displayColor[1])
            .attr("stroke", function (d) {
                return d3
                    .rgb(displayColor[1])
                    .darker();
            })
            .attr("stroke-width", 1)
            .attr("height", 0)
            .transition()
            .duration(800)
            .ease(d3.easeQuadIn)
            .attr("height", function (d) {
                return y(d[_measure[1]]) - y(d[_measure[2]]);
            });

        var upperBox = newBox
            .append("rect")
            .attr("width", barWidth)
            .attr('class', 'upperBox')
            .attr("x", function (d) {
                return (
                    x(d[_dimension[0]]) -
                    barWidth / 2
                );
            })
            .attr("fill", displayColor[3])
            .attr("stroke", function (d) {
                return d3
                    .rgb(displayColor[3])
                    .darker();
            })
            .attr("stroke-width", 1)
            .attr("y", function (d) {
                return y(d[_measure[2]]);
            })
            .attr("height", 0)
            .transition()
            .duration(800)
            .ease(d3.easeQuadIn)
            .attr("height", function (d) {
                var height =
                    y(d[_measure[2]]) -
                    y(d[_measure[3]]);
                return height;
            })
            .attr("y", function (d) {
                return y(d[_measure[3]]);
            })

        plot.select('.x_axis')
            .transition()
            .duration(1000)
            .call(d3.axisBottom(x));

        plot.select('.y_axis')
            .transition()
            .duration(1000)
            .call(d3.axisLeft(y).ticks(null, "s"));

        horizontalLineConfigs.forEach(function (config) {
            horizontalLines
                .attr("x1", config.x1)
                .attr("y1", config.y1)
                .attr("x2", config.x2)
                .attr("y2", config.y2)
        });
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
    chart.tooltip = function (value) {
        if (!arguments.length) {
            return _tooltip;
        }
        _tooltip = value;
        return chart;
    }
    chart.showXaxis = function (value) {
        if (!arguments.length) {
            return showXaxis;
        }
        showXaxis = value;
        return chart;
    }
    chart.showYaxis = function (value) {
        if (!arguments.length) {
            return showYaxis;
        }
        showYaxis = value;
        return chart;
    }
    chart.axisColor = function (value) {
        if (!arguments.length) {
            return axisColor;
        }
        axisColor = value;
        return chart;
    }
    chart.showLabels = function (value) {
        if (!arguments.length) {
            return showLabels;
        }
        showLabels = value;
        return chart;
    }
    chart.labelColor = function (value) {
        if (!arguments.length) {
            return labelColor;
        }
        labelColor = value;
        return chart;
    }

    chart.numberFormat = function (value, measure) {
        return UTIL.baseAccessor.call(numberFormat, value, measure, _measure);
    }

    chart.displayColor = function (value, measure) {
        return UTIL.baseAccessor.call(displayColor, value, measure, _measure);
    }

    return chart;
}
var COMMON = require('../extras/common.js')(),
    UTIL = require('../extras/util.js')(),
    LEGEND = require('../extras/legend.js')();

function combo() {

    var _NAME = 'combo';

    var _config,
        _dimension,
        _measure,
        _showLegend,
        _legendPosition,
        _sort,
        _tooltip,
        _showXaxis,
        _showYaxis,
        _showXaxisLabel,
        _showYaxisLabel,
        _xAxisColor,
        _yAxisColor,
        _showGrid,
        _stacked,
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
        _pointType,
        _originalData;

    var _local_svg, _Local_data;
    var x0, x1, y;

    var parentWidth, parentHeight, plotWidth, plotHeight;

    var legendSpace = 20, axisLabelSpace = 20, offsetX = 16, offsetY = 3, div;

    var filter = false, filterData = [];

    var measuresBar = [], measuresLine = [];

    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.measure(config.measure);
        this.showLegend(config.showLegend);
        this.legendPosition(config.legendPosition);

        this.showXaxis(config.showXaxis);
        this.showYaxis(config.showYaxis);
        this.showXaxisLabel(config.showXaxisLabel);

        this.showYaxisLabel(config.showYaxisLabel);
        this.xAxisColor(config.xAxisColor);
        this.yAxisColor(config.yAxisColor);
        this.displayName(config.displayName);
        this.showYaxis(config.showYaxis);
        this.showXaxisLabel(config.showXaxisLabel);

        this.showValues(config.showValues);
        this.displayNameForMeasure(config.displayNameForMeasure);
        this.fontStyle(config.fontStyle);
        this.fontWeight(config.fontWeight);
        this.numberFormat(config.numberFormat);
        this.textColor(config.textColor);
        this.displayColor(config.displayColor);
        this.borderColor(config.borderColor);
        this.fontSize(config.fontSize);
        this.comboChartType(config.comboChartType)
        this.lineType(config.lineType);
        this.pointType(config.pointType)
        this.legendData(config.displayColor, config.measure);
    }
    var getPointType = function (index) {
        var symbol = null;

        switch (_pointType[index].toLowerCase()) {
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

    var getXLabels = function (data) {
        return data.map(function (d) { return d[_dimension[0]]; })
    }

    var _buildTooltipData = function (datum, chart) {
        var output = "";
        var dimension = datum.dimension != undefined ? datum.dimension : datum.data[_dimension[0]],
            measure = datum.id != undefined ? datum.id : datum.tag,
            measurevalue = datum._measure != undefined ? datum._measure : datum.data[datum.tag];
        output += "<table><tr>"
            + "<th>" + _dimension[0] + ": </th>"
            + "<td>" + dimension + "</td>"
            + "</tr><tr>"
            + "<th>" + measure + ": </th>"
            + "<td>" + measurevalue + "</td>"
            + "</tr></table>";

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

            var _filter = [];
            var keys = UTIL.getMeasureList(data[0].data, _dimension);
            data.forEach(function (d) {

                var obj = new Object();
                var temp = d.data[_dimension[0]];
                var searchObj = _filter.find(o => o[_dimension[0]] === temp);
                if (searchObj == undefined) {
                    obj[_dimension[0]] = d.data[_dimension[0]];
                    for (var index = 0; index < keys.length; index++) {
                        obj[keys[index]] = d.data[keys[index]];
                    }
                    _filter.push(obj)
                }
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
            var border = UTIL.getDisplayColor(_measure.indexOf(d.measure), _displayColor)
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
                var border = UTIL.getDisplayColor(_measure.indexOf(d.tag), _displayColor)
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me), container, border);
            }
        }
    }

    var _handleMouseOutFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            d3.select(this).style('cursor', 'default')
                .style('fill', function (d1, i) {
                    return UTIL.getDisplayColor(_measure.indexOf(d1.tag), _displayColor);
                })
                .style('stroke', function (d1, i) {
                    return UTIL.getBorderColor(_measure.indexOf(d1.tag), _borderColor);
                });

            if (tooltip) {
                UTIL.hideTooltip(tooltip);
            }
        }
    }

    function chart(selection) {
        _local_svg = selection;

        selection.each(function (data) {
            chart._Local_data = _originalData = data;
            var margin = {
                top: 0,
                right: 0,
                bottom: 0,
                left: 45
            };

            var div = d3.select(this).node().parentNode;

            var svg = d3.select(this),
                width = div.clientWidth,
                height = div.clientHeight;

            parentWidth = width - 2 * COMMON.PADDING - margin.left;
            parentHeight = (height - 2 * COMMON.PADDING - axisLabelSpace * 2);

            svg.attr('width', width)
                .attr('height', height)

            d3.select(div).append('div')
                .attr('class', 'sort_selection');

            d3.select(div).append('div')
                .attr('class', 'arrow-down');

            var str = UTIL.createAlert($(div).attr('id'), _measure);
            $(div).append(str);

            $(document).on('click', 'svg', function (e) {
                if ($("#myonoffswitch").prop('checked') == false) {
                    var element = e.target
                    if (element.tagName == "svg") {
                        $('#Modal_' + $(div).attr('id') + ' .measure').val('')
                        $('#Modal_' + $(div).attr('id') + ' .threshold').val('')
                        $('#Modal_' + $(div).attr('id') + ' .measure').attr('disabled', false)
                        $('#Modal_' + $(div).attr('id')).modal('toggle');
                    }
                }
            });

            $(document).on('click', '#Modal_' + $(div).attr('id') + ' .ThresholdSubmit', function (e) {
                var newValue = $('#Modal_' + $(div).attr('id') + ' .threshold').val();
                var obj = new Object()
                obj.measure = $('#Modal_' + $(div).attr('id') + ' .measure').val()
                obj.threshold = newValue;
                threshold.push(obj);
                $('#Modal_' + $(div).attr('id')).modal('toggle');
            });

            var container = svg.append('g')
                .attr('transform', 'translate(' + COMMON.PADDING + ', ' + COMMON.PADDING + ')');

            var legendWidth = 0,
                legendHeight = 0,
                legendBreakCount;

            plotWidth = parentWidth;
            plotHeight = parentHeight;

            if (_showLegend) {
                var clusteredverticalbarLegend = LEGEND.bind(chart);

                var result = clusteredverticalbarLegend(_legendData, container, {
                    width: parentWidth,
                    height: parentHeight,
                    legendBreakCount: legendBreakCount
                });

                legendWidth = result.legendWidth;
                legendHeight = result.legendHeight;
                legendBreakCount = result.legendBreakCount;

                switch (_legendPosition) {
                    case 'top':
                        plotHeight = parentHeight - legendHeight - axisLabelSpace;
                        break;
                    case 'bottom':
                        plotHeight = parentHeight - legendHeight - axisLabelSpace * 2;
                        break;
                    case 'right':
                    case 'left':
                        plotWidth = parentWidth - legendWidth;
                        break;
                }

                if ((_legendPosition == 'Top') || (_legendPosition == 'Bottom')) {
                    plotWidth = parentWidth;
                    plotHeight = parentHeight - 3 * axisLabelSpace;
                    legendSpace = 20;
                } else if ((_legendPosition == 'Left') || (_legendPosition == 'Right')) {
                    var legend = _local_svg.selectAll('.item');
                    legendSpace = legend.node().parentNode.getBBox().width;
                    plotWidth = (parentWidth - legendSpace) - margin.left + axisLabelSpace;
                    plotHeight = parentHeight;

                    legend.attr('transform', function (d, i) {
                        if (_legendPosition == 'Left') {
                            return 'translate(0, ' + i * 20 + ')';

                        }
                        else if (_legendPosition == 'Right') {
                            return 'translate(' + (parentWidth - legendSpace + axisLabelSpace) + ', ' + i * 20 + ')';
                        }
                    });
                }
            }
            else {
                legendSpace = 0;
                plotWidth = parentWidth;
                plotHeight = parentHeight;
            }

            if (_tooltip) {
                tooltip = d3.select(this.parentNode).select('#tooltip');
            }
            chart.drawViz = function (element) {
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
                    .on('mouseover', _handleMouseOverFn.call(chart, tooltip, svg))
                    .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, svg))
                    .on('mouseout', _handleMouseOutFn.call(chart, tooltip, svg))
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
            chart.drawPlot = function (data) {
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

                chart.drawViz(bar)

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
                    .on('mouseover', _handleMouseOverFn.call(chart, tooltip, svg))
                    .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, svg))
                    .on('mouseout', _handleMouseOutFn.call(chart, tooltip, svg));

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

                UTIL.setAxisColor(svg, _yAxisColor, _xAxisColor, _showYaxis, _showXaxis, _showYaxis, _showXaxis);
                svg.select('g.combo-sort').remove();
                var sortButton = container.append('g')
                    .attr('class', 'combo-sort')
                    .attr('transform', function () {
                        return 'translate(0, ' + parseInt((parentHeight - 2 * COMMON.PADDING + 20 + (legendBreakCount * 20))) + ')';
                    })

                var ascendingSort = sortButton.append('svg:text')
                    .attr('fill', '#afafaf')
                    .attr('cursor', 'pointer')
                    .style('font-family', 'FontAwesome')
                    .style('font-size', 12)
                    .attr('transform', function () {
                        return 'translate(' + (parentWidth - 3 * offsetX) + ', ' + 2 * axisLabelSpace + ')';
                    })
                    .style('text-anchor', 'end')
                    .text(function () {
                        return "\uf161";
                    })
                    .on('click', UTIL.toggleSortSelection(me, 'ascending', chart.drawPlot, svg, keys, _Local_data))


                var descendingSort = sortButton.append('svg:text')
                    .attr('fill', '#afafaf')
                    .attr('cursor', 'pointer')
                    .style('font-family', 'FontAwesome')
                    .style('font-size', 12)
                    .attr('transform', function () {
                        return 'translate(' + (parentWidth - 1.5 * offsetX) + ', ' + 2 * axisLabelSpace + ')';
                    })
                    .style('text-anchor', 'end')
                    .text(function () {
                        return "\uf160";
                    })
                    .on('click', UTIL.toggleSortSelection(me, 'descending', chart.drawPlot, svg, keys, _Local_data))

                var resetSort = sortButton.append('svg:text')
                    .attr('fill', '#afafaf')
                    .attr('cursor', 'pointer')
                    .style('font-family', 'FontAwesome')
                    .style('font-size', 12)
                    .attr('transform', function () {
                        return 'translate(' + parentWidth + ', ' + 2 * axisLabelSpace + ')';
                    })
                    .style('text-anchor', 'end')
                    .text(function () {
                        return "\uf0c9";
                    })
                    .on('click', function () {
                        d3.select(me.parentElement).select('.combo-plot').remove();
                        chart.drawPlot.call(me, _Local_data);
                    });

                d3.select(div).select('.btn-primary')
                    .on('click', applyFilter(chart));

                d3.select(div).select('.btn-default')
                    .on('click', clearFilter());

                var lasso = d3.lasso()
                    .hoverSelect(true)
                    .closePathSelect(true)
                    .closePathDistance(100)
                    .items(bar)
                    .targetArea(svg);

                lasso.on('start', onLassoStart(lasso, chart))
                    .on('draw', onLassoDraw(lasso, chart))
                    .on('end', onLassoEnd(lasso, chart));

                svg.call(lasso);
            }

            chart.drawPlot.call(this, data)
        });
    }

    chart._legendInteraction = function (event, data) {
        var clustered = d3.selectAll('g.bar')
            .filter(function (d) {
                return d.tag === data;
            });

        var line = d3.selectAll('.line')
            .filter(function (d, i) {
                return d[i].tag === data;
            });

        if (event === 'mouseover') {
            clustered.select('rect')
                .style('fill', COMMON.HIGHLIGHTER);
            line
                .style("stroke-width", "2.5px")
                .style('stroke', COMMON.HIGHLIGHTER);

        } else if (event === 'mousemove') {
            // do something
        } else if (event === 'mouseout') {
            clustered.select('rect')
                .style('fill', function (d, i) {
                    return UTIL.getDisplayColor(_measure.indexOf(d.tag), _displayColor);
                });
            line
                .style("stroke-width", "1.5px")
                .style('stroke', function (d, i) {
                    return UTIL.getBorderColor(_measure.indexOf(d[0]['tag']), _borderColor);
                });
        } else if (event === 'click') {

        }
    }

    chart._getName = function () {
        return _NAME;
    }

    chart.update = function (data) {

        chart._Local_data = data,
            svg = _local_svg;
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

        var plot = svg.select('.plot')
        var chartploat = svg.select('.chart')
        var labelStack = [];

        var areaGenerator = d3.area()
            .curve(d3.curveLinear)
            .x(function (d, i) {
                return x0(d['data'][_dimension[0]]) + x0.bandwidth() / 2;
            })
            .y0(plotHeight)
            .y1(function (d) {
                return y(d['data'][d.tag[0].tag]);
            });

        var lineGenerator = d3.line()
            .curve(d3.curveLinear)
            .x(function (d, i) {
                return x0(d['data'][_dimension[0]]) + x0.bandwidth() / 2;
            })
            .y(function (d, i) {
                return y(d['data'][d.tag[0].tag])!=undefined?y(d['data'][d.tag[0].tag]):y(d.tag[0].tag[0].tag);
            });

        var area = plot.selectAll('path.area')
            .datum(function (d, i) {
                return data.map(function (datum) { return { "tag": d, "data": datum }; });
            })
            .attr('d', areaGenerator);

        plot.selectAll('path.point').remove()


        var line = plot.selectAll('path.line')
            .datum(function (d, i) {
                return data.map(function (datum) { return { "tag": d, "data": datum }; });
            })
            .attr('d', lineGenerator);

        var clusterBar = chartploat.selectAll('g.cluster_bar')
            .data(data)

        clusterBar.enter().append('g')
            .attr('class', 'cluster_bar')
            .attr('transform', function (d) {
                return 'translate(' + x0(d[_dimension[0]]) + ', 0)';
            });

        clusterBar.exit().remove();

        clusterBar = plot.selectAll('g.cluster_bar');

        var bar = clusterBar.selectAll('g.bar')
            .data(function (d) {
                return measuresBar
                    .filter(function (m) { return labelStack.indexOf(m) == -1; })
                    .map(function (m) { return { "tag": m, "data": d }; });
            })

        bar.select('rect')
            .attr('width', x1.bandwidth())
            .style('stroke-width', 1)
            .attr('x', function (d, i) {
                return x1(measuresBar[measuresBar.indexOf(d.tag)]);
            })
            .attr('y', function (d, i) {
                if ((d["data"][d.tag] === null) || (isNaN(d["data"][d.tag]))) {
                    return 0;
                } else if (d["data"][d.tag]> 0) {
                    return y(d["data"][d.tag]);
                }
                return y(0);
            })
            .attr('height', function (d, i) {
                return Math.abs(y(0) - y(d["data"][d.tag]));
            })
            .classed('selected', false)
            .classed('possible', false);


        var newBars = bar.enter().append('g')
            .attr('class', 'bar');

        chart.drawViz(newBars)

        d3.selectAll('g.cluster_bar')
            .attr('transform', function (d) {
                return 'translate(' + x0(d[_dimension[0]]) + ', 0)';
            });

        plot.select('.x_axis')
            .transition()
            .duration(1000)
            .call(d3.axisBottom(x0));

        plot.select('.y_axis')
            .transition()
            .duration(1000)
            .call(d3.axisLeft(y).ticks(null, "s"));

        UTIL.setAxisColor(svg, _yAxisColor, _xAxisColor, _showYaxis, _showXaxis);
        UTIL.displayThreshold(threshold, data, keys);
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

    chart.showXaxis = function (value) {
        if (!arguments.length) {
            return _showXaxis;
        }
        _showXaxis = value;
        return chart;
    }

    chart.showYaxis = function (value) {
        if (!arguments.length) {
            return _showYaxis;
        }
        _showYaxis = value;
        return chart;
    }

    chart.showXaxisLabel = function (value) {
        if (!arguments.length) {
            return _showXaxisLabel;
        }
        _showXaxisLabel = value;
        return chart;
    }

    chart.showYaxisLabel = function (value) {
        if (!arguments.length) {
            return _showYaxisLabel;
        }
        _showYaxisLabel = value;
        return chart;
    }

    chart.xAxisColor = function (value) {
        if (!arguments.length) {
            return _xAxisColor;
        }
        _xAxisColor = value;
        return chart;
    }

    chart.yAxisColor = function (value) {
        if (!arguments.length) {
            return _yAxisColor;
        }
        _yAxisColor = value;
        return chart;
    }

    chart.showGrid = function (value) {
        if (!arguments.length) {
            return _tooltip;
        }
        _showGrid = value;
        return chart;
    }

    chart.stacked = function (value) {
        if (!arguments.length) {
            return _tooltip;
        }
        _stacked = value;
        return chart;
    }

    chart.displayName = function (value) {
        if (!arguments.length) {
            return _tooltip;
        }
        _displayName = value;
        return chart;
    }

    chart.legendData = function (measureConfig, measureName) {
        _legendData = {
            measureConfig: measureConfig,
            measureName: measureName
        }
        return _legendData;
    }

    chart.showValues = function (value) {
        if (!arguments.length) {
            return _showValues;
        }
        _showValues = value;
        return chart;
    }

    chart.displayNameForMeasure = function (value) {
        if (!arguments.length) {
            return _displayNameForMeasure;
        }
        _displayNameForMeasure = value;
        return chart;
    }

    chart.fontStyle = function (value) {
        if (!arguments.length) {
            return _fontStyle;
        }
        _fontStyle = value;
        return chart;
    }

    chart.fontWeight = function (value) {
        if (!arguments.length) {
            return _fontWeight;
        }
        _fontWeight = value;
        return chart;
    }

    chart.numberFormat = function (value) {
        if (!arguments.length) {
            return _numberFormat;
        }
        _numberFormat = value;
        return chart;
    }

    chart.textColor = function (value) {
        if (!arguments.length) {
            return _textColor;
        }
        _textColor = value;
        return chart;
    }

    chart.displayColor = function (value) {
        if (!arguments.length) {
            return _displayColor;
        }
        _displayColor = value;
        return chart;
    }

    chart.borderColor = function (value) {
        if (!arguments.length) {
            return _borderColor;
        }
        _borderColor = value;
        return chart;
    }

    chart.fontSize = function (value) {
        if (!arguments.length) {
            return _fontSize;
        }
        _fontSize = value;
        return chart;
    }

    chart.comboChartType = function (value) {
        if (!arguments.length) {
            return _comboChartType;
        }
        _comboChartType = value;
        return chart;
    }

    chart.lineType = function (value) {
        if (!arguments.length) {
            return _lineType;
        }
        _lineType = value;
        return chart;
    }
    chart.pointType = function (value) {
        if (!arguments.length) {
            return _pointType;
        }
        _pointType = value;
        return chart;
    }

    return chart;
}

module.exports = combo;

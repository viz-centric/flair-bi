var COMMON = require('../extras/common.js')(),
    UTIL = require('../extras/util.js')();

function sankey() {

    var _NAME = 'sankey';

    var _config,
        dimension = [],
        measure = [],
        showLabels = [],
        fontStyle = [],
        fontWeight = [],
        fontSize = [],
        textColor = [],
        colorPattern,
        displayColor,
        borderColor,
        numberFormat,
        _sort,
        _tooltip;


    var _local_svg, _Local_data, _originalData, _localLabelStack = [];

    var parentWidth, parentHeight, parentWidth, parentHeight;
    var sankey, path, gradientColor, link
    var margin = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
    };

    var filter = false, filterData = [];

    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.measure(config.measure);
        this.showLabels(config.showLabels);
        this.fontStyle(config.fontStyle);
        this.fontWeight(config.fontWeight);
        this.fontSize(config.fontSize);
        this.textColor(config.textColor);
        this.colorPattern(config.colorPattern);
        this.displayColor(config.displayColor);
        this.borderColor(config.borderColor);

        this.numberFormat(config.numberFormat);
    }

    var _buildTooltipData = function (datum, chart, element) {
        var output = "";
        if (element == "link") {
            output += "<table><tr>"
                + "<th>" + datum.source.nodeType + ": </th>"
                + "<td>" + datum.source.name + "</td>"
                + "</tr><tr>"
                + "<th>" + datum.target.nodeType + ": </th>"
                + "<td>" + datum.target.name + "</td>"
                + "</tr><tr>"
                + "<th>" + measure[0] + ": </th>"
                + "<td>" + datum.value + "</td>"
                + "</tr>"
                + "</table>";
        }
        else {
            output += "<table><tr>";
            if (datum.nodeType == dimension[0]) {
                output += "<th>" + datum.nodeType + ": </th>"
                    + "<td>" + datum.name + "</td>"
                    + "</tr>";
                for (var index = 0; index < datum.sourceLinks.length; index++) {
                    output += "<tr><th>" + datum.sourceLinks[index].target.name + ": </th>"
                        + "<td>" + datum.sourceLinks[index].target.value + "</td>"
                        + "</tr>";
                }
                output += "</table>";
            }
            else {
                output += "<th>" + dimension[1] + ": </th>"
                    + "<td>" + datum.name + "</td>"
                    + "</tr><tr>"
                    + "<th>" + measure[0] + ": </th>"
                    + "<td>" + datum.value + "</td>"
                    + "</tr>"
                    + "</table>";
            }
        }
        return output;
    }

    var onLassoStart = function (lasso, scope) {
        return function () {
            if (filter) {
                lasso.items()
                    .classed('not_possible', true)
                    .classed('selected', false);
            }
        }
    }

    var onLassoDraw = function (lasso, scope) {
        return function () {
            filter = true;
            lasso.items()
                .classed('selected', false);

            lasso.possibleItems()
                .classed('not_possible', false)
                .classed('possible', true);

            lasso.notPossibleItems()
                .classed('not_possible', true)
                .classed('possible', false);
        }
    }

    var onLassoEnd = function (lasso, scope) {
        return function () {
            var data = lasso.selectedItems().data();
            if (!filter) {
                return;
            }
            if (data.length > 0) {
                lasso.items()
                    .classed('not_possible', false)
                    .classed('possible', false);
            }

            lasso.selectedItems()
                .classed('selected', true)

            lasso.notSelectedItems()

            var confirm = $(scope).parent().find('div.confirm')
                .css('visibility', 'visible');

            var _filter = [];
            if (data.length > 0) {

                data.forEach(function (d) {
                    if (d.nodeType == dimension[0]) {
                        _Local_data.map(function (val) {
                            if (dimension[0] == d.nodeType && val[dimension[0]] == d.name) {
                                var searchObj = _filter.find(o => o[dimension[0]] == val[dimension[0]] && o[dimension[1]] == val[dimension[1]])
                                if (searchObj == undefined) {
                                    _filter.push(val)
                                }
                            }
                        })
                    }
                    else {
                        _Local_data.map(function (val) {
                            if (dimension[1] == d.nodeType && val[dimension[1]] == d.name) {
                                var searchObj = _filter.find(o => o[dimension[0]] == val[dimension[0]] && o[dimension[1]] == val[dimension[1]])
                                if (searchObj == undefined) {
                                    _filter.push(val)
                                }
                            }
                        })
                    }
                });
            }
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

    var _handleMouseOverFn = function (tooltip, container, element) {
        var me = this;
        return function (d, i) {
            d3.select(this).style('cursor', 'pointer');
            var border = d3.select(this).attr('fill')
            if (tooltip) {
                UTIL.showTooltip(tooltip);
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me, element), container, border);
            }
        }
    }

    var _handleMouseMoveFn = function (tooltip, container, element) {
        var me = this;

        return function (d, i) {
            if (tooltip) {
                var border = d3.select(this).attr('fill')
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me, element), container, border);
            }
        }
    }

    var _handleMouseOutFn = function (tooltip, container, element) {
        var me = this;

        return function (d, i) {
            d3.select(this).style('cursor', 'default')

            if (tooltip) {
                UTIL.hideTooltip(tooltip);
            }
        }
    }
    var getUniqueItems = function (array) {
        var filteredArray = array.filter(function (item, pos) {
            return array.indexOf(item) == pos
        });

        return filteredArray;
    }
    var getSankeyData = function (data) {
        var me = this;

        var nodes = [],
            links = [],
            nodeOffsets = [];

        dimension.forEach(function (_dimension, index) {
            var allDimensions = data.map(function (d, i) {
                return d[_dimension];
            });

            nodeOffsets.push(nodes.length);

            var sourceUniqueDimensions = [];
            sourceUniqueDimensions = getUniqueItems(allDimensions);
            sourceUniqueDimensions.forEach(function (d, i) {
                var counter = nodeOffsets[index];
                nodes.push({
                    'node': counter++,
                    'name': d == null ? 'null' : d,
                    'nodeType': _dimension
                });
            });

            var targetUniqueDimensions = getUniqueItems(data.map(function (d, i) {
                return d[dimension[index + 1]];
            }));

            if (index != (dimension.length - 1)) {
                data.forEach(function (d, i) {
                    var link = {};
                    link.source = nodeOffsets[index] + sourceUniqueDimensions.indexOf(d[_dimension]);
                    link.target = nodes.length + targetUniqueDimensions.indexOf(d[dimension[index + 1]]);
                    link.value = (isNaN(d[measure]) || d[measure] === null) ? 0 : d[measure];
                    links.push(link);
                });
            }
        });

        return { nodes: nodes, links: links };
    }
    var getFillColor = function (d, i) {
        if (colorPattern == 'single_color') {
            return displayColor;
        } else if (colorPattern == 'unique_color') {
            return d3.schemeCategory20c[i % (d3.schemeCategory20c.length)];
        } else if (colorPattern == 'gradient_color') {
            return gradientColor(d.value);
        }
    }

    var drag = d3.drag()
        .subject(function (d) {
            return d;
        })
        .on('start', function () {
            startTime = (new Date()).getTime();
            this.parentNode.appendChild(this);
        })
        .on('drag', function (d) {
            d3.select(this).attr('transform', 'translate(' + d.x + ', ' + (d.y = Math.max(0, Math.min(parentHeight - d.dy, d3.event.y))
            ) + ')');
            sankey.relayout();
            link.attr('d', path);
        })

    function chart(selection) {
        _local_svg = selection;

        selection.each(function (data) {
            _Local_data = _originalData = data;

            div = d3.select(this).node().parentNode;

            var _local_svg = d3.select(this),
                width = div.clientWidth,
                height = div.clientHeight;

            var data = getSankeyData(data);

            var svg = d3.select(this);

            if (_tooltip) {
                tooltip = d3.select(this.parentNode).select('#tooltip');
            }
            var me=this;
            svg.selectAll('g').remove();

            svg.attr('width', width)
                .attr('height', height);

            parentWidth = width - margin.left - margin.right,
                parentHeight = height - margin.top - margin.bottom;

            var _filter = UTIL.createFilterElement()
            $(div).append(_filter);

            var container = svg.append('g')
                .attr('class', 'plot')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            sankey = d3.sankey()
                .nodeWidth(12)
                .nodePadding(4)
                .size([parentWidth, parentHeight]);

            path = sankey.link();

            sankey.nodes(data.nodes)
                .links(data.links)
                .layout(32);

            gradientColor = d3.scaleLinear()

            gradientColor.range([
                d3.rgb(displayColor).brighter(),
                d3.rgb(displayColor).darker()
            ])

            gradientColor.domain(d3.extent(data.nodes, function (d) {
                return d.value;
            }));

            var nodeDistance = data.nodes[0].sourceLinks[0].target.x - data.nodes[0].x - sankey.nodeWidth();

            link = container.append('g').selectAll('.link')
                .data(data.links)
                .enter().append('path')
                .attr('class', 'link')
                .attr('d', path)
                .style('stroke-width', function (d) { return Math.max(1, d.dy); })
                .sort(function (a, b) { return b.dy - a.dy; })
                .on('mouseover', _handleMouseOverFn.call(chart, tooltip, _local_svg, 'link'))
                .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, _local_svg, 'link'))
                .on('mouseout', _handleMouseOutFn.call(chart, tooltip, _local_svg, 'link'))
                .on('click', function (d) {

                    var confirm = d3.select('.confirm')
                        .style('visibility', 'visible');

                    if (d.nodeType == dimension[0]) {
                        _Local_data.map(function (val) {
                            if (dimension[0] == d.nodeType && val[dimension[0]] == d.name) {
                                var searchObj = _filter.find(o => o[dimension[0]] == val[dimension[0]] && o[dimension[1]] == val[dimension[1]])
                                if (searchObj == undefined) {
                                    _filter.push(val)
                                }
                            }
                        })
                    }
                    else {
                        _Local_data.map(function (val) {
                            if (dimension[1] == d.nodeType && val[dimension[1]] == d.name) {
                                var searchObj = _filter.find(o => o[dimension[0]] == val[dimension[0]] && o[dimension[1]] == val[dimension[1]])
                                if (searchObj == undefined) {
                                    _filter.push(val)
                                }
                            }
                        })
                    }
                })

            var node = container.append('g').selectAll('.node')
                .data(data.nodes)
                .enter().append('g')
                .attr('class', 'node')
                .attr('transform', function (d) {

                    return 'translate(' + d.x + ',' + d.y + ')';
                })
                .call(drag);

            node.append('rect')
                .attr('width', sankey.nodeWidth())
                .attr('height', function (d) { return d.dy; })
                .style('cursor', 'move')
                .style('fill', function (d, i) {
                    return getFillColor(d, i);
                })
                .style('stroke', function (d) {
                    return borderColor;
                })
                .on('mouseover', _handleMouseOverFn.call(chart, tooltip, _local_svg, 'node'))
                .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, _local_svg, 'node'))
                .on('mouseout', _handleMouseOutFn.call(chart, tooltip, _local_svg, 'node'))
                .on('click', function (d) {
                    var confirm = d3.select('.confirm')
                        .style('visibility', 'visible');
                    var rect = d3.select(this)
                    if (rect.classed('selected')) {
                        rect.classed('selected', false);
                        if (d.nodeType == dimension[0]) {
                            _Local_data.map(function (val) {
                                filterData = filterData.filter(function (val) {
                                    if (d.name != val[dimension[0]]) {
                                        return val;
                                    }
                                })
                            })
                        }
                        else {
                            _Local_data.map(function (val) {
                                filterData = filterData.filter(function (val) {
                                    if (d.name != val[dimension[1]]) {
                                        return val;
                                    }
                                })
                            })
                        }
                    }
                    else {
                        rect.classed('selected', true);
                        if (d.nodeType == dimension[0]) {
                            _Local_data.map(function (val) {
                                if (dimension[0] == d.nodeType && val[dimension[0]] == d.name) {
                                    var searchObj = filterData.find(o => o[dimension[0]] == val[dimension[0]] && o[dimension[1]] == val[dimension[1]])
                                    if (searchObj == undefined) {
                                        filterData.push(val)
                                    }
                                }
                            })
                        }
                        else {
                            _Local_data.map(function (val) {
                                if (dimension[1] == d.nodeType && val[dimension[1]] == d.name) {
                                    var searchObj = filterData.find(o => o[dimension[0]] == val[dimension[0]] && o[dimension[1]] == val[dimension[1]])
                                    if (searchObj == undefined) {
                                        filterData.push(val)
                                    }
                                }
                            })
                        }
                    }
                })

            node.append('text')
                .attr('x', -6)
                .attr('y', function (d) { return d.dy / 2; })
                .attr('dy', '.35em')
                .attr('text-anchor', 'end')
                .style('pointer-events', 'none')
                .text(function (d) {
                    if (d.dy > 4) {
                        return d.name;
                    }
                    return "";
                })
                .text(function (d) {
                    if (d.dy > 4) {
                        if (dimension.indexOf(d.nodeType) >= dimension.length - 2) {
                            return UTIL.getTruncatedLabel(this, d.name, nodeDistance / 2, 3);
                        }
                        return UTIL.getTruncatedLabel(this, d.name, nodeDistance, 3);
                    }
                    return "";
                })
                .style('visibility', function (d, i) {
                    return showLabels[dimension.indexOf(d.nodeType)];
                })
                .style('font-style', function (d, i) {
                    return fontStyle[dimension.indexOf(d.nodeType)];
                })
                .style('font-weight', function (d, i) {
                    return fontWeight[dimension.indexOf(d.nodeType)];
                })
                .style('font-size', function (d, i) {
                    return fontSize[dimension.indexOf(d.nodeType)];
                })
                .style('fill', function (d, i) {
                    return textColor[dimension.indexOf(d.nodeType)];
                })
                .filter(function (d) { return d.x < parentWidth / 2; })
                .attr('x', 6 + sankey.nodeWidth())
                .attr('text-anchor', 'start');

            d3.select(div).select('.filterData')
                .on('click', applyFilter(chart));

            d3.select(div).select('.removeFilter')
                .on('click', clearFilter());

            var lasso = d3.lasso()
                .hoverSelect(true)
                .closePathSelect(true)
                .closePathDistance(100)
                .items(node.select('rect'))
                .targetArea(svg);

            lasso.on('start', onLassoStart(lasso, me))
                .on('draw', onLassoDraw(lasso, me))
                .on('end', onLassoEnd(lasso, me));

            svg.call(lasso);
        });

    }


    chart.update = function (data) {

        data = getSankeyData(data);
        var plot = _local_svg.select('.plot');
        path = sankey.link();
        sankey.nodes(data.nodes)
            .links(data.links)
            .layout(32);

        gradientColor.domain(d3.extent(data.nodes, function (d) {
            return d.value;
        }));

        var nodeDistance = data.nodes[0].sourceLinks[0].target.x - data.nodes[0].x - sankey.nodeWidth();

        var link = plot.selectAll('.link')
            .data(data.links);

        link.exit().remove();
        newLink = link.enter().append('path')
            .attr('class', 'link')
            .attr('d', path)
            .style('stroke-width', function (d) { return Math.max(1, d.dy); })
            .sort(function (a, b) { return b.dy - a.dy; })
            .on('mouseover', _handleMouseOverFn.call(chart, tooltip, _local_svg, 'link'))
            .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, _local_svg, 'link'))
            .on('mouseout', _handleMouseOutFn.call(chart, tooltip, _local_svg, 'link'))
            .on('click', function (d) {

                var confirm = d3.select('.confirm')
                    .style('visibility', 'visible');

                if (d.nodeType == dimension[0]) {
                    _Local_data.map(function (val) {
                        if (dimension[0] == d.nodeType && val[dimension[0]] == d.name) {
                            var searchObj = _filter.find(o => o[dimension[0]] == val[dimension[0]] && o[dimension[1]] == val[dimension[1]])
                            if (searchObj == undefined) {
                                _filter.push(val)
                            }
                        }
                    })
                }
                else {
                    _Local_data.map(function (val) {
                        if (dimension[1] == d.nodeType && val[dimension[1]] == d.name) {
                            var searchObj = _filter.find(o => o[dimension[0]] == val[dimension[0]] && o[dimension[1]] == val[dimension[1]])
                            if (searchObj == undefined) {
                                _filter.push(val)
                            }
                        }
                    })
                }
            })

        link
            .attr('d', path)
            .style('stroke-width', function (d) { return Math.max(1, d.dy); })
            .sort(function (a, b) { return b.dy - a.dy; })

        var node = plot.selectAll('.node')
            .data(data.nodes);

        node.exit().remove();
        var newNode = node.enter().append('g')
            .attr('class', 'node')
            .attr('transform', function (d) {

                return 'translate(' + d.x + ',' + d.y + ')';
            })

        node.attr('transform', function (d) {
            return 'translate(' + d.x + ',' + d.y + ')';
        })
            .call(drag);

        node.select('rect')
            .attr('width', sankey.nodeWidth())
            .attr('height', function (d) { return d.dy; })
            .style('cursor', 'move')
            .style('fill', function (d, i) {
                return getFillColor(d, i);
            })
            .style('stroke', function (d) {
                return borderColor;
            })
            .classed('selected', false)
            .on('mouseover', _handleMouseOverFn.call(chart, tooltip, _local_svg, 'node'))
            .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, _local_svg, 'node'))
            .on('mouseout', _handleMouseOutFn.call(chart, tooltip, _local_svg, 'node'))
            .on('click', function (d) {
                var confirm = d3.select('.confirm')
                    .style('visibility', 'visible');
                var rect = d3.select(this)
                if (rect.classed('selected')) {
                    rect.classed('selected', false);
                    if (d.nodeType == dimension[0]) {
                        _Local_data.map(function (val) {
                            filterData = filterData.filter(function (val) {
                                if (d.name != val[dimension[0]]) {
                                    return val;
                                }
                            })
                        })
                    }
                    else {
                        _Local_data.map(function (val) {
                            filterData = filterData.filter(function (val) {
                                if (d.name != val[dimension[1]]) {
                                    return val;
                                }
                            })
                        })
                    }
                }
                else {
                    rect.classed('selected', true);
                    if (d.nodeType == dimension[0]) {
                        _Local_data.map(function (val) {
                            if (dimension[0] == d.nodeType && val[dimension[0]] == d.name) {
                                var searchObj = filterData.find(o => o[dimension[0]] == val[dimension[0]] && o[dimension[1]] == val[dimension[1]])
                                if (searchObj == undefined) {
                                    filterData.push(val)
                                }
                            }
                        })
                    }
                    else {
                        _Local_data.map(function (val) {
                            if (dimension[1] == d.nodeType && val[dimension[1]] == d.name) {
                                var searchObj = filterData.find(o => o[dimension[0]] == val[dimension[0]] && o[dimension[1]] == val[dimension[1]])
                                if (searchObj == undefined) {
                                    filterData.push(val)
                                }
                            }
                        })
                    }
                }
            })

        node.select('text')
            .attr('x', -6)
            .attr('y', function (d) { return d.dy / 2; })
            .attr('dy', '.35em')
            .attr('text-anchor', 'end')
            .text(function (d) {
                if (d.dy > 4) {
                    return d.name;
                }
                return "";
            })
            .text(function (d) {
                if (d.dy > 4) {
                    if (dimension.indexOf(d.nodeType) >= dimension.length - 2) {
                        return UTIL.getTruncatedLabel(this, d.name, nodeDistance / 2, 3);
                    }
                    return UTIL.getTruncatedLabel(this, d.name, nodeDistance, 3);
                }
                return "";
            })
            .style('visibility', function (d, i) {
                return showLabels[dimension.indexOf(d.nodeType)];
            })
            .style('font-style', function (d, i) {
                return fontStyle[dimension.indexOf(d.nodeType)];
            })
            .style('font-weight', function (d, i) {
                return fontWeight[dimension.indexOf(d.nodeType)];
            })
            .style('font-size', function (d, i) {
                return fontSize[dimension.indexOf(d.nodeType)];
            })
            .style('fill', function (d, i) {
                return textColor[dimension.indexOf(d.nodeType)];
            })
            .filter(function (d) { return d.x < parentWidth / 2; })
            .attr('x', 6 + sankey.nodeWidth())
            .attr('text-anchor', 'start');

        newNode.append('rect')
            .attr('width', sankey.nodeWidth())
            .attr('height', function (d) { return d.dy; })
            .style('cursor', 'move')
            .style('fill', function (d, i) {
                return getFillColor(d, i);
            })
            .style('stroke', function (d) {
                return borderColor;
            })
            .classed('selected', false)

        newNode.append('text')
            .attr('x', -6)
            .attr('y', function (d) { return d.dy / 2; })
            .attr('dy', '.35em')
            .attr('text-anchor', 'end')
            .style('pointer-events', 'none')
            .text(function (d) {
                if (d.dy > 4) {
                    return d.name;
                }
                return "";
            })
            .text(function (d) {
                if (d.dy > 4) {
                    if (dimension.indexOf(d.nodeType) >= dimension.length - 2) {
                        return UTIL.getTruncatedLabel(this, d.name, nodeDistance / 2, 3);
                    }
                    return UTIL.getTruncatedLabel(this, d.name, nodeDistance, 3);
                }
                return "";
            })
            .style('visibility', function (d, i) {
                return showLabels[dimension.indexOf(d.nodeType)];
            })
            .style('font-style', function (d, i) {
                return fontStyle[dimension.indexOf(d.nodeType)];
            })
            .style('font-weight', function (d, i) {
                return fontWeight[dimension.indexOf(d.nodeType)];
            })
            .style('font-size', function (d, i) {
                return fontSize[dimension.indexOf(d.nodeType)];
            })
            .style('fill', function (d, i) {
                return textColor[dimension.indexOf(d.nodeType)];
            })
            .filter(function (d) { return d.x < parentWidth / 2; })
            .attr('x', 6 + sankey.nodeWidth())
            .attr('text-anchor', 'start');
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
            return dimension;
        }
        dimension = value;
        return chart;
    }

    chart.measure = function (value) {
        if (!arguments.length) {
            return measure;
        }
        measure = value;
        return chart;
    }

    chart.colorPattern = function (value) {
        if (!arguments.length) {
            return colorPattern;
        }
        colorPattern = value;
        return chart;
    }

    chart.displayColor = function (value) {
        if (!arguments.length) {
            return displayColor;
        }
        displayColor = value;
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

    chart.borderColor = function (value) {
        if (!arguments.length) {
            return borderColor;
        }
        borderColor = value;
        return chart;
    }

    chart.numberFormat = function (value) {
        if (!arguments.length) {
            return numberFormat;
        }
        numberFormat = value;
        return chart;
    }

    chart.showLabels = function (value, measure) {
        return UTIL.baseAccessor.call(showLabels, value, measure, measure);
    }

    chart.fontStyle = function (value, measure) {
        return UTIL.baseAccessor.call(fontStyle, value, measure, measure);
    }

    chart.fontWeight = function (value, measure) {
        return UTIL.baseAccessor.call(fontWeight, value, measure, measure);
    }

    chart.fontSize = function (value, measure) {
        return UTIL.baseAccessor.call(fontSize, value, measure, measure);
    }

    chart.textColor = function (value, measure) {
        return UTIL.baseAccessor.call(textColor, value, measure, measure);
    }

    return chart;
}

module.exports = sankey;

function treemap() {

    /* These are the constant global variable for the function clusteredverticalbar.
     */
    var _NAME = 'treemap';

    /* These are the private variables that is initialized by the arguments sent
     * by the users and can be updated using public methods.
     */

    var _config,
        _dimension,
        _measure,
        showLabel,
        colorPattern,
        showValues,
        valueTextColour,
        fontStyleForMes,
        fontWeightForMes,
        fontSizeForMes,
        numberFormat,

        showLabelForDimension = [],
        labelColorForDimension = [],
        displayColor = [],
        fontStyleForDimension = [],
        fontWeightForDimension = [],
        fontSizeForDimension = [];

    /* These are the common variables that is shared across the different private/public 
     * methods but is initialized/updated within the methods itself.
     */
    var _localSVG,
        _localTotal,
        _localData = [],
        _localTooltip,
        textPadding = 2,
        _originalData,
        width,
        height
    // _localLabelStack;

    /* These are the common private functions that is shared across the different private/public 
     * methods but is initialized beforehand.
     */
    var BASE_COLOR = '#ffffff',
        dim1Color = d3.scaleLinear(),
        dim2Color = d3.scaleLinear(),
        filterData = [],
        root,
        treemap,
        nest;
    /* -------------------------------------------------------------------------------- */
    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.measure(config.measure);
        this.showLabel(config.showLabel);
        this.colorPattern(config.colorPattern);
        this.showValues(config.showValues);
        this.valueTextColour(config.valueTextColour);
        this.fontStyleForMes(config.fontStyleForMes);
        this.fontWeightForMes(config.fontWeightForMes);
        this.fontSizeForMes(config.fontSizeForMes);
        this.numberFormat(config.numberFormat);
        this.showLabelForDimension(config.showLabelForDimension);
        this.labelColorForDimension(config.labelColorForDimension);
        this.displayColor(config.displayColor);
        this.fontStyleForDimension(config.fontStyleForDimension);
        this.fontWeightForDimension(config.fontWeightForDimension);
        this.fontSizeForDimension(config.fontSizeForDimension);
    }

    var setColorDomainRange = function (arr, dim) {
        var values = [];

        arr.forEach(function (item) {
            if (item.depth == dim) {
                values.push(item.value);
            }
        });

        if (dim == 1) {
            dim1Color.domain([Math.min.apply(Math, values), Math.max.apply(Math, values)]);
            dim1Color.range([d3.rgb(displayColor[0]).brighter(), d3.rgb(displayColor[0]).darker()])
        } else if (dim == 2) {
            dim2Color.domain([Math.min.apply(Math, values), Math.max.apply(Math, values)]);
            dim2Color.range([d3.rgb(displayColor[1]).brighter(), d3.rgb(displayColor[1]).darker()])
        }
    }

    var getFillColor = function (obj, index) {
        if (index == 0) {
            return BASE_COLOR;
        }

        if (colorPattern == 'single_color') {
            if (_dimension.length == 2) {
                if (obj.children) {
                    return displayColor[0];
                } else {
                    return displayColor[1];
                }
            } else {
                return this.displayColor[0];
            }
        } else if (colorPattern == 'unique_color') {

            var defaultColors = ['#4897D8',
                '#ED5752',
                '#5BC8AC',
                '#20948B',
                '#9A9EAB',
                '#755248',
                '#FA6E59',
                '#CF3721',
                '#31A9B8',
                '#EFEFEF',
                '#34675C',
                '#AF4425'
            ]
            return defaultColors[index % (defaultColors.length)];
            // return d3.schemeCategory20c[index % (d3.schemeCategory20c.length)];
        } else if (colorPattern == 'gradient_color') {
            if (_dimension.length == 2) {
                if (obj.children) {
                    return dim1Color(obj.value);
                } else {
                    return dim2Color(obj.value);
                }
            } else {
                return dim1Color(obj.value);
            }
        }
    }

    var getFilterLabels = function (obj) {
        var result = [];

        if (_dimension.length == 2) {
            if (obj.children) {
                if (showLabelForDimension[0]) {
                    result = result.concat({ node: obj, data: obj.data.key });
                }
            } else {
                if (showLabelForDimension[1]) {
                    result = result.concat({ node: obj, data: obj.data.key });
                }
            }
        } else {
            if (showLabelForDimension[0]) {
                result = result.concat({ node: obj, data: obj.data.key });
            }
        }

        if (showLabelForDimension[0]) {
            var nf = UTIL.getNumberFormatter(numberFormat),
                value;

            if (numberFormat == "Percent") {
                value = nf(obj.value / _localTotal);
            } else {
                value = nf(obj.value);
            }

            if (value.indexOf("G") != -1) {
                value = value.slice(0, -1) + "B";
            }
            result = result.concat({ node: obj, data: value });
        }

        if (!obj.parent) {
            return [];
        }

        return result;
    }

    var getColorValue = function (data, index) {
        if ((data.node.children && _dimension.length == 2) || (!data.node.children && _dimension.length == 1)) {
            if (showLabelForDimension[0]) {
                return labelColorForDimension[0];
            }
        } else {
            if (showLabelForDimension[1]) {
                return labelColorForDimension[1];
            }
        }
        return null;
    }

    var getFontWeightValue = function (obj, index) {

        if ((obj.node.children && _dimension.length == 2) || (!obj.node.children && _dimension.length == 1)) {
            if (showLabelForDimension[0]) {
                return fontWeightForDimension[0];
            }
        } else {
            if (showLabelForDimension[1]) {
                return fontWeightForDimension[1];
            }
        }

        return null;
    }

    var getFontStyleValue = function (obj, index) {

        if ((obj.node.children && _dimension.length == 2) || (!obj.node.children && _dimension.length == 1)) {
            if (showLabelForDimension[0]) {
                return fontStyleForDimension[0];
            }
        } else {
            if (showLabelForDimension[1]) {
                return fontStyleForDimension[1];
            }
        }


        return null;
    }

    var getFontSizeValue = function (obj, index) {

        if ((obj.node.children && _dimension.length == 2) || (!obj.node.children && _dimension.length == 1)) {
            if (showLabelForDimension[0]) {
                return fontSizeForDimension[0];
            }
        } else {
            if (showLabelForDimension[1]) {
                return fontSizeForDimension[1];
            }
        }


        return null;
    }

    var getVisibilityValue = function (element, node) {
        var contWidth = node.x1 - node.x0,
            contHeight = node.y1 - node.y0,
            textWidth = element.getComputedTextLength(),
            textHeight = parseInt(d3.select(element).style('font-size').replace('px', ''));

        if (((textWidth + 2 * textPadding) > contWidth) || ((textHeight + 2 * textPadding) > contHeight)) {
            return 'hidden';
        }
        return 'visible';
    }

    var _handleMouseOverFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            d3.select(this).style('cursor', 'pointer')
            // .style('cursor', 'pointer')
            // .style('fill-opacity', .5);
            var border = d3.select(this).attr('fill');
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
                var border = d3.select(this).attr('fill');
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me, border), container, border);
            }
        }
    }

    var _handleMouseOutFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            var border = d3.select(this).attr('fill');
            d3.select(this).style('cursor', 'default')
                .style('fill', function (d1, i) {
                    return border
                })

            if (tooltip) {
                UTIL.hideTooltip(tooltip);
            }
        }
    }

    var _buildTooltipData = function (datum, chart) {
        var output = "";

        if (datum.data.key != undefined) {
            if (datum.children != undefined) {
                output += "<table><tr>" +
                    "<tr> <th>" + _dimension[0] + ": </th>"
                    + "<td>" + datum.data.key + "</td>"
                    + "</tr>";
            }
            else {
                output += "<table><tr>" +
                    "<tr><th>" + _dimension[0] + "</th><th>" + datum.parent.data.key + "</th></tr>" +
                    "<tr> <th>" + _dimension[1] + ": </th>"
                    + "<td>" + datum.data.key + "</td>"
                    + "</tr>";
            }

            if (datum.data.values != undefined) {
                for (var index = 0; index < datum.data.values.length; index++) {
                    output += " <tr> <th>" + datum.data.values[index].key + ": </th>"
                        + "<td>" + datum.data.values[index].value + "</td>"
                        + "</tr>";
                }
            }
            else {
                output += " <tr> <th>" + _measure[0] + ": </th>"
                    + "<td>" + datum.data.value + "</td>"
                    + "</tr>";
            }
            output += "</table>";
            return output;
        }
        else {
            UTIL.hideTooltip(tooltip);
        }

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
            debugger
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
            if (data.length > 0) {
                data.forEach(function (d) {
                    if (d.children != undefined) {
                        for (var index = 0; index < d.data.values.length; index++) {

                            var isExist = _filter.filter(function (val) {
                                if (val[_dimension[1]] == d.data.key) {
                                    return val
                                }
                            })
                            if (isExist.length == 0) {
                                var searchObj = _localData.find(o => o[_dimension[1]] === d.data.values[index].key);

                                var isExist = _filter.filter(function (val) {
                                    if (val[_dimension[0]] == searchObj[_dimension[0]] && val[_dimension[1]] == searchObj[_dimension[1]]) {
                                        return val
                                    }
                                })
                                if (isExist.length == 0) {
                                    _filter.push(searchObj);
                                }
                            }
                        }
                    }
                    else {
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
                if (_filter.length > 0) {
                    filterData = _filter;
                }
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

    var drawViz = function (element) {
        var rect = element.append('rect')
            .attr('rx', 5)
            .attr('ry', 5)
            .attr('class', 'treeRect')
            .attr('width', function (d) {
                return d.x1 - d.x0;
            })
            .attr('height', function (d) {
                return d.y1 - d.y0;
            })
            .attr('fill', function (d, i) {
                return getFillColor(d, i);
            })
            .attr('stroke', function (d, i) {
                return getFillColor(d, i);
            })
            .style('stroke-width', 2)
            .attr('id', function (d, i) {
                return 'rect-' + i;
            })
            .on('mouseover', _handleMouseOverFn.call(chart, tooltip, _local_svg))
            .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, _local_svg))
            .on('mouseout', _handleMouseOutFn.call(chart, tooltip, _local_svg))
            .on('click', function (d) {

                var confirm = d3.select('.confirm')
                    .style('visibility', 'visible');
                var _filter = _localData.filter(function (d1) {
                    return d.data.key === d1[_dimension[1]]
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
                    if (d.children != undefined) {
                        for (var index = 0; index < d.data.values.length; index++) {

                            var isExist = filterData.filter(function (val) {
                                if (val[_dimension[1]] == d.data.key) {
                                    return val
                                }
                            })
                            if (isExist.length == 0) {
                                var searchObj = _localData.find(o => o[_dimension[1]] === d.data.values[index].key);


                                var isExist = filterData.filter(function (val) {
                                    if (val[_dimension[0]] == searchObj[_dimension[0]] && val[_dimension[1]] == searchObj[_dimension[1]]) {
                                        return val
                                    }
                                })
                                if (isExist.length == 0) {
                                    filterData.push(searchObj);
                                }
                            }
                        }
                    }
                    else {
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

        rect.transition(t)
            .attr('width', function (d) {
                return d.x1 - d.x0;
            })
            .attr('height', function (d) {
                return d.y1 - d.y0;
            })
            .attr('fill', function (d, i) {
                return getFillColor(d, i)
            });

        function afterTransition() {
            element.filter(function (d, i) { return d.parent; })
                .append('text')
                .attr('class', 'information')
                .selectAll('tspan')
                .data(function (d, i) {
                    return getFilterLabels(d);
                })
                .enter().append('tspan')
                .attr('x', function (d, i) {
                    return i ? null : 2;
                })
                .attr('y', '1em')
                .text(function (d, i) {
                    return i ? '- ' + d.data : d.data;
                })
                .attr('fill', function (d, i) {
                    return getColorValue(d, i);
                })
                .attr('visibility', function (d, i) {
                    var parentNode = d3.select(this).node().parentNode;
                    return getVisibilityValue(parentNode, d.node);
                })
                .style('font-style', function (d, i) {
                    return getFontStyleValue(d, i);
                })
                .style('font-weight', function (d, i) {
                    return getFontWeightValue(d, i);
                })
                .style('font-size', function (d, i) {
                    return getFontSizeValue(d, i);
                });
        }

        var t = d3.transition()
            .duration(400)
            .ease(d3.easeQuadIn)
            .on('end', afterTransition);
    }
    function chart(selection) {
        _localSVG = selection;

        selection.each(function (data) {

            var div = d3.select(this).node().parentNode;
            _local_svg = d3.select(this);

            width = div.clientWidth - 2 * COMMON.PADDING,
                height = div.clientHeight - 2 * COMMON.PADDING;

            var svg = d3.select(this);

            /* store the data in local variable */
            _localData = _originalData = data;

            var me = this;

            svg.selectAll('g').remove();

            svg.attr('width', width)
                .attr('height', height)
                .attr('transform', 'translate(' + COMMON.PADDING + ', ' + COMMON.PADDING + ')');

            if (_tooltip) {
                tooltip = d3.select(this.parentNode).select('#tooltip');
            }

            treemap = d3.treemap()
                .size([width, height])
                .paddingOuter(function (node) {
                    if (node.parent) {
                        return 5;
                    }
                    return 1;
                })
                .paddingTop(function (node) {
                    if (node.parent) {
                        return 20;
                    }
                    return 0;
                })
                .paddingInner(10)
                .round(true);

            if (_dimension.length == 2) {
                nest = this._nest = d3.nest()
                    .key(function (d) { return d[_dimension[0]]; })
                    .key(function (d) { return d[_dimension[1]]; })
                    .rollup(function (d) { return d3.sum(d, function (d) { return d[_measure[0]]; }); });
            } else {
                nest = this._nest = d3.nest()
                    .key(function (d) { return d[_dimension[0]]; })
                    .rollup(function (d) { return d3.sum(d, function (d) { return d[_measure[0]]; }); });
            }

            root = d3.hierarchy({ values: nest.entries(data) }, function (d) { return d.values; })
                .sum(function (d) { return d.value; })
                .sort(function (a, b) { return b.value - a.value; });

            _localTotal = root.value;

            treemap(root);

            var dim = _dimension.length;

            while (dim > 0) {
                setColorDomainRange(root.descendants(), dim);
                dim -= 1;
            }
            var plot = svg.append('g')
                .attr('class', 'plot');

            var cell = plot.selectAll('.node')
                .data(root.descendants())
                .enter().append('g')
                .attr('transform', function (d) {
                    return 'translate(' + d.x0 + ',' + d.y0 + ')';
                })
                .attr('class', 'node')
                .each(function (d) { d.node = this; });

            drawViz(cell)

            d3.select(div).select('.btn-primary')
                .on('click', applyFilter(chart));

            d3.select(div).select('.btn-default')
                .on('click', clearFilter());

            var lasso = d3.lasso()
                .hoverSelect(true)
                .closePathSelect(true)
                .closePathDistance(100)
                .items(cell)
                .targetArea(svg);

            lasso.on('start', onLassoStart(lasso, chart))
                .on('draw', onLassoDraw(lasso, chart))
                .on('end', onLassoEnd(lasso, chart));

            _local_svg.call(lasso);

        });
    }

    chart._getName = function () {
        return _NAME;
    }

    chart.update = function (data) {
        _Local_data = data;
        filterData = [];

        if (_dimension.length == 2) {
            nest = this._nest = d3.nest()
                .key(function (d) { return d[_dimension[0]]; })
                .key(function (d) { return d[_dimension[1]]; })
                .rollup(function (d) { return d3.sum(d, function (d) { return d[_measure[0]]; }); });
        } else {
            nest = this._nest = d3.nest()
                .key(function (d) { return d[_dimension[0]]; })
                .rollup(function (d) { return d3.sum(d, function (d) { return d[_measure[0]]; }); });
        }

        root = d3.hierarchy({ values: nest.entries(data) }, function (d) { return d.values; })
            .sum(function (d) { return d.value; })
            .sort(function (a, b) { return b.value - a.value; });

        _localTotal = root.value;

        treemap(root);

        var dim = _dimension.length;

        while (dim > 0) {
            setColorDomainRange(root.descendants(), dim);
            dim -= 1;
        }
        var svg = _localSVG
        treemap(root);
        var dim = _dimension.length;
        var plot = _localSVG.select('.plot');

        plot.selectAll('.information').remove();
        while (dim > 0) {
            setColorDomainRange(root.descendants(), dim);
            dim -= 1;
        }

        var cell = plot.selectAll('.node')
            .data(root.descendants())
            .each(function (d) { d.node = this; });

        var newCell = cell.enter().append('g')
            .attr('class', 'node')
            .attr('transform', function (d) {
                return 'translate(' + d.x0 + ',' + d.y0 + ')';
            });

        drawViz(newCell)

        cell.exit().remove();

        cell = plot.selectAll('.node');

        var rect = cell.select('rect')
            .attr('rx', 5)
            .attr('ry', 5)
            .attr('width', function (d) {
                return d.x1 - d.x0;
            })
            .attr('height', function (d) {
                return d.y1 - d.y0;
            })
            .attr('fill', function (d, i) {
                return getFillColor(d, i);
            })
            .attr('stroke', function (d, i) {
                return getFillColor(d, i);
            })
            .style('stroke-width', 2)
            .classed('selected', false)
            .attr('id', function (d, i) {
                return 'rect-' + i;
            })

        cell.filter(function (d, i) { return d.parent; })
            .append('text')
            .attr('class', 'information')
            .selectAll('tspan')
            .data(function (d, i) {
                return getFilterLabels(d);
            })
            .enter().append('tspan')
            .attr('x', function (d, i) {
                return i ? null : 2;
            })
            .attr('y', '1em')
            .text(function (d, i) {
                return i ? '- ' + d.data : d.data;
            })
            .attr('fill', function (d, i) {
                return getColorValue(d, i);
            })
            .attr('visibility', function (d, i) {
                var parentNode = d3.select(this).node().parentNode;
                return getVisibilityValue(parentNode, d.node);
            })
            .style('font-style', function (d, i) {
                return getFontStyleValue(d, i);
            })
            .style('font-weight', function (d, i) {
                return getFontWeightValue(d, i);
            })
            .style('font-size', function (d, i) {
                return getFontSizeValue(d, i);
            });

        plot.selectAll('.node')
            .attr('transform', function (d) {
                return 'translate(' + d.x0 + ',' + d.y0 + ')';
            })

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

    chart.showLabel = function (value) {
        if (!arguments.length) {
            return showLabel;
        }
        showLabel = value;
        return chart;
    }
    chart.colorPattern = function (value) {
        if (!arguments.length) {
            return colorPattern;
        }
        colorPattern = value;
        return chart;
    }
    chart.showValues = function (value) {
        if (!arguments.length) {
            return showValues;
        }
        showValues = value;
        return chart;
    }
    chart.valueTextColour = function (value) {
        if (!arguments.length) {
            return valueTextColour;
        }
        valueTextColour = value;
        return chart;
    }
    chart.fontStyleForMes = function (value) {
        if (!arguments.length) {
            return fontStyleForMes;
        }
        valueTextColour = value;
        return chart;
    }
    chart.fontWeightForMes = function (value) {
        if (!arguments.length) {
            return fontWeightForMes;
        }
        fontWeightForMes = value;
        return chart;
    }
    chart.fontSizeForMes = function (value) {
        if (!arguments.length) {
            return fontSizeForMes;
        }
        fontSizeForMes = value;
        return chart;
    }
    chart.numberFormat = function (value) {
        if (!arguments.length) {
            return numberFormat;
        }
        numberFormat = value;
        return chart;
    }

    /**
     * ClusteredVerticalBar Measure Showvalue accessor function
     *
     * @param {boolean|array(boolean)|null} value Measure Showvalue value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {boolean|array(boolean)|function}
     */
    chart.showLabelForDimension = function (value, measure) {
        return UTIL.baseAccessor.call(showLabelForDimension, value, measure, _measure);
    }

    /**
     * ClusteredVerticalBar Measure Displayname accessor function
     *
     * @param {string|array(string)|null} value Measure Displayname value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.labelColorForDimension = function (value, measure) {
        return UTIL.baseAccessor.call(labelColorForDimension, value, measure, _measure);
    }

    /**
     * ClusteredVerticalBar Measure FontStyle accessor function
     *
     * @param {string|array(string)|null} value Measure FontStyle value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.displayColor = function (value, measure) {
        return UTIL.baseAccessor.call(displayColor, value, measure, _measure);
    }

    /**
     * ClusteredVerticalBar Measure FontWeight accessor function
     *
     * @param {number|array(number)|null} value Measure FontWeight value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {number|array(number)|function}
     */
    chart.fontStyleForDimension = function (value, measure) {
        return UTIL.baseAccessor.call(fontStyleForDimension, value, measure, _measure);
    }

    /**
     * ClusteredVerticalBar Measure FontSize accessor function
     *
     * @param {number|array(number)|null} value Measure FontSize value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {number|array(number)|function}
     */
    chart.fontWeightForDimension = function (value, measure) {
        return UTIL.baseAccessor.call(fontWeightForDimension, value, measure, _measure);
    }

    /**
     * ClusteredVerticalBar Measure NumberFormat accessor function
     *
     * @param {string|array(string)|null} value Measure NumberFormat value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.fontSizeForDimension = function (value, measure) {
        return UTIL.baseAccessor.call(fontSizeForDimension, value, measure, _measure);
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
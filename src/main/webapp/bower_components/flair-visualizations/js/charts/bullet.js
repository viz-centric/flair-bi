var COMMON = require('../extras/common.js')(),
    UTIL = require('../extras/util.js')()
function bullet() {

    var _NAME = 'bullet';

    var _config,
        dimension,
        measures,
        fontStyle,
        fontWeight,
        fontSize,
        showLabel,
        showLabel,
        valueColor,
        targetColor,
        orientation,
        segments,
        segmentInfo,
        measureNumberFormat,
        targetNumberFormat,
        _tooltip,
        _sort;

    var _local_svg, _Local_data, _originalData;

    var height, width, gWidth, gHeight, bullet;
    var margin = {
        top: 15,
        right: 0,
        bottom: 15,
        left: 0
    };

    var offset = 6, div;

    var filter = false, filterData = [];

    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.measures(config.measures);
        this.fontStyle(config.fontStyle);
        this.fontWeight(config.fontWeight);
        this.fontSize(config.fontSize);
        this.showLabel(config.showLabel);
        this.valueColor(config.valueColor);
        this.targetColor(config.targetColor);
        this.orientation(config.orientation);
        this.segments(config.segments);
        this.segmentInfo(config.segmentInfo);
        this.measureNumberFormat(config.measureNumberFormat);
        this.targetNumberFormat(config.targetNumberFormat);

    }

    var _buildTooltipData = function (datum, chart) {
        var output = "";

        output += "<table><tr>"
            + "<th>" + chart.dimension() + ": </th>"
            + "<td>" + datum.title + "</td>"
            + "</tr><tr>"
            + "<th>" + 'Value' + ": </th>"
            + "<td>" + datum.measures.toString() + "</td>"
            + "</tr><tr>"
            + "<th>" + "Target" + ": </th>"
            + "<td>" + datum.markers.toString() + "</td>"
            + "</tr>"
            + "</table>";

        return output;
    }

    var onLassoStart = function (lasso, scope) {
        return function () {
            if (filter) {
                lasso.items().selectAll('rect.measure')
                    .classed('not_possible', true)
                    .classed('selected', false);
            }
        }
    }

    var onLassoDraw = function (lasso, scope) {
        return function () {
            filter = true;
            lasso.items().selectAll('rect.measure')
                .classed('selected', false);

            lasso.possibleItems().selectAll('rect.measure')
                .classed('not_possible', false)
                .classed('possible', true);

            lasso.notPossibleItems().selectAll('rect.measure')
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
                lasso.items().selectAll('rect.measure')
                    .classed('not_possible', false)
                    .classed('possible', false);
            }

            lasso.selectedItems().selectAll('rect.measure')
                .classed('selected', true)

            lasso.notSelectedItems().selectAll('rect.measure');

            var confirm = $(scope).parent().find('div.confirm')
                .css('visibility', 'visible');

            var _filter = [];
            if (data.length > 0) {
                data.forEach(function (d) {
                    var obj = new Object();
                    obj[dimension] = d.title;
                    obj[measures[0]] = d.measures.toString();
                    obj[measures[1]] = d.markers.toString();

                    _filter.push(obj)
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

    var _handleMouseOverFn = function (tooltip, container) {
        var me = this;
        return function (d, i) {

            d3.select(this).style('cursor', 'pointer')
                .style('cursor', 'pointer')
                .style('fill', COMMON.HIGHLIGHTER);

            if (tooltip) {
                UTIL.showTooltip(tooltip);
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me), container, valueColor);
            }
        }
    }

    var _handleMouseMoveFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            if (tooltip) {
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me), container, valueColor);
            }
        }
    }

    var _handleMouseOutFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {

            if (tooltip) {
                UTIL.hideTooltip(tooltip);
            }
        }
    }
    var getSegmentValues = function (endValue) {
        var me = this,
            _segments = [],
            d;

        d3.range(segments).forEach(function (i) {
            try {
                if (d = segmentInfo[i]['upto']) {
                    _segments.push(d);
                }
            } catch (e) {
                // pass
            }
        });

        if (segments[segments.length - 1] > endValue) {
            _segments.push(segments[segments.length - 1]);
        } else {
            _segments.push(endValue);
        }

        return _segments;
    }

    var getSegmentColors = function (scope) {

        var _segments = {},
            j = segments - 1;

        d3.range(segments).forEach(function (i) {
            try {
                _segments['.s' + j] = segmentInfo[i]['color'];
            } catch (e) {
                _segments['.s' + j] = "#efefef";
            } finally {
                j--;
            }
        });

        return _segments;
    }

    var getMargin = function (containerWidth) {
        var margin = {
            top: 15,
            bottom: 15
        };

        if (orientation == 'Horizontal') {
            if (showLabel) {
                margin['left'] = Math.floor(containerWidth / 8);
            } else {
                margin['left'] = 20;
            }
            margin['right'] = 20;
        } else if (orientation == 'Vertical') {
            margin['left'] = 15;
            margin['right'] = 15;
            margin['top'] = 30;
        }

        return margin;
    }
    var formatUsingCss = function (scope) {
        var bullet = $(scope).find('.bullet'),
            range = bullet.find('.range');

        bullet.css('font', '9px sans-serif');
        bullet.find('.marker').css('stroke', targetColor)
            .css('stroke-width', '2px');
        bullet.find('.tick line').css('stroke', '#666')
            .css('stroke-width', '0.5px');
        bullet.find('.measure').css('fill', valueColor);
        bullet.find('.measure').removeClass('selected');
        bullet.find('.title').css('font-size', '1.1em');

        if (orientation == 'Vertical') {
            bullet.find('.tick text').each(function (i, d) {
                var text = $(d).text();
                //  $(d).text(UTIL.getTruncatedLabel(d, UTIL.shortScale(2)(UTIL.convertToNumber(text)), 25));
            });
        } else {
            bullet.find('.tick text').each(function (i, d) {
                var text = $(d).text();
                //  $(d).text(UTIL.getTruncatedLabel(d, UTIL.shortScale(2)(UTIL.convertToNumber(text)), 25));
            });
        }

        var obj;
        for (var property in obj = getSegmentColors(this)) {
            if (obj.hasOwnProperty(property)) {
                range.filter(property).css('fill', obj[property]);
            }
        }
    }
    function chart(selection) {
        _local_svg = selection;

        selection.each(function (data) {
            _originalData = _Local_data = data;
            div = d3.select(this).node().parentNode;
            width = div.clientWidth,
                height = div.clientHeight;
            chart.local_svg = d3.select(this);
            _local_svg.selectAll('g').remove();

            _local_svg.attr('width', width)
                .attr('height', height);

            container = _local_svg.append('g')
                .attr('class', 'plot')

            var _filter = UTIL.createFilterElement()
            $(div).append(_filter);

            if (_tooltip) {
                tooltip = d3.select(this.parentNode).select('#tooltip');
            }

            data = data.map(function (item) {
                var d = {};
                d.title = item[dimension[0]];
                d.ranges = getSegmentValues(
                    Math.floor(1.2 * Math.max.apply(Math, [item[measures[0]], item[measures[1]]]))
                );
                d.measures = [item[measures[0]]];
                d.markers = [item[measures[1]]];

                return d;
            });

            bullet = d3.bullet()
                .duration(800);
            var margin = getMargin(width);
            gWidth = Math.floor((width - margin.left - margin.right) / data.length);
            gHeight = Math.floor((height - margin.top - margin.bottom) / data.length);
            offset = 6;
            if (orientation == 'Horizontal') {
                bullet.width(width - margin.left - margin.right);
                if (data.length == 1) {
                    bullet.height(Math.floor(3 * gHeight / 4));
                } else {
                    bullet.height(Math.floor(gHeight / 2));
                }
            } else if (orientation == 'Vertical') {
                bullet.width(height - margin.top - margin.bottom);
                if (data.length == 1) {
                    bullet.height(Math.floor(3 * gWidth / 4));
                } else {
                    bullet.height(Math.floor(gWidth / 2));
                }
            } else {
                throw "Invalid orientation";
            }

            var g = container.selectAll('g')
                .data(data)
                .enter().append('g')
                .attr('id', function (d, i) {
                    return 'group_' + div.id + '_' + i;
                })
                .attr('class', 'bullet')
                .attr('transform', function (d, i) {
                    if (orientation == 'Horizontal') {
                        return 'translate(' + margin.left + ',' + (margin.top + i * gHeight) + ') rotate(0)';
                    } else if (orientation == 'Vertical') {
                        return 'translate(' + (margin.left + i * gWidth) + ',' + (height - margin.top + offset) + ') rotate(-90)';
                    }

                })
                .on('mouseover', _handleMouseOverFn.call(chart, tooltip, _local_svg))
                .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, _local_svg))
                .on('mouseout', _handleMouseOutFn.call(chart, tooltip, _local_svg))
                .on('click', function (d) {

                    var confirm = d3.select('.confirm')
                        .style('visibility', 'visible');

                    var rect = d3.select(this).select('rect.measure');

                    if (rect.classed('selected')) {
                        rect.classed('selected', false);
                        filterData = filterData.filter(function (val) {
                            if (val[dimension[0]] != d.title) {
                                return val;
                            }
                        })
                    } else {
                        rect.classed('selected', true);
                        var obj = new Object();
                        obj[dimension] = d.title;
                        obj[measures[0]] = d.measures.toString();
                        obj[measures[1]] = d.markers.toString();

                        filterData.push(obj)
                    }
                })
                .call(bullet);

            var title = g.append('g')
                .style('text-anchor', function (d) {
                    if (orientation == 'Horizontal') {
                        return 'end';
                    } else if (orientation == 'Vertical') {
                        return 'middle';
                    }
                })
                .attr('display', showLabel ? "inherit" : "none")
                .attr('transform', function (d) {
                    if (orientation == 'Horizontal') {
                        return 'translate(' + -offset + ',' + Math.floor(gHeight / 3.25) + ')';
                    } else if (orientation == 'Vertical') {
                        return 'translate(' + -offset * 2 + ',' + Math.floor(gWidth / 3.25) + ')';
                    }
                })

            title.append('text')
                .attr('class', 'title')
                .attr('font-style', fontStyle)
                .attr('font-weight', fontWeight)
                .attr('font-size', fontSize)
                .attr('transform', function (d) {
                    if (orientation == 'Horizontal') {
                        return 'rotate(0)';
                    } else if (orientation == 'Vertical') {
                        return 'rotate(90)';
                    }
                })
                .text(function (d) { return d.title; })
                .text(function (d) {
                    if (orientation == 'Horizontal') {
                        return UTIL.getTruncatedLabel(this, d.title, margin.left, offset);
                    } else if (orientation == 'Vertical') {
                        return UTIL.getTruncatedLabel(this, d.title, Math.floor(gWidth / 2), offset);
                    }
                });
            formatUsingCss(this);

            d3.select(div).select('.filterData')
                .on('click', applyFilter(chart));

            d3.select(div).select('.removeFilter')
                .on('click', clearFilter());

            var lasso = d3.lasso()
                .hoverSelect(true)
                .closePathSelect(true)
                .closePathDistance(100)
                .items(g)
                .targetArea(_local_svg);

            lasso.on('start', onLassoStart(lasso, me))
                .on('draw', onLassoDraw(lasso, me))
                .on('end', onLassoEnd(lasso, me));

            _local_svg.call(lasso);
        });

    }


    chart._getName = function () {
        return _NAME;
    }

    chart.update = function (data) {
        _Local_data = data;
        filterData = [];
        var svg = chart.local_svg;

        data = data.map(function (item) {
            var d = {};
            d.title = item[dimension[0]];
            d.ranges = getSegmentValues(
                Math.floor(1.2 * Math.max.apply(Math, [item[measures[0]], item[measures[1]]]))
            );
            d.measures = [item[measures[0]]];
            d.markers = [item[measures[1]]];

            return d;
        });
        var plot = svg.select('.plot')
        var _bullet = plot.selectAll('.bullet')
            .data(data);

        newBullet = _bullet.enter().append('g')
            .attr('class', 'bullet');

        var margin = getMargin(width);
        gWidth = Math.floor((width - margin.left - margin.right) / data.length);
        gHeight = Math.floor((height - margin.top - margin.bottom) / data.length);

        _bullet.exit().remove();

        _bullet = plot.selectAll('g.bullet');

        _bullet
            .classed('selected', false)
            .attr('transform', function (d, i) {
                if (orientation == 'Horizontal') {
                    return 'translate(' + margin.left + ',' + (margin.top + i * gHeight) + ') rotate(0)';
                } else if (orientation == 'Vertical') {
                    return 'translate(' + (margin.left + i * gWidth) + ',' + (height - margin.top + offset) + ') rotate(-90)';
                }

            })
            .call(bullet);

        newBullet
            .attr('id', function (d, i) {
                return 'group_' + div.id + '_' + i;
            })
            .attr('class', 'bullet')
            .attr('transform', function (d, i) {
                if (orientation == 'Horizontal') {
                    return 'translate(' + margin.left + ',' + (margin.top + i * gHeight) + ') rotate(0)';
                } else if (orientation == 'Vertical') {
                    return 'translate(' + (margin.left + i * gWidth) + ',' + (height - margin.top + offset) + ') rotate(-90)';
                }

            })
            .on('mouseover', _handleMouseOverFn.call(chart, tooltip, _local_svg))
            .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, _local_svg))
            .on('mouseout', _handleMouseOutFn.call(chart, tooltip, _local_svg))
            .on('click', function (d) {

                var confirm = d3.select('.confirm')
                    .style('visibility', 'visible');

                var rect = d3.select(this).select('rect.measure');

                if (rect.classed('selected')) {
                    rect.classed('selected', false);
                    filterData = filterData.filter(function (val) {
                        if (val[dimension[0]] != d.title) {
                            return val;
                        }
                    })
                } else {
                    rect.classed('selected', true);
                    var obj = new Object();
                    obj[dimension] = d.title;
                    obj[measures[0]] = d.measures.toString();
                    obj[measures[1]] = d.markers.toString();

                    filterData.push(obj)
                }
            })
            .call(bullet);

        plot.selectAll('.title').remove()
        var title = _bullet.append('g')
            .style('text-anchor', function (d) {
                if (orientation == 'Horizontal') {
                    return 'end';
                } else if (orientation == 'Vertical') {
                    return 'middle';
                }
            })
            .attr('display', showLabel ? "inherit" : "none")
            .attr('transform', function (d) {
                if (orientation == 'Horizontal') {
                    return 'translate(' + -offset + ',' + Math.floor(gHeight / 3.25) + ')';
                } else if (orientation == 'Vertical') {
                    return 'translate(' + -offset * 2 + ',' + Math.floor(gWidth / 3.25) + ')';
                }
            })

        title.append('text')
            .attr('class', 'title')
            .attr('font-style', fontStyle)
            .attr('font-weight', fontWeight)
            .attr('font-size', fontSize)
            .attr('transform', function (d) {
                if (orientation == 'Horizontal') {
                    return 'rotate(0)';
                } else if (orientation == 'Vertical') {
                    return 'rotate(90)';
                }
            })
            .text(function (d) { return d.title; })
            .text(function (d) {
                if (orientation == 'Horizontal') {
                    return UTIL.getTruncatedLabel(this, d.title, margin.left, offset);
                } else if (orientation == 'Vertical') {
                    return UTIL.getTruncatedLabel(this, d.title, Math.floor(gWidth / 2), offset);
                }
            });

        formatUsingCss(this);
    }

    chart.config = function (value) {
        if (!arguments.length) {
            return _config;
        }
        _config = value;
        _setConfigParams.call(chart, _config);
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
    chart.dimension = function (value) {
        if (!arguments.length) {
            return dimension;
        }
        dimension = value;
        return chart;
    }

    chart.measures = function (value) {
        if (!arguments.length) {
            return measures;
        }
        measures = value;
        return chart;
    }

    chart.fontStyle = function (value) {
        if (!arguments.length) {
            return fontStyle;
        }
        fontStyle = value;
        return chart;
    }
    chart.fontWeight = function (value) {
        if (!arguments.length) {
            return fontWeight;
        }
        fontWeight = value;
        return chart;
    }
    chart.fontSize = function (value) {
        if (!arguments.length) {
            return fontSize;
        }
        fontSize = value;
        return chart;
    }
    chart.showLabel = function (value) {
        if (!arguments.length) {
            return showLabel;
        }
        showLabel = value;
        return chart;
    }
    chart.valueColor = function (value) {
        if (!arguments.length) {
            return valueColor;
        }
        valueColor = value;
        return chart;
    }
    chart.targetColor = function (value) {
        if (!arguments.length) {
            return targetColor;
        }
        targetColor = value;
        return chart;
    }
    chart.orientation = function (value) {
        if (!arguments.length) {
            return orientation;
        }
        orientation = value;
        return chart;
    }
    chart.segments = function (value) {
        if (!arguments.length) {
            return segments;
        }
        segments = value;
        return chart;
    }
    chart.segmentInfo = function (value) {
        if (!arguments.length) {
            return segmentInfo;
        }
        segmentInfo = UTIL.getExpressionConfig(value, ['color']);;
        return chart;
    }
    chart.measureNumberFormat = function (value) {
        if (!arguments.length) {
            return measureNumberFormat;
        }
        measureNumberFormat = value;
        return chart;
    }
    chart.targetNumberFormat = function (value) {
        if (!arguments.length) {
            return targetNumberFormat;
        }
        targetNumberFormat = value;
        return chart;
    }
    return chart;
}

module.exports = bullet;

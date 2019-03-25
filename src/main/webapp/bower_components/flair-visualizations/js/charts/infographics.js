var COMMON = require('../extras/common.js')(),
    UTIL = require('../extras/util.js')(),
    LEGEND = require('../extras/legend.js')();

function infographics() {

    /* These are the constant global variable for the function kpi.
     */
    var _NAME = 'infographics';

    /* These are the private variables that is initialized by the arguments sent
     * by the users and can be updated using public methods.
     */

    var _config,
        _dimension,
        _measure,
        _chartType,
        _chartDisplayColor,
        _chartBorderColor,
        _kpiDisplayName,
        _kpiAlignment,
        _kpiBackgroundColor,
        _kpiNumberFormat,
        _kpiFontStyle,
        _kpiFontWeight,
        _kpiFontSize,
        _kpiColor,
        _kpiColorExpression,
        _kpiIcon,
        _kpiIconFontWeight,
        _kpiIconColor,
        _kpiIconExpression,
        _tooltip;

    /* These are the common variables that is shared across the different private/public 
     * methods but is initialized/updated within the methods itself.
     */
    var _localDiv,
        _localTotal = 0,
        _localPrevKpiValue = 0,
        _localData,
        _localXLabels = [],
        _localMin,
        _localMax,
        _localTooltip;

    /* These are the common private functions that is shared across the different private/public 
     * methods but is initialized beforehand.
     */
    var _x = d3.scalePoint(),
        _y = d3.scaleLinear(),
        _line = d3.line(),
        _area = d3.area();

    /* -------------------------------------------------------------------------------- */
    var _setConfigParams = function(config) {
        this.dimension(config.dimension);
        this.measure(config.measure);
        this.chartType(config.chartType);
        this.chartDisplayColor(config.chartDisplayColor);
        this.chartBorderColor(config.chartBorderColor);
        this.kpiDisplayName(config.kpiDisplayName);
        this.kpiAlignment(config.kpiAlignment);
        this.kpiBackgroundColor(config.kpiBackgroundColor);
        this.kpiNumberFormat(config.kpiNumberFormat);
        this.kpiFontStyle(config.kpiFontStyle);
        this.kpiFontWeight(config.kpiFontWeight);
        this.kpiFontSize(config.kpiFontSize);
        this.kpiColor(config.kpiColor);
        this.kpiColorExpression(config.kpiColorExpression);
        this.kpiIcon(config.kpiIcon);
        this.kpiIconFontWeight(config.kpiIconFontWeight);
        this.kpiIconColor(config.kpiIconColor);
        this.kpiIconExpression(config.kpiIconExpression);
        this.tooltip(config.tooltip);
    }

    var _getKpiDisplayName = function() {
        if(_kpiDisplayName.trim() == '') {
            return _measure;
        }

        return _kpiDisplayName;
    }

    var _getKpi = function(value, endValue) {
        var numberOutput = "",
            iconOutput = "";

        var style = {
            'font-style': _kpiFontStyle || COMMON.DEFAULT_FONTSTYLE,
            'font-weight': _kpiFontWeight || COMMON.DEFAULT_FONTWEIGHT,
            'font-size': _kpiFontSize || COMMON.DEFAULT_FONTSIZE,
            'color': _kpiColor || COMMON.DEFAULT_COLOR
        };

        if(_kpiColorExpression) {
            style['color'] = UTIL.expressionEvaluator(_kpiColorExpression, endValue, 'color');
        }

        style = JSON.stringify(style);
        style = style.replace(/["{}]/g, '').replace(/,/g, ';');

        numberOutput += "<span style='" + style + "'>"
            + UTIL.getNumberFormatterFn(_kpiNumberFormat)(UTIL.roundNumber(value, 0)).toUpperCase()
            + "</span>";

        var iconStyle = {
            'font-weight': _kpiIconFontWeight || COMMON.DEFAULT_FONTWEIGHT,
            'color': _kpiIconColor || COMMON.DEFAULT_COLOR,
            'font-size': _kpiFontSize || COMMON.DEFAULT_FONTSIZE
        };

        if(_kpiIconExpression) {
            _kpiIcon = UTIL.expressionEvaluator(_kpiIconExpression, endValue, 'icon');
            iconStyle['color'] = UTIL.expressionEvaluator(_kpiIconExpression, endValue, 'color');
        }

        iconStyle = JSON.stringify(iconStyle);
        iconStyle = iconStyle.replace(/["{}]/g, '').replace(/,/g, ';');

        iconOutput += "<i class=\"" + _kpiIcon + "\" style=\"" + iconStyle + "\" aria-hidden=\"true\"></i>";

        return numberOutput + "&nbsp;" + iconOutput;
    }

    /* Builds the html data for the tooltip
     *
     * @param {object} datum Datum forming the arc
     * @param {function} chart Pie chart function
     * @return {string} String encoded HTML data
     */
    var _buildTooltipData = function(datum, chart) {
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

    var _handleMouseOverFn = function(tooltip, container) {
        var me = this;

        return function(d, i) {
            d3.select(this).style('cursor', 'pointer');

            var point = container.selectAll('.infographics-point')
                .filter(function(d1) {
                    return d1[_dimension[0]] === d[_dimension[0]];
                });

            point.style('stroke-width', 2);
            
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

            var point = container.selectAll('.infographics-point')
                .filter(function(d1) {
                    return d1[_dimension[0]] === d[_dimension[0]];
                });

            point.style('stroke-width', 0);
            
            if(tooltip) {
                UTIL.hideTooltip(tooltip);
            }
        }
    }

    function chart(selection) {
        _localDiv = selection;

        selection.each(function(data) {
            var infographics = d3.select(this),
                width = parseInt(infographics.style('width')),
                height = parseInt(infographics.style('height')),
                parentWidth = width - 2 * COMMON.MARGIN,
                parentHeight = height - 2 * COMMON.MARGIN;

            /* total sum of the measure values */
            _localTotal = d3.sum(data.map(function(d) { return d[_measure[0]]; }));

            /* store the data in local variable */
            _localData = data;

            var container = infographics.append('div')
                .classed('container', true)
                .style('width', parentWidth)
                .style('height', parentHeight)
                .style('margin', COMMON.MARGIN);

            var graphics = container.append('svg')
                .attr('id', 'graphics');

            var info = container.append('div')
                .attr('id', 'info');

            var tooltip = container.append('div')
                .attr('id', 'tooltip');

            if(_tooltip) {
                _localTooltip = tooltip;
            }

            /* Label values for the dimension */
            _localXLabels = data.map(function(d) {
                return d[_dimension[0]];
            });

            /* Minimum and Maximum value of the measures */
            _localMin = d3.min(data, function(d) { return d[_measure[0]]; });
            _localMax = d3.max(data, function(d) { return d[_measure[0]]; });
            
            _x.domain(_localXLabels)
                .range([0, parentWidth]);

            _y.domain([_localMin, _localMax])
                .range([parentHeight, 0]);

            _line.x(function(d) {
                    return _x(d[_dimension[0]]);
                })
                .y(function(d) {
                    return _y(d[_measure[0]]);
                });

            _area.x(function(d) {
                    return _x(d[_dimension[0]]);
                })
                .y0(parentHeight)
                .y1(function(d) {
                    return _y(d[_measure[0]]);
                });

            var plot = graphics.append('g')
                .attr('id', 'infographics-plot');

            plot.append('path')
                .classed('infographics-line', true)
                .style('fill', 'none')
                .style('stroke', _chartBorderColor)
                .style('stroke-linejoin', 'round')
                .style('stroke-linecap', 'round')
                .style('stroke-width', 4)
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

            plot.append('path')
                .classed('infographics-area', true)
                .style('fill', _chartDisplayColor)
                .style('stroke-width', 0)
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

            plot.append('g')
                .attr('id', 'infographics-point-group')
                .selectAll('.infographics-point')
                .data(data)
                .enter().append('circle')
                    .classed('infographics-point', true)
                    .attr('cx', function(d, i) {
                        return _x(d[_dimension[0]]);
                    })
                    .attr('cy', function(d, i) {
                        return _y(d[_measure[0]]);
                    })
                    .attr('r', 4)
                    .style('fill', _chartBorderColor)
                    .style('stroke', d3.hsl(_chartBorderColor).darker(1).toString())
                    .style('stroke-width', 0)
                    .on('mouseover', _handleMouseOverFn.call(chart, _localTooltip, infographics))
                    .on('mousemove', _handleMouseMoveFn.call(chart, _localTooltip, infographics))
                    .on('mouseout', _handleMouseOutFn.call(chart, _localTooltip, infographics))
                    .on('click', function(d, i) {
                        
                    });
                
            var measure = info.append('div')
                .classed('measure', true)
                .style('justify-content', _kpiAlignment);

            var parent = measure.append('div')
                .classed('parent', true);
                
            parent.append('div')
                .attr('id', 'kpi-label')
                .classed('child', true)
                .html(_getKpiDisplayName())
                .style('font-size', '1.2em')
                .style('padding-left', '5px');

            parent.append('div')
                .attr('id', 'kpi-measure')
                .classed('child', true)
                .style('font-size', _kpiFontSize)
                .style('border-radius', function(d, i1) {
                    return COMMON.BORDER_RADIUS + 'px';
                })
                .style('background-color', function(d, i1) {
                    return _kpiBackgroundColor || 'transparent';
                })
                .style('padding', function(d, i1) {
                    return (_kpiFontStyle == 'oblique')
                        ? '3px 8px'
                        : '3px 0px';
                })
                .transition()
                .ease(d3.easeQuadIn)
                .duration(COMMON.DURATION)
                .delay(0)
                .tween('html', function() {
                    var me = d3.select(this),
                        i = d3.interpolateNumber(_localPrevKpiValue, _localTotal);

                    _localPrevKpiValue = _localTotal;

                    return function(t) {
                        me.html(_getKpi(i(t), _localTotal));
                    }
                });
        });
    }

    chart._getName = function() {
        return _NAME;
    }

    chart.update = function(data) {
        var div = _localDiv;

        /* store the data in local variable */
        _localData = data;

        /* total sum of the measure values */
        _localTotal = d3.sum(data.map(function(d) { return d[_measure[0]]; }));

        /* Label values for the dimension */
        _localXLabels = data.map(function(d) {
            return d[_dimension[0]];
        });

        /* Minimum and Maximum value of the measures */
        _localMin = d3.min(data, function(d) { return d[_measure[0]]; });
        _localMax = d3.max(data, function(d) { return d[_measure[0]]; });
        
        /* Update the axes scales */
        _x.domain(_localXLabels);
        _y.domain([_localMin, _localMax]);

        var plot = div.select('#infographics-plot')
            .data([data]);

        plot.select('path.infographics-line')
            .transition()
            .duration(COMMON.DURATION)
            .attr('d', _line)
            .attr('stroke-dasharray', 'none');

        plot.select('path.infographics-area')
            .transition()
            .duration(COMMON.DURATION)
            .attr('d', _area);

        plot.selectAll('.infographics-point')
            .data(function(d) { return d; })
            .transition()
            .duration(COMMON.DURATION)
            .attr('cx', function(d, i) {
                return _x(d[_dimension[0]]);
            })
            .attr('cy', function(d, i) {
                return _y(d[_measure[0]]);
            });

        div.select('#kpi-measure')
            .transition()
            .ease(d3.easeQuadIn)
            .duration(500)
            .delay(0)
            .tween('html', function() {
                var me = d3.select(this),
                    i = d3.interpolateNumber(_localPrevKpiValue, _localTotal);

                _localPrevKpiValue = _localTotal;

                return function(t) {
                    me.html(_getKpi(i(t), _localTotal));
                }
            });
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

    chart.chartType = function(value) {
        if(!arguments.length) {
            return _chartType;
        }
        _chartType = value;
        return chart;
    }

    chart.chartBorderColor = function(value) {
        if(!arguments.length) {
            return _chartBorderColor;
        }
        _chartBorderColor = value;
        return chart;
    }

    chart.chartDisplayColor = function(value) {
        if(!arguments.length) {
            return _chartDisplayColor;
        }
        _chartDisplayColor = value;
        return chart;
    }
    
    chart.kpiDisplayName = function(value) {
        if(!arguments.length) {
            return _kpiDisplayName;
        }
        _kpiDisplayName = value;
        return chart;
    }

    chart.kpiAlignment = function(value) {
        if(!arguments.length) {
            return _kpiAlignment;
        }
        _kpiAlignment = value;
        return chart;
    }

    chart.kpiBackgroundColor = function(value) {
        if(!arguments.length) {
            return _kpiBackgroundColor;
        }
        _kpiBackgroundColor = value;
        return chart;
    }

    chart.kpiNumberFormat = function(value) {
        if(!arguments.length) {
            return _kpiNumberFormat;
        }
        _kpiNumberFormat = value;
        return chart;
    }

    chart.kpiFontStyle = function(value) {
        if(!arguments.length) {
            return _kpiFontStyle;
        }
        _kpiFontStyle = value;
        return chart;
    }

    chart.kpiFontWeight = function(value) {
        if(!arguments.length) {
            return _kpiFontWeight;
        }
        _kpiFontWeight = value;
        return chart;
    }

    chart.kpiFontSize = function(value) {
        if(!arguments.length) {
            return _kpiFontSize;
        }
        _kpiFontSize = value;
        return chart;
    }

    chart.kpiColor = function(value) {
        if(!arguments.length) {
            return _kpiColor;
        }
        _kpiColor = value;
        return chart;
    }

    chart.kpiColorExpression = function(value) {
        if(!arguments.length) {
            return _kpiColorExpression;
        }
        _kpiColorExpression = UTIL.getExpressionConfig(value, ['color']);
        return chart;
    }

    chart.kpiIcon = function(value) {
        if(!arguments.length) {
            return _kpiIcon;
        }
        _kpiIcon = value;
        return chart;
    }

    chart.kpiIconFontWeight = function(value) {
        if(!arguments.length) {
            return _kpiIconFontWeight;
        }
        _kpiIconFontWeight = value;
        return chart;
    }

    chart.kpiIconColor = function(value) {
        if(!arguments.length) {
            return _kpiIconColor;
        }
        _kpiIconColor = value;
        return chart;
    }

    chart.kpiIconExpression = function(value) {
        if(!arguments.length) {
            return _kpiIconExpression;
        }
        _kpiIconExpression = UTIL.getExpressionConfig(value, ['icon', 'color']);
        return chart;
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

module.exports = infographics;
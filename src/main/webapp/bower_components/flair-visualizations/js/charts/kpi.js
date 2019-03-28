var COMMON = require('../extras/common.js')(),
    UTIL = require('../extras/util.js')(),
    LEGEND = require('../extras/legend.js')();

function kpi() {

    /* These are the constant global variable for the function kpi.
     */
    var _NAME = 'kpi';

    /* These are the private variables that is initialized by the arguments sent
     * by the users and can be updated using public methods.
     */

    var _config,
        _dimension,
        _measure,
        /* Initialization of these variable is important, otherwise Windows object
         * will be sent during calling of baseAccessor function
         */
        _kpiDisplayName = [],
        _kpiAlignment = [],
        _kpiBackgroundColor = [],
        _kpiNumberFormat = [],
        _kpiFontStyle = [],
        _kpiFontWeight = [],
        _kpiFontSize = [],
        _kpiColor = [],
        _kpiColorExpression = [],
        _kpiIcon = [],
        _kpiIconFontWeight = [],
        _kpiIconColor = [],
        _kpiIconExpression = [];

    /* These are the common variables that is shared across the different private/public 
     * methods but is initialized/updated within the methods itself.
     */
    var _localDiv,
        _localTotal = [],
        _localPrevKpiValue = [0, 0],
        _localData,
        _localLabelFontSize = [1.2, 0.9];

    /* These are the common private functions that is shared across the different private/public 
     * methods but is initialized beforehand.
     */


    /* -------------------------------------------------------------------------------- */
    var _setConfigParams = function(config) {
        this.dimension(config.dimension);
        this.measure(config.measure);
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
    }

    /**
     * Gives label for a particular measure
     *
     * @param {number} index Index for a particular measure
     * @return {string}
     */
    var _getKpiDisplayName = function(index) {
        if(_kpiDisplayName[index].trim() == '') {
            return _measure[index];
        }

        return _kpiDisplayName[index];
    }

    /**
     * HTML data for the KPI value
     *
     * @param {number} value Accumulated value of the measure
     * @param {number} endValue End value upto which the transition should occur
     * @param {nummber} index Index of the measure for which the HTML output of the KPI is required
     * @return {string}
     */
    var _getKpi = function(value, endValue, index) {
        var numberOutput = "",
            iconOutput = "";

        var style = {
            'font-style': _kpiFontStyle[index] || COMMON.DEFAULT_FONTSTYLE,
            'font-weight': _kpiFontWeight[index] || COMMON.DEFAULT_FONTWEIGHT,
            'font-size': _kpiFontSize[index] || COMMON.DEFAULT_FONTSIZE,
            'color': _kpiColor[index] || COMMON.DEFAULT_COLOR
        };

        if(_kpiColorExpression[index].length) {
            style['color'] = UTIL.expressionEvaluator(_kpiColorExpression[index], endValue, 'color');
        }

        style = JSON.stringify(style);
        style = style.replace(/["{}]/g, '').replace(/,/g, ';');

        numberOutput += "<span style='" + style + "'>"
            + UTIL.getNumberFormatterFn(_kpiNumberFormat[index])(UTIL.roundNumber(value, 0)).toUpperCase()
            + "</span>";

        var iconStyle = {
            'font-weight': _kpiIconFontWeight[index] || COMMON.DEFAULT_FONTWEIGHT,
            'color': _kpiIconColor[index] || COMMON.DEFAULT_COLOR,
            'font-size': _kpiFontSize[index] || COMMON.DEFAULT_FONTSIZE
        };

        if(_kpiIconExpression[index].length) {
            _kpiIcon[index] = UTIL.expressionEvaluator(_kpiIconExpression[index], endValue, 'icon');
            iconStyle['color'] = UTIL.expressionEvaluator(_kpiIconExpression[index], endValue, 'color');
        }

        iconStyle = JSON.stringify(iconStyle);
        iconStyle = iconStyle.replace(/["{}]/g, '').replace(/,/g, ';');

        iconOutput += "<i class=\"" + _kpiIcon[index] + "\" style=\"" + iconStyle + "\" aria-hidden=\"true\"></i>";

        return index ? (iconOutput + "&nbsp;" + numberOutput)
            : (numberOutput + "&nbsp;" + iconOutput);
    }

    function chart(selection) {
        _localDiv = selection;

        selection.each(function(data) {
            var kpi = d3.select(this),
                width = parseInt(kpi.style('width')),
                height = parseInt(kpi.style('height'));

            /* total sum of the measure values */
            _localTotal = _measure.map(function(m) {
                return d3.sum(data.map(function(d) { return d[m]; }));
            });

            /* store the data in local variable */
            _localData = data;

            var container = kpi.append('div')
                .classed('container', true)
                .style('width', width - 2 * COMMON.PADDING)
                .style('height', height - 2 * COMMON.PADDING)
                .style('padding', COMMON.PADDING);

            _measure.forEach(function(m, i) {
                var measure = container.append('div')
                    .classed('measure', true)
                    .style('align-items', function(d, i1) {
                        return i ? 'center' : 'flex-end';
                    })
                    .style('justify-content', _kpiAlignment[i])
                        .append('div')
                        .classed('parent', true);

                measure.append('div')
                    .attr('id', function(d, i1) {
                        return 'kpi-label-' + i;
                    })
                    .classed('child', true)
                    .html(_getKpiDisplayName(i))
                    .style('font-size', function(d, i1) {
                        return _localLabelFontSize[i] + 'em';
                    })
                    .style('padding-left', '5px')
                    .style('text-align', function(d, i1) {
                        return i ? 'right' : 'left';
                    });

                measure.insert('div', (function() {
                        return i ? ':first-child' : null;
                    })())
                    .attr('id', function(d, i1) {
                        return 'kpi-measure-' + i;
                    })
                    .classed('child', true)
                    .style('font-size', _kpiFontSize[i])
                    .style('border-radius', function(d, i1) {
                        return COMMON.BORDER_RADIUS + 'px';
                    })
                    .style('background-color', function(d, i1) {
                        return _kpiBackgroundColor[i] || 'transparent';
                    })
                    .style('padding', function(d, i1) {
                        return (_kpiFontStyle[i] == 'oblique' && i)
                            ? '3px 8px'
                            : '3px 0px';
                    })
                    .transition()
                    .ease(d3.easeQuadIn)
                    .duration(1000)
                    .delay(0)
                    .tween('html', function() {
                        var me = d3.select(this),
                            interpolator = d3.interpolateNumber(_localPrevKpiValue[i], _localTotal[i]);

                        _localPrevKpiValue[i] = _localTotal[i];
                        
                        return function(t) {
                            me.html(_getKpi(interpolator(t), _localTotal[i], i));
                        }
                    });
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
        _localTotal = _measure.map(function(m) {
            return d3.sum(data.map(function(d) { return d[m]; }));
        });

        _measure.forEach(function(m, i) {
            d3.select('#kpi-measure-' + i)
                .transition()
                .ease(d3.easeQuadIn)
                .duration(500)
                .delay(0)
                .tween('html', function() {
                    var me = d3.select(this),
                        interpolator = d3.interpolateNumber(_localPrevKpiValue[i], _localTotal[i]);

                    _localPrevKpiValue[i] = _localTotal[i];

                    return function(t) {
                        me.html(_getKpi(interpolator(t), _localTotal[i], i));
                    }
                });
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
    
    /**
     * KPI Displayname accessor function
     *
     * @param {string|array(string)|null} value Displayname value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.kpiDisplayName = function(value, measure) {
        return UTIL.baseAccessor.call(_kpiDisplayName, value, measure, _measure);
    }

    /**
     * KPI Alignment accessor function
     *
     * @param {string|array(string)|null} value Alignment value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.kpiAlignment = function(value, measure) {
        return UTIL.baseAccessor.call(_kpiAlignment, value, measure, _measure);
    }

    /**
     * KPI Background Color accessor function
     *
     * @param {string|array(string)|null} value Background Color value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.kpiBackgroundColor = function(value, measure) {
        return UTIL.baseAccessor.call(_kpiBackgroundColor, value, measure, _measure);
    }

    /**
     * KPI Number Format accessor function
     *
     * @param {string|array(string)|null} value Number Format value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.kpiNumberFormat = function(value, measure) {
        return UTIL.baseAccessor.call(_kpiNumberFormat, value, measure, _measure);
    }

    /**
     * KPI Font Style accessor function
     *
     * @param {string|array(string)|null} value Font Style value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.kpiFontStyle = function(value, measure) {
        return UTIL.baseAccessor.call(_kpiFontStyle, value, measure, _measure);
    }

    /**
     * KPI Font Weight accessor function
     *
     * @param {string|array(string)|null} value Font Weight value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.kpiFontWeight = function(value, measure) {
        return UTIL.baseAccessor.call(_kpiFontWeight, value, measure, _measure);
    }

    /**
     * KPI Font Size accessor function
     *
     * @param {string|array(string)|null} value Font Size value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.kpiFontSize = function(value, measure) {
        return UTIL.baseAccessor.call(_kpiFontSize, value, measure, _measure);
    }

    /**
     * KPI Font Color accessor function
     *
     * @param {string|array(string)|null} value Font Color value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.kpiColor = function(value, measure) {
        return UTIL.baseAccessor.call(_kpiColor, value, measure, _measure);
    }

    /**
     * KPI Font Color Expression accessor function
     *
     * @param {string|array(string)|null} value Font Color Expression value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.kpiColorExpression = function(value, measure) {
        if(!arguments.length) {
            /**
             * Getter method call with no arguments
             * E.g. <chart>.kpiColorExpression() ==> [<item1>, <item2>]
             */
            return _kpiColorExpression;
        }

        if(value instanceof Array && measure == void 0) {
            /**
             * Setter method call with only value argument
             * E.g. <chart>.kpiColorExpression([<item1>, <item2>]) ==> <chart_function>
             */
            _kpiColorExpression = value.map(function(v) {
                return UTIL.getExpressionConfig(v, ['color']);
            });
            return chart;
        }

        var index = _measure.indexOf(measure);

        if(index === -1) {
            throw new Error('Invalid measure provided');
        }

        if(value == void 0) {
            /**
             * Getter method call with only measure argument
             * E.g. <chart>.kpiColorExpression(<measure>) ==> <item>
             */
            return _kpiColorExpression[index];
        } else {
            /**
             * Setter method call with both value and measure arguments
             * E.g. <chart>.kpiColorExpression(<item>, <measure>) ==> <chart_function>
             */
            _kpiColorExpression[index] = UTIL.getExpressionConfig(value, ['color']);
        }

        return chart;
    }

    /**
     * KPI Icon accessor function
     *
     * @param {string|array(string)|null} value Icon value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.kpiIcon = function(value, measure) {
        return UTIL.baseAccessor.call(_kpiIcon, value, measure, _measure);
    }

    /**
     * KPI Icon Font Weight accessor function
     *
     * @param {string|array(string)|null} value Icon Font Weight value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.kpiIconFontWeight = function(value, measure) {
        return UTIL.baseAccessor.call(_kpiIconFontWeight, value, measure, _measure);
    }

    /**
     * KPI Icon Color accessor function
     *
     * @param {string|array(string)|null} value Icon Color value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.kpiIconColor = function(value, measure) {
        return UTIL.baseAccessor.call(_kpiIconColor, value, measure, _measure);
    }

    /**
     * KPI Icon Color Expression accessor function
     *
     * @param {string|array(string)|null} value Icon Color Expression value for the measure(s)
     * @param {string|null} measure Measure for which the value is to be set or retrieved
     * @return {string|array(string)|function}
     */
    chart.kpiIconExpression = function(value, measure) {
        if(!arguments.length) {
            /**
             * Getter method call with no arguments
             * E.g. <chart>.kpiIconExpression() ==> [<item1>, <item2>]
             */
            return _kpiIconExpression;
        }

        if(value instanceof Array && measure == void 0) {
            /**
             * Setter method call with only value argument
             * E.g. <chart>.kpiIconExpression([<item1>, <item2>]) ==> <chart_function>
             */
            _kpiIconExpression = value.map(function(v) {
                return UTIL.getExpressionConfig(v, ['icon', 'color']);
            });
            return chart;
        }

        var index = _measure.indexOf(measure);

        if(index === -1) {
            throw new Error('Invalid measure provided');
        }

        if(value == void 0) {
            /**
             * Getter method call with only measure argument
             * E.g. <chart>.kpiIconExpression(<measure>) ==> <item>
             */
            return _kpiIconExpression[index];
        } else {
            /**
             * Setter method call with both value and measure arguments
             * E.g. <chart>.kpiIconExpression(<item>, <measure>) ==> <chart_function>
             */
            _kpiIconExpression[index] = UTIL.getExpressionConfig(value, ['icon', 'color']);
        }

        return chart;
    }

    return chart;
}

module.exports = kpi;
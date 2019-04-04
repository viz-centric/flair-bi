var COMMON = require('../extras/common.js')(),
    UTIL = require('../extras/util.js')();

function gauge() {

    var _NAME = 'gauge';
    var _config,
        measures,
        gaugeType,
        displayName,
        fontStyle,
        fontWeight,
        showValues,
        displayColor,
        isGradient,
        textColor,
        numberFormat,
        targetDisplayName,
        targetFontStyle,
        targetFontWeight,
        targetShowValues,
        targetDisplayColor,
        targetTextColor,
        targetNumberFormat;

    var _local_svg;

    var emptyArc, fillArc, targetArc, arc, svg, _measure, target;
    var ringInset, ringWidth;


    var _setConfigParams = function (config) {
        this.measures(config.measures);
        this.gaugeType(config.gaugeType);
        this.displayName(config.displayName);
        this.fontStyle(config.fontStyle);
        this.fontWeight(config.fontWeight);
        this.showValues(config.showValues);
        this.displayColor(config.displayColor);
        this.isGradient(config.isGradient);
        this.textColor(config.textColor);
        this.numberFormat(config.numberFormat);
        this.targetDisplayName(config.targetDisplayName);
        this.targetFontStyle(config.targetFontStyle);
        this.targetFontWeight(config.targetFontWeight);
        this.targetShowValues(config.targetShowValues);
        this.targetDisplayColor(config.targetDisplayColor);
        this.targetTextColor(config.targetTextColor);
        this.targetNumberFormat(config.targetNumberFormat);
    }

    var degToRad = function (deg) {
        return deg * Math.PI / 180;
    }

    var percToDeg = function (perc) {
        return perc * 360;
    }

    var percToRad = function (perc) {
        return degToRad(percToDeg(perc));
    }

    var getTxCenter = function (width, height) {
        if (gaugeType == 'radial') {
            return 'translate(' + (width / 2) + ', ' + (height / 2) + ')';
        } else {
            return 'translate(' + (width / 2) + ', ' + (height - 15) + ')';
        }
    }

    function chart(selection) {
        _local_svg = selection;

        selection.each(function (data) {
            var div = d3.select(this).node().parentNode;
            _local_svg = d3.select(this);

            width = div.clientWidth,
                height = div.clientHeight;

            _local_svg.selectAll('g').remove();

            _local_svg.attr('width', width)
                .attr('height', height)

            var radius;
            if (gaugeType === 'radial') {
                radius = Math.min(width, height) / 2;
            } else {
                radius = Math.max(width, height) / 2;
                radius = radius > Math.min(width, height) ? Math.min(width, height) : radius;
            }

            ringInset = radius * 0.3,
                ringWidth = radius * 0.2;

            arc = d3.arc()
                .innerRadius(radius - ringInset - ringWidth)
                .outerRadius(radius - ringInset)
                .startAngle(degToRad(-90))

            var plot = _local_svg
                .append("g")
                .attr("transform", getTxCenter(width, height))

            emptyArc = plot.append("path")
                .datum({
                    endAngle: degToRad(90)
                })
                .style("fill", ' #efefef')
                .attr("class", "gaugeBackground")
                .attr("d", arc)

            fillArc = plot.append("path")
                .datum({
                    endAngle: degToRad(-90)
                })
                .attr("class", "fillArc")
                .style("fill", displayColor)
                .attr("d", arc);

            targetArc = plot.append("path")
                .datum({
                    endAngle: degToRad(-90)
                })
                .attr("class", "targetArc")
                .style("fill", targetDisplayColor)
                .attr("d", arc);

            _measure = plot.append("text")
                .attr("transform", "translate(0," + -(-20 + ringInset / 4) + ")")
                .attr("text-anchor", "middle")
                .style('font-size', '12px')
                .style('font-weight', fontWeight)
                .style('font-style', fontStyle)
                .style('visibility', showValues)
                .style('fill', textColor)
                .attr('dy', -15)
                .text(displayName + " " + data[0][measures[0]])

            target = plot.append("text")
                .attr("transform", "translate(0," + -(-20 + ringInset / 4 + 15) + ")")
                .attr("text-anchor", "middle")
                .style('font-size', '12px')
                .style('font-weight', targetFontWeight)
                .style('font-style', targetFontStyle)
                .style('visibility', targetShowValues)
                .style('fill', targetTextColor)
                .attr('dy', -15)
                .text(displayName + " " + data[0][measures[0]])

            chart.update(data);

        });

    }
    chart.update = function (value) {

        var maxVal = Math.max(value[0][measures[0]], value[0][measures[1]]);

        var _measurePi = degToRad(Math.floor(value[0][measures[0]] * 180 / maxVal - 90));
        var targetPi = degToRad(Math.floor(value[0][measures[1]] * 180 / maxVal - 90));

        _measure.transition()
            .text(displayName + " " + value[0][measures[0]])

        target.transition()
            .text(targetDisplayName + " " + value[0][measures[1]])

        fillArc.transition()
             .duration(COMMON.DURATION)
            .styleTween("fill", function () {
                return d3.interpolate(displayColor);
            })
            .call(arcTween, _measurePi)


        targetArc.transition()
             .duration(COMMON.DURATION)
            .styleTween("fill", function () {
                return d3.interpolate(targetDisplayColor);
            })
            .call(arcTween, targetPi);
    }

    var arcTween = function (transition, newAngle) {
        transition.attrTween("d", function (d) {
            var interpolate = d3.interpolate(d.endAngle, newAngle);
            return function (t) {
                d.endAngle = interpolate(t);
                return arc(d);
            };
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
    chart.measures = function (value) {
        if (!arguments.length) {
            return measures;
        }
        measures = value;
        return chart;
    }
    chart.gaugeType = function (value) {
        if (!arguments.length) {
            return gaugeType;
        }
        gaugeType = value;
        return chart;
    }

    chart.displayName = function (value) {
        if (!arguments.length) {
            return displayName;
        }
        displayName = value;
        return chart;
    }

    chart.textColor = function (value) {
        if (!arguments.length) {
            return textColor;
        }
        textColor = value;
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

    chart.showValues = function (value) {
        if (!arguments.length) {
            return showValues;
        }
        showValues = value;
        return chart;
    }

    chart.displayColor = function (value) {
        if (!arguments.length) {
            return displayColor;
        }
        displayColor = value;
        return chart;
    }

    chart.isGradient = function (value) {
        if (!arguments.length) {
            return isGradient;
        }
        isGradient = value;
        return chart;
    }

    chart.numberFormat = function (value) {
        if (!arguments.length) {
            return numberFormat;
        }
        numberFormat = value;
        return chart;
    }

    chart.targetDisplayName = function (value) {
        if (!arguments.length) {
            return targetDisplayName;
        }
        targetDisplayName = value;
        return chart;
    }

    chart.targetFontStyle = function (value) {
        if (!arguments.length) {
            return targetFontStyle;
        }
        targetFontStyle = value;
        return chart;
    }

    chart.targetFontWeight = function (value) {
        if (!arguments.length) {
            return targetFontWeight;
        }
        targetFontWeight = value;
        return chart;
    }

    chart.targetShowValues = function (value) {
        if (!arguments.length) {
            return targetShowValues;
        }
        targetShowValues = value;
        return chart;
    }

    chart.targetDisplayColor = function (value) {
        if (!arguments.length) {
            return targetDisplayColor;
        }
        targetDisplayColor = value;
        return chart;
    }

    chart.targetTextColor = function (value) {
        if (!arguments.length) {
            return targetTextColor;
        }
        targetTextColor = value;
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
module.exports = gauge;

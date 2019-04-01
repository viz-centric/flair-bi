function map() {

    var _NAME = 'map';

    var _config,
        _dimension,
        _measure,
        _numberFormat,
        _displayColor,
        _borderColor,
        _tooltip;

    var _local_svg;
    var x, y;

    var margin = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
    };

    var _local_svg, _Local_data, _originalData, valueMapper = [];


    var filter = false, filterData = [], gradientColor = d3.scaleLinear();

    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.measure(config.measure);
        this.numberFormat(config.numberFormat);
        this.displayColor(config.displayColor);
        this.borderColor(config.borderColor);
    }

    var _buildTooltipData = function (datum, chart) {
        var output = "";
        output += "<table><tr>"
            + "<th>" + chart.dimension() + ": </th>"
            + "<td>" + datum.properties.name + "</td>"
            + "</tr>"
            + "<tr>"
            + "<th>" + chart.measure() + ": </th>"
            + "<td>" + valueMapper[datum.properties.name] + "</td>"
            + "</tr>"
            + "</table>";

        return output;
    }
    var getFillColor = function (value) {
        if (value) {
            return gradientColor(value);
        }
        return COMMON.DEFAULT_COLOR;
    }

    var _handleMouseOverFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            d3.select(this).style('cursor', 'pointer')
                .style('cursor', 'pointer')

            var border = getFillColor(valueMapper[d.properties.name]);

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
                var border = getFillColor(valueMapper[d.properties.name]);
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
    var onLassoStart = function (lasso, chart) {
        return function () {
            if (filter) {
                lasso.items()
                    .classed('not_possible', true)
                    .classed('selected', false);
            }
        }
    }

    var onLassoDraw = function (lasso, chart) {
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

            lasso.selectedItems()
                .classed('selected', true)

            lasso.notSelectedItems()

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
    function chart(selection) {
        _local_svg = selection;

        selection.each(function (data) {
            _originalData = data;
            var me = this;
            div = d3.select(this).node().parentNode;

            var width = div.clientWidth,
                height = div.clientHeight;

            var plotWidth = width - margin.left - margin.right * 2,
                plotHeight = height - margin.top - margin.bottom * 2;

            var svg = _local_svg = d3.select(this)

            svg.selectAll('g').remove();

            if (_tooltip) {
                tooltip = d3.select(this.parentNode).select('#tooltip');
            }

            svg.attr('width', width)
                .attr('height', height);

            var container = svg.append('g')
                .attr('class', 'map')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            var projection = d3.geoMercator()
                .scale(130)
                .translate([plotWidth / 2, plotHeight / 1.4]);

            var path = d3.geoPath().projection(projection);

            d3.queue()
                .defer(d3.json, 'script/world-topo-min.json')
                .await(ready);

            data.forEach(function (d) {
                valueMapper[d[_dimension[0]]] = d[_measure[0]];
            });

            var countries = Object.keys(valueMapper);

            gradientColor.range([
                d3.rgb(_displayColor).brighter(),
                d3.rgb(_displayColor).darker()
            ])

            gradientColor.domain(d3.extent(data, function (d) {
                return d[_measure[0]];
            }));

            function ready(error, mapData) {
                me._mapdata = mapData;

                var country = container.selectAll('.country')
                    .data(topojson.feature(mapData, mapData.objects.countries).features)

                country.enter().insert('path')
                    .attr('class', 'country')
                    .attr('id', function (d, i) {
                        return d.id;
                    })
                    .attr('d', path)
                    .style('fill', function (d, i) {
                        return getFillColor(valueMapper[d.properties.name]);
                    })
                    .style('stroke', function (d, i) {
                        return _borderColor || COMMON.DEFAULT_COLOR;
                    })
                    .style('stroke-width', 0.5)
                    .filter(function (d) {
                        return countries.indexOf(d.properties.name) !== -1;
                    })
                    .on('mouseover', _handleMouseOverFn.call(chart, tooltip, _local_svg))
                    .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, _local_svg))
                    .on('mouseout', _handleMouseOutFn.call(chart, tooltip, _local_svg))
                var lasso = d3.lasso()
                    .hoverSelect(true)
                    .closePathSelect(true)
                    .closePathDistance(100)
                    .items(country)
                    .targetArea(svg);

                lasso.on('start', onLassoStart(lasso, chart))
                    .on('draw', onLassoDraw(lasso, chart))
                    .on('end', onLassoEnd(lasso, chart));

                svg.call(lasso);
            }

        });
    }


    chart._getName = function () {
        return _NAME;
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


    chart.numberFormat = function (value) {
        if (!arguments.length) {
            return _numberFormat;
        }
        _numberFormat = value;
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
            return __borderColor;
        }
        __borderColor = value;
        return chart;
    }

    return chart;
}
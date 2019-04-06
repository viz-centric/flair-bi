import angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .factory('GenerateMap', GenerateMap);

GenerateMap.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils', 'filterParametersService'];

function GenerateMap(VisualizationUtils, $rootScope, D3Utils, filterParametersService) {
    return {
        build: function (record, element, panel) {

            function getProperties(VisualizationUtils, record) {
                var result = {};

                var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
                    dimension = features.dimensions,
                    measure = features.measures;

                result['dimension'] = D3Utils.getNames(dimension)[0];
                result['measure'] = D3Utils.getNames(measure)[0];

                result['displayColor'] = VisualizationUtils.getFieldPropertyValue(dimension[0], 'Display colour');
                result['borderColor'] = VisualizationUtils.getFieldPropertyValue(dimension[0], 'Border colour');
                result['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Number format');

                return result;
            }

            var Helper = (function () {

                var DEFAULT_COLOR = "#dedede";

                function Helper(config) {
                    this.config = config;
                    this.dimension = config.dimension;
                    this.measure = config.measure;
                    this.displayColor = config.displayColor;
                    this.borderColor = config.borderColor;
                    this.numberFormat = config.numberFormat;
                    this.gradientColor = d3.scaleLinear();
                    this.total = 0;

                    this.gradientColor.range([
                        d3.rgb(this.displayColor).brighter(),
                        d3.rgb(this.displayColor).darker()
                    ])
                }

                Helper.prototype.getMargin = function () {
                    return {
                        top: 10,
                        right: 10,
                        bottom: 10,
                        left: 10
                    };
                }

                Helper.prototype.getFillColor = function (value) {
                    if (value) {
                        return this.gradientColor(value);
                    }

                    return DEFAULT_COLOR;
                }

                Helper.prototype.getBorderColor = function () {
                    return this.borderColor || DEFAULT_COLOR;
                }

                Helper.prototype.getValueNumberFormat = function (index) {
                    var si = this.numberFormat,
                        nf = D3Utils.getNumberFormatter(si);

                    return nf;
                }

                Helper.prototype.toggleTooltip = function (visibility, scope) {
                    return function (d, i) {
                        var tooltip = d3.select(scope.container).select('.tooltip_custom');

                        if (visibility == 'visible') {
                            d3.select(this).style('cursor', 'pointer');
                            tooltip.html((function () {
                                var nf = D3Utils.getNumberFormatter(scope.helper.numberFormat),
                                    value;

                                if (scope.helper.numberFormat == "Percent") {
                                    value = nf(scope.valueMapper[d.properties.name] / scope.helper.total);
                                } else {
                                    value = nf(scope.valueMapper[d.properties.name]);
                                }

                                if (value.indexOf("G") != -1) {
                                    value = value.slice(0, -1) + "B";
                                }
                                return '<table><tr><td>' + d.properties.name + '</td></tr>'
                                    + '<tr><td>' + D3Utils.title(scope.helper.measure) + ': </td><td>' + value + '</td></tr></table>';
                            })());
                        } else {
                            d3.select(this).style('cursor', 'default');
                        }

                        var offset = $(scope.container).offset();
                        var x = d3.event.pageX - offset.left,
                            y = d3.event.pageY - offset.top;

                        tooltip.style('top', y + 'px').style('left', x + 'px');
                        tooltip.style('visibility', visibility);
                        D3Utils.constrainTooltip(scope.container, tooltip.node());

                        if (visibility == 'visible') {
                            d3.select(this).style('fill', '#44a5d1');
                        } else {
                            d3.select(this).style('fill', function (d, i) {
                                return scope.helper.getFillColor(scope.valueMapper[d.properties.name]);
                            });
                        }
                    };
                }

                Helper.prototype.onLassoStart = function (lasso, scope) {
                    return function () {
                        if ($rootScope.filterSelection.lasso) {
                            lasso.items()
                                .classed('not_possible', true)
                                .classed('selected', false);
                        }
                    }
                }

                Helper.prototype.onLassoDraw = function (lasso, scope) {
                    return function () {
                        $rootScope.filterSelection.lasso = true;
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

                Helper.prototype.onLassoEnd = function (lasso, scope) {
                    return function () {
                        var data = lasso.selectedItems().data();

                        if ($rootScope.filterSelection.id && $rootScope.filterSelection.id != record.id) {
                            return;
                        }

                        if (!$rootScope.filterSelection.lasso) {
                            return;
                        }

                        lasso.items()
                            .classed('not_possible', false)
                            .classed('possible', false);

                        lasso.selectedItems()
                            .classed('selected', true)

                        lasso.notSelectedItems();

                        var confirm = d3.select(scope.container).select('.confirm')
                            .style('visibility', 'visible');

                        var filter = {};
                        $rootScope.filterSelection.id = scope.id;

                        data.forEach(function (d) {
                            if (filter[scope.helper.dimension]) {
                                var temp = filter[scope.helper.dimension];
                                if (temp.indexOf(d[d.properties.name]) < 0) {
                                    temp.push(d[d.properties.name]);
                                }
                                filter[scope.helper.dimension] = temp;
                            } else {
                                filter[scope.helper.dimension] = [d[d.properties.name]];
                            }
                        });

                        // Clear out the updateWidget property
                        var idWidget = $rootScope.updateWidget[scope.id];
                        $rootScope.updateWidget = {};
                        $rootScope.updateWidget[scope.id] = idWidget;

                        $rootScope.filterSelection.filter = filter;
                        filterParametersService.save(filter);
                        $rootScope.$broadcast('flairbiApp:filter-input-refresh');
                        $rootScope.$broadcast('flairbiApp:filter');
                    }
                }

                return Helper;

            })();

            var Map = (function () {

                function Map(container, record, properties) {
                    this.container = container;
                    this.id = record.id;
                    this.originalData = record.data;
                    this.helper = new Helper(properties);
                    this.valueMapper = {};

                    $('#map-' + this.id).remove();
                    var div = d3.select(container).append('div')
                        .attr('id', 'map-' + this.id)
                        .style('width', this.container.clientWidth + 'px')
                        .style('height', this.container.clientHeight + 'px')
                        .style('overflow', 'hidden')
                        .style('text-align', 'center')
                        .style('position', 'relative');

                    div.append('svg');

                    div.append('div')
                        .attr('class', 'tooltip_custom');

                    D3Utils.prepareFilterButtons(div, $rootScope, filterParametersService);
                }

                Map.prototype.updateChart = function (data) {
                    var me = this;

                    var container = d3.select(this.container),
                        svg = container.select('svg');

                    this.originalData = data;

                    this.valueMapper = {};

                    data.forEach(function (d) {
                        me.valueMapper[d[me.helper.dimension[0]]] = d[me.helper.measure[0]];
                    });

                    var countries = Object.keys(me.valueMapper);

                    this.helper.gradientColor.domain(d3.extent(data, function (d) {
                        return d[me.helper.measure[0]];
                    }));

                    var country = container.selectAll('.country')
                        .data(topojson.feature(me._mapData, me._mapData.objects.countries).features);

                    country.exit().remove();
                    country.enter().insert('path')
                        .attr('class', 'country')
                }

                Map.prototype.renderChart = function () {
                    var data = this.originalData;
                    var me = this;

                    var width = this.container.clientWidth;
                    var height = this.container.clientHeight;

                    var margin = this.helper.getMargin();

                    var containerWidth = width - margin.left - margin.right,
                        containerHeight = height - margin.top - margin.bottom;

                    var svg = d3.select(this.container).select('svg');

                    svg.selectAll('g').remove();

                    svg.attr('width', width)
                        .attr('height', height);

                    var container = svg.append('g')
                        .attr('class', 'map')
                        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

                    var projection = d3.geoMercator()
                        .scale(130)
                        .translate([containerWidth / 2, containerHeight / 1.4]);

                    var path = d3.geoPath().projection(projection);

                    queue()
                        .defer(d3.json, 'content/data/world-topo-min.json')
                        .await(ready);

                    data.forEach(function (d) {
                        me.valueMapper[d[me.helper.dimension[0]]] = d[me.helper.measure[0]];
                    });

                    var countries = Object.keys(me.valueMapper);

                    this.helper.gradientColor.domain(d3.extent(data, function (d) {
                        return d[me.helper.measure[0]];
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
                                return me.helper.getFillColor(me.valueMapper[d.properties.name]);
                            })
                            .style('stroke', function (d, i) {
                                return me.helper.getBorderColor();
                            })
                            .style('stroke-width', 0.5)
                            .filter(function (d) {
                                return countries.indexOf(d.properties.name) !== -1;
                            })
                            .on('mouseover', me.helper.toggleTooltip('visible', me))
                            .on('mousemove', function () {
                                var tooltip = d3.select(me.container).select('.tooltip_custom');
                                var offset = $(me.container).offset();
                                var x = d3.event.pageX - offset.left,
                                    y = d3.event.pageY - offset.top;

                                tooltip.style('top', y + 10 + 'px').style('left', x + 10 + 'px');
                                D3Utils.constrainTooltip(me.container, tooltip.node());
                            })
                            .on('mouseout', me.helper.toggleTooltip('hidden', me))
                            .on('click', function (d, i) {
                                if ($rootScope.filterSelection.id && $rootScope.filterSelection.id != record.id) {
                                    return;
                                }

                                $rootScope.filterSelection.lasso = false;

                                var confirm = d3.select(me.container).select('.confirm')
                                    .style('visibility', 'visible');

                                var filter = {};

                                if ($rootScope.filterSelection.id) {
                                    filter = $rootScope.filterSelection.filter;
                                } else {
                                    $rootScope.filterSelection.id = me.id;
                                }

                                var rect = d3.select(this);

                                if (rect.classed('selected')) {
                                    rect.classed('selected', false);
                                } else {
                                    rect.classed('selected', true);
                                }

                                if (filter[me.helper.dimension]) {
                                    var temp = filter[me.helper.dimension];
                                    if (temp.indexOf(d.properties.name) < 0) {
                                        temp.push(d.properties.name);
                                    } else {
                                        temp.splice(temp.indexOf(d.properties.name), 1);
                                    }
                                    filter[me.helper.dimension] = temp;
                                } else {
                                    filter[me.helper.dimension] = [d.properties.name];
                                }

                                // Clear out the updateWidget property
                                var idWidget = $rootScope.updateWidget[me.id];
                                $rootScope.updateWidget = {};
                                $rootScope.updateWidget[me.id] = idWidget;

                                $rootScope.filterSelection.filter = filter;
                                filterParametersService.save(filter);
                                $rootScope.$broadcast('flairbiApp:filter-input-refresh');
                                $rootScope.$broadcast('flairbiApp:filter');
                            });

                        var lasso = d3.lasso()
                            .hoverSelect(true)
                            .closePathSelect(true)
                            .closePathDistance(100)
                            .items(country)
                            .targetArea(svg);

                        lasso.on('start', me.helper.onLassoStart(lasso, me))
                            .on('draw', me.helper.onLassoDraw(lasso, me))
                            .on('end', me.helper.onLassoEnd(lasso, me));

                        svg.call(lasso);
                    }
                }

                return Map;

            })();

            if (Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                if ($rootScope.filterSelection.id != record.id) {
                    var map = $rootScope.updateWidget[record.id];
                    map.updateChart(record.data);
                }
            } else {
                var map = new Map(element[0], record, getProperties(VisualizationUtils, record));
                map.renderChart();

                $rootScope.updateWidget[record.id] = map;
            }
        }
    }
}
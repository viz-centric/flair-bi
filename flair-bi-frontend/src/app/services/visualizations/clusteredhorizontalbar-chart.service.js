import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .factory('GenerateClusteredhorizontalbarChart', GenerateClusteredhorizontalbarChart);

GenerateClusteredhorizontalbarChart.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils', 'filterParametersService'];

function GenerateClusteredhorizontalbarChart(VisualizationUtils, $rootScope, D3Utils, filterParametersService) {
    return {
        build: function (record, element, panel) {

            if ((!record.data) || ((record.data instanceof Array) && (!record.data.length))) {
                element.css({
                    'display': 'flex',
                    'align-items': 'center',
                    'justify-content': 'center'
                });

                element[0].innerHTML = "Data not available";

                return;
            }

            function getProperties(VisualizationUtils, record) {
                var result = {};

                var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
                    dimensions = features.dimensions,
                    measures = features.measures,
                    eachMeasure,
                    allMeasures = [],
                    colorSet = D3Utils.getDefaultColorset();

                result['dimension'] = D3Utils.getNames(dimensions);
                result['measures'] = D3Utils.getNames(measures);

                result['maxMes'] = measures.length;

                result['showXaxis'] = VisualizationUtils.getPropertyValue(record.properties, 'Show X Axis');
                result['showYaxis'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Y Axis');
                result['xAxisColor'] = VisualizationUtils.getPropertyValue(record.properties, 'X Axis Colour');
                result['yAxisColor'] = VisualizationUtils.getPropertyValue(record.properties, 'Y Axis Colour');
                result['showXaxisLabel'] = VisualizationUtils.getPropertyValue(record.properties, 'Show X Axis Label');
                result['showYaxisLabel'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Y Axis Label');
                result['showLegend'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Legend');
                result['legendPosition'] = VisualizationUtils.getPropertyValue(record.properties, 'Legend position');
                result['showGrid'] = VisualizationUtils.getPropertyValue(record.properties, 'Show grid');

                result['displayName'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Display name');

                for (var i = 0; i < result.maxMes; i++) {
                    eachMeasure = {};
                    eachMeasure['measure'] = result['measures'][i];
                    eachMeasure['showValues'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Value on Points');
                    eachMeasure['displayName'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name');
                    eachMeasure['fontStyle'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style');
                    eachMeasure['fontWeight'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight');
                    eachMeasure['fontSize'] = parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size'));
                    eachMeasure['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format');
                    eachMeasure['textColor'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour');
                    eachMeasure['displayColor'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour');
                    eachMeasure['displayColor'] = (eachMeasure['displayColor'] == null) ? colorSet[i] : eachMeasure['displayColor'];
                    eachMeasure['borderColor'] = VisualizationUtils.getFieldPropertyValue(measures[i], 'Border colour');
                    eachMeasure['borderColor'] = (eachMeasure['borderColor'] == null) ? colorSet[i] : eachMeasure['borderColor'];
                    allMeasures.push(eachMeasure);
                }

                result['measureProp'] = allMeasures;

                return result;
            }

            var Helper = (function () {

                var DEFAULT_COLOR = "#bdbdbd";

                function Helper(config) {
                    this.config = config;
                    this.maxMes = config.maxMes;
                    this.dimension = config.dimension;
                    this.measures = config.measures;
                    this.showXaxis = config.showXaxis;
                    this.showYaxis = config.showYaxis;
                    this.xAxisColor = config.xAxisColor;
                    this.yAxisColor = config.yAxisColor;
                    this.showXaxisLabel = config.showXaxisLabel;
                    this.showYaxisLabel = config.showYaxisLabel;
                    this.showLegend = config.showLegend;
                    this.legendPosition = config.legendPosition;
                    this.showGrid = config.showGrid;
                    this.displayName = config.displayName;
                    this.measureProp = config.measureProp;
                }

                Helper.prototype.getMargin = function () {
                    var margin = {
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 65
                    };

                    return margin;
                }

                Helper.prototype.getPadding = function () {
                    return 20;
                }

                Helper.prototype.isLegendVisible = function () {
                    return this.showLegend;
                }

                Helper.prototype.getLegendPosition = function () {
                    return this.legendPosition.toLowerCase();
                }

                Helper.prototype.getGridVisibility = function () {
                    return this.showGrid ? 'visible' : 'hidden';
                }

                Helper.prototype.getXaxisColor = function () {
                    return this.xAxisColor;
                }

                Helper.prototype.getYaxisColor = function () {
                    return this.yAxisColor;
                }

                Helper.prototype.getXaxisVisibility = function () {
                    return this.showXaxis ? 'visible' : 'hidden';
                }

                Helper.prototype.getYaxisVisibility = function () {
                    return this.showYaxis ? 'visible' : 'hidden';
                }

                Helper.prototype.getXaxisLabelVisibility = function () {
                    return this.showXaxisLabel ? 'visible' : 'hidden';
                }

                Helper.prototype.getYaxisLabelVisibility = function () {
                    return this.showYaxisLabel ? 'visible' : 'hidden';
                }

                Helper.prototype.setAxisColor = function (scope) {
                    var container = d3.select(scope.container);

                    var xTicks = container.selectAll('#x_axis .tick'),
                        yTicks = container.selectAll('#y_axis .tick');

                    container.select('#x_axis path')
                        .style('stroke', this.xAxisColor);

                    xTicks.select('line')
                        .style('visibility', 'hidden')
                        .style('stroke', this.xAxisColor);

                    container.select('.tick-labels').selectAll('text')
                        .style('fill', this.xAxisColor);

                    container.select('#y_axis path')
                        .style('stroke', this.yAxisColor);

                    yTicks.select('line')
                        .style('visibility', 'hidden')
                        .style('stroke', this.yAxisColor);

                    yTicks.select('text')
                        .style('fill', this.yAxisColor);
                }

                Helper.prototype.getGlobalMinMax = function (data) {
                    var me = this;

                    var allValues = [],
                        min,
                        max;

                    data.forEach(function (d) {
                        me.measures.forEach(function (m) {
                            allValues.push(d[m] || 0);
                        })
                    });

                    min = Math.min.apply(Math, allValues);
                    max = Math.max.apply(Math, allValues);

                    min = min > 0 ? 0 : min

                    return [min, max];
                }

                Helper.prototype.getXLabels = function (data) {
                    var me = this;
                    return data.map(function (d) { return d[me.dimension[0]]; })
                }

                Helper.prototype.getDimDisplayName = function () {
                    return this.displayName;
                }

                Helper.prototype.getMesDisplayName = function (index) {
                    if (typeof (index) !== 'undefined') {
                        return this.measureProp[index]['displayName'];
                    }

                    return this.measureProp.map(function (p) { return p.displayName; }).join(', ');
                }

                Helper.prototype.getValueNumberFormat = function (data, index) {
                    if (typeof (index) == 'undefined') {
                        index = this.measures.indexOf(data.measure);
                    }

                    var si = this.measureProp[index]['numberFormat'],
                        nf = D3Utils.getNumberFormatter(si);

                    return nf;
                }

                Helper.prototype.getDisplayColor = function (data, index) {
                    if (typeof (index) == 'undefined') {
                        index = this.measures.indexOf(data.measure);
                    }

                    return this.measureProp[index]['displayColor'] || DEFAULT_COLOR;
                }

                Helper.prototype.getBorderColor = function (data, index) {
                    if (typeof (index) == 'undefined') {
                        index = this.measures.indexOf(data.measure);
                    }

                    return this.measureProp[index]['borderColor'] || DEFAULT_COLOR;
                }

                Helper.prototype.getValueColor = function (data, index) {
                    if (typeof (index) == 'undefined') {
                        index = this.measures.indexOf(data.measure);
                    }

                    return this.measureProp[index]['textColor'] || DEFAULT_COLOR;
                }

                Helper.prototype.getValueVisibility = function (data, index) {
                    if (typeof (index) == 'undefined') {
                        index = this.measures.indexOf(data.measure);
                    }

                    var isVisible = this.measureProp[index]['showValues'];

                    if (isVisible) {
                        return 'visible';
                    }

                    return 'hidden';
                }

                Helper.prototype.getValueFontStyle = function (data, index) {
                    if (typeof (index) == 'undefined') {
                        index = this.measures.indexOf(data.measure);
                    }

                    return this.measureProp[index]['fontStyle'];
                }

                Helper.prototype.getValueFontWeight = function (data, index) {
                    if (typeof (index) == 'undefined') {
                        index = this.measures.indexOf(data.measure);
                    }

                    return this.measureProp[index]['fontWeight'];
                }

                Helper.prototype.getValueFontSize = function (data, index) {
                    if (typeof (index) == 'undefined') {
                        index = this.measures.indexOf(data.measure);
                    }

                    return this.measureProp[index]['fontSize'];
                }

                Helper.prototype.toggleTooltip = function (visibility, scope) {
                    return function (d, i) {
                        var element = d3.select(this),
                            si = scope.helper.measureProp[i]['numberFormat'],
                            nf = D3Utils.getNumberFormatter(si),
                            displayName = scope.helper.getDimDisplayName(),
                            dimension = d[scope.helper.dimension],
                            measures = scope.helper.measures[i],
                            measuresFormate = D3Utils.getFormattedValue(d[scope.helper.measures[i]], nf);
                        D3Utils.contentTooltip(visibility, scope, element, displayName, dimension, measures, measuresFormate);
                    }
                }

                Helper.prototype.toggleSortSelection = function (scope, sortType, callback) {
                    var _onRadioButtonClick = function (event) {
                        var persistence = $rootScope.persistence[scope.id];

                        if (typeof (persistence) == 'undefined') {
                            $rootScope.persistence[scope.id] = {
                                'sort': {
                                    'type': sortType,
                                    'measure': event.data.measure
                                }
                            };
                        } else {
                            persistence['sort'] = {
                                'type': sortType,
                                'measure': event.data.measure
                            };
                        }

                        d3.select(scope.container).select('.clusteredhorizontalbar-plot').remove();
                        callback.call(scope, D3Utils.sortData(event.data.data, event.data.measure, sortType));
                    }

                    return function (d, i) {
                        // Prevent firing of svg click event
                        d3.event.stopPropagation();

                        var sortWindow = d3.select(scope.container).select('.sort_selection')
                            .style('visibility', 'visible');

                        sortWindow.selectAll('div').remove();

                        var downArrow = d3.select(scope.container).select('.arrow-down')
                            .style('visibility', 'visible');

                        var options,
                            selected;

                        if (Object.keys($rootScope.persistence).indexOf(scope.id) != -1) {
                            var sort = $rootScope.persistence[scope.id]['sort'];
                            if (sort.type == sortType) {
                                selected = sort.measure;
                            }
                        }

                        for (var i = 0; i < scope.helper.maxMes; i++) {
                            var _divRadio = $('<div></div>').addClass('radio');
                            options = '<label><input type="radio" '
                                + (selected == scope.helper.measures[i] ? 'checked' : '')
                                + ' name="optradio">'
                                + scope.helper.measures[i]
                                + '</label>';

                            _divRadio.append(options);
                            $(sortWindow.node()).append(_divRadio);

                            _divRadio.find('input').click({
                                data: scope.originalData,
                                measure: scope.helper.measures[i]
                            }, _onRadioButtonClick);
                        }

                        D3Utils.positionDownArrow(scope.container, downArrow.node(), sortType);
                        D3Utils.positionSortSelection(scope.container, sortWindow.node());
                    }
                }

                Helper.prototype.onLassoStart = function (lasso, scope) {
                    return function () {
                        if ($rootScope.filterSelection.lasso) {
                            lasso.items().selectAll('rect')
                                .classed('not_possible', true)
                                .classed('selected', false);
                        }
                    }
                }

                Helper.prototype.onLassoDraw = function (lasso, scope) {
                    return function () {
                        $rootScope.filterSelection.lasso = true;
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

                Helper.prototype.onLassoEnd = function (lasso, scope) {
                    return function () {
                        var data = lasso.selectedItems().data();

                        if ($rootScope.filterSelection.id && $rootScope.filterSelection.id != record.id) {
                            return;
                        }

                        if (!$rootScope.filterSelection.lasso) {
                            return;
                        }

                        lasso.items().selectAll('rect')
                            .classed('not_possible', false)
                            .classed('possible', false);

                        lasso.selectedItems().selectAll('rect')
                            .classed('selected', true)

                        lasso.notSelectedItems().selectAll('rect');

                        var confirm = d3.select(scope.container).select('.confirm')
                            .style('visibility', 'visible');

                        var filter = {};
                        $rootScope.filterSelection.id = scope.id;

                        data.forEach(function (d) {
                            if (filter[scope.helper.dimension]) {
                                var temp = filter[scope.helper.dimension];
                                if (temp.indexOf(d[scope.helper.dimension]) < 0) {
                                    temp.push(d[scope.helper.dimension]);
                                }
                                filter[scope.helper.dimension] = temp;
                            } else {
                                filter[scope.helper.dimension] = [d[scope.helper.dimension]];
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

            var Clusteredhorizontalbar = (function () {

                function Clusteredhorizontalbar(container, record, properties) {
                    this.container = container;
                    this.id = record.id;
                    this.originalData = record.data;
                    this.helper = new Helper(properties);
                    this.legendSpace = 20,
                        this.axisLabelSpace = 20;
                    this.offsetX = 16;
                    this.offsetY = 3;

                    $('#clusteredhorizontalbar-' + this.id).remove();
                    var div = d3.select(container).append('div')
                        .attr('id', 'clusteredhorizontalbar-' + this.id)
                        .style('width', this.container.clientWidth + 'px')
                        .style('height', this.container.clientHeight + 'px')
                        .style('overflow', 'hidden')
                        .style('text-align', 'center')
                        .style('position', 'relative');

                    div.append('svg');

                    div.append('div')
                        .attr('class', 'tooltip_custom');

                    div.append('div')
                        .attr('class', 'sort_selection');

                    div.append('div')
                        .attr('class', 'arrow-down');

                    D3Utils.prepareFilterButtons(div, $rootScope, filterParametersService);
                }

                Clusteredhorizontalbar.prototype.updateChart = function (data) {
                    var me = this;

                    var dimension = this.helper.dimension,
                        measures = this.helper.measures;

                    var container = d3.select(this.container);

                    this.originalData = data;

                    var minMax = this.helper.getGlobalMinMax(data),
                        globalMin = minMax[0],
                        globalMax = minMax[1];

                    var xLabels = this.helper.getXLabels(data);

                    var margin = this.helper.getMargin();

                    var xScaleDim = this.xScaleDim,
                        xScaleMes = this.xScaleMes,
                        yScale = this.yScale;

                    xScaleDim.domain(xLabels);

                    xScaleMes.rangeRound([0, xScaleDim.bandwidth()]);

                    yScale.domain([globalMin, globalMax]);

                    var _yTicks = yScale.ticks(),
                        yDiff = _yTicks[1] - _yTicks[0],
                        correctionVal = 15;

                    if ((_yTicks[_yTicks.length - 1] + yDiff) > globalMax + correctionVal) {
                        yScale.domain([globalMin, (_yTicks[_yTicks.length - 1] + yDiff)])
                    } else {
                        yScale.domain([globalMin, (_yTicks[_yTicks.length - 1] + 2 * yDiff)])
                    }

                    var axisLeft = d3.axisLeft(xScaleDim)
                        .tickFormat(function (d) { return ''; });

                    var axisBottom = d3.axisBottom(yScale)
                        .tickFormat(function (d) {
                            if ((me.contentWidth / yScale.ticks().length) < me.tickLength.invert(D3Utils.shortScale(2)(d).toString().split('').length)) {
                                return D3Utils.getTruncatedTick(D3Utils.shortScale(2)(d), me.contentWidth / yScale.ticks().length, me.tickLength);
                            }
                            return D3Utils.shortScale(2)(d);
                        });

                    container.select('#x_axis').call(axisLeft);
                    container.select('#y_axis').call(axisBottom);

                    container.selectAll('.tick-labels text').remove();

                    var tickLabels = container.select('.tick-labels').append('g')
                        .attr('class', 'tick-labels')
                        .selectAll('text')
                        .data(xLabels)
                        .enter().append('text')
                        .text(function (d) { return d; })
                        .text(function (d) {
                            return D3Utils.getTruncatedLabel(this, d, (margin.left - me.axisLabelSpace));
                        })
                        .attr('visibility', function (d, i) {
                            var space = me.contentHeight / xLabels.length;
                            if (space <= parseFloat(d3.select(this).style('font-size').replace('px', ''))) {
                                return 'hidden';
                            }
                            return 'visible';
                        })
                        .attr('y', function (d, i) { return xScaleDim(d) + xScaleDim.bandwidth() / 2; })
                        .attr('x', 0)
                        .attr('dx', -me.offsetX)
                        .attr('dy', me.offsetY)
                        .style('text-anchor', 'end');

                    var transitionOld = d3.transition()
                        .duration(800)
                        .ease(d3.easeQuadIn)
                        .on('end', afterTransitionOld);

                    var transitionNew = d3.transition()
                        .duration(800)
                        .ease(d3.easeQuadIn)
                        .on('end', afterTransitionNew);

                    var cluster = container.select('g.chart').selectAll('g.cluster')
                        .data(data);

                    cluster.enter().append('g')
                        .attr('class', 'cluster')
                        .attr('transform', function (d) {
                            return 'translate(0, ' + xScaleDim(d[dimension[0]]) + ')';
                        });

                    cluster.exit().remove();

                    cluster = container.selectAll('g.cluster');

                    var clusteredhorizontalbar = cluster.selectAll('g.clusteredhorizontalbar')
                        .data(function (d) {
                            return measures.filter(function (m) {
                                return me.labelStack.indexOf(m) == -1;
                            }).map(function (m) {
                                var obj = {};
                                obj[dimension[0]] = d[dimension[0]];
                                obj[m] = d[m];
                                obj['dimension'] = dimension[0];
                                obj['measure'] = m;
                                return obj;
                            });
                        });

                    clusteredhorizontalbar.select('rect')
                        .attr('x', function (d, i) {
                            if ((d[d['measure']] === null) || (isNaN(d[d['measure']]))) {
                                return 0;
                            } else if (d[d['measure']] < 0) {
                                return yScale(d[d['measure']]) + 1; // 1 is the stroke offset
                            }

                            return yScale(0) + 1;
                        })
                        .attr('y', function (d, i) {
                            return xScaleMes(d['measure'] + i);
                        })
                        .attr('width', 0)
                        .attr('height', xScaleMes.bandwidth())
                        .attr('class', '') // Removes any class previously present. E.g. selected
                        .transition(transitionOld)
                        .attr('width', function (d, i) {
                            if ((d[d['measure']] === null) || (isNaN(d[d['measure']]))) return 0;
                            return Math.abs(yScale(0) - yScale(d[d['measure']]));
                        });

                    var newBars = clusteredhorizontalbar.enter().append('g')
                        .attr('class', 'clusteredhorizontalbar');

                    var rect = newBars.append('rect')
                        .style('fill', function (d, i) {
                            return me.helper.getDisplayColor(d);
                        })
                        .style('stroke', function (d, i) {
                            return me.helper.getBorderColor(d);
                        })
                        .style('stroke-width', 1)
                        .on('mouseover', this.helper.toggleTooltip('visible', me))
                        .on('mousemove', function () {
                            var tooltip = d3.select(me.container).select('.tooltip_custom');

                            var offset = $(me.container).offset();
                            var x = d3.event.pageX - offset.left,
                                y = d3.event.pageY - offset.top;

                            tooltip.style('top', y + 10 + 'px').style('left', x + 10 + 'px');
                            D3Utils.constrainTooltip(me.container, tooltip.node());
                        })
                        .on('mouseout', this.helper.toggleTooltip('hidden', me))
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

                            var dimension = me.helper.dimension[0];

                            if (filter[dimension]) {
                                var temp = filter[dimension];
                                if (temp.indexOf(d[dimension]) < 0) {
                                    temp.push(d[dimension]);
                                } else {
                                    temp.splice(temp.indexOf(d[dimension]), 1);
                                }
                                filter[dimension] = temp;
                            } else {
                                filter[dimension] = [d[dimension]];
                            }

                            // Clear out the updateWidget property
                            var idWidget = $rootScope.updateWidget[me.id];
                            $rootScope.updateWidget = {};
                            $rootScope.updateWidget[me.id] = idWidget;

                            $rootScope.filterSelection.filter = filter;
                            //filterParametersService.save(filter);
                            var filterParameters = filterParametersService.get();
                            filterParameters[dimension] = filter[dimension];
                            filterParametersService.save(filterParameters);
                            $rootScope.$broadcast('flairbiApp:filter-input-refresh');
                            $rootScope.$broadcast('flairbiApp:filter');
                        });

                    function afterTransitionNew() {
                        var text = newBars.append('text')
                            .text(function (d, i) {
                                return D3Utils.getFormattedValue(d[d['measure']], me.helper.getValueNumberFormat(d));
                            })
                            .attr('visibility', function (d, i) {
                                return me.helper.getValueVisibility(d);
                            })
                            .attr('visibility', function (d, i) {
                                var rect = d3.select(this.previousElementSibling).node(),
                                    rectWidth = rect.getAttribute('width'),
                                    rectHeight = rect.getAttribute('height');

                                if (this.getAttribute('visibility') == 'hidden') return 'hidden';

                                if ((this.getComputedTextLength() + (me.offsetX / 2)) > parseFloat(contentWidth - rectWidth)) {
                                    return 'hidden';
                                }

                                if (rectHeight < me.helper.getValueFontSize(d)) {
                                    return 'hidden';
                                }
                                return 'visible';
                            })
                            .style('font-style', function (d, i) {
                                return me.helper.getValueFontStyle(d);
                            })
                            .style('font-weight', function (d, i) {
                                return me.helper.getValueFontWeight(d);
                            })
                            .style('font-size', function (d, i) {
                                return me.helper.getValueFontSize(d);
                            })
                            .style('fill', function (d, i) {
                                return me.helper.getValueColor(d);
                            });

                        text.attr('x', function (d, i) {
                            if ((d[d['measure']] === null) || (isNaN(d[d['measure']]))) {
                                return 0;
                            } else if (d[d['measure']] > 0) {
                                return yScale(d[d['measure']]);
                            }

                            return yScale(0);
                        })
                            .attr('y', function (d, i) {
                                return xScaleMes(d['measure'] + i);
                            })
                            .attr('visibility', function (d, i) {
                                var rect = d3.select(this.previousElementSibling).node(),
                                    rectWidth = rect.getAttribute('width'),
                                    rectHeight = rect.getAttribute('height');

                                if (this.getAttribute('visibility') == 'hidden') return 'hidden';

                                if ((this.getComputedTextLength() + (me.offsetX / 2)) > parseFloat(me.contentWidth - rectWidth)) {
                                    return 'hidden';
                                }

                                if (rectHeight < me.helper.getValueFontSize(d)) {
                                    return 'hidden';
                                }
                                return 'visible';
                            })
                            .attr('dx', function (d, i) {
                                return me.offsetX / 8;
                            })
                            .attr('dy', function (d, i) {
                                return xScaleMes.bandwidth() / 2 + d3.select(this).style('font-size').replace('px', '') / 2.5;
                            })
                            .text(function (d, i) {
                                var barLength;

                                if ((d[d['measure']] === null) || (isNaN(d[d['measure']]))) {
                                    barLength = 0;
                                } else {
                                    barLength = Math.abs(yScale(0) - yScale(d[d['measure']]));
                                }

                                return D3Utils.getTruncatedLabel(this, d3.select(this).text(), me.contentWidth - barLength);
                            })
                            .style('text-anchor', 'start');
                    }

                    function afterTransitionOld() {
                        clusteredhorizontalbar.select('text')
                            .text(function (d, i) {
                                return D3Utils.getFormattedValue(d[d['measure']], me.helper.getValueNumberFormat(d));
                            })
                            .attr('x', function (d, i) {
                                if ((d[d['measure']] === null) || (isNaN(d[d['measure']]))) {
                                    return 0;
                                } else if (d[d['measure']] > 0) {
                                    return yScale(d[d['measure']]);
                                }

                                return yScale(0);
                            })
                            .attr('y', function (d, i) {
                                return xScaleMes(d['measure'] + i);
                            })
                            .attr('dx', function (d, i) {
                                return me.offsetX / 8;
                            })
                            .attr('dy', function (d, i) {
                                return xScaleMes.bandwidth() / 2 + d3.select(this).style('font-size').replace('px', '') / 2.5;
                            })
                            .text(function (d, i) {
                                var barLength;

                                if ((d[d['measure']] === null) || (isNaN(d[d['measure']]))) {
                                    barLength = 0;
                                } else {
                                    barLength = Math.abs(yScale(0) - yScale(d[d['measure']]));
                                }

                                return D3Utils.getTruncatedLabel(this, d3.select(this).text(), me.contentWidth - barLength);
                            });
                    }

                    rect.attr('x', function (d, i) {
                        if ((d[d['measure']] === null) || (isNaN(d[d['measure']]))) {
                            return 0;
                        } else if (d[d['measure']] < 0) {
                            return yScale(d[d['measure']]) + 1; // 1 is the stroke offset
                        }

                        return yScale(0) + 1;
                    })
                        .attr('y', function (d, i) {
                            return xScaleMes(d['measure'] + i);
                        })
                        .attr('width', 0)
                        .attr('height', xScaleMes.bandwidth());

                    rect.transition(transitionNew)
                        .attr('width', function (d, i) {
                            if ((d[d['measure']] === null) || (isNaN(d[d['measure']]))) return 0;
                            return Math.abs(yScale(0) - yScale(d[d['measure']]));
                        });

                    me.helper.setAxisColor(this);

                    d3.selectAll('.clusteredhorizontalbar-plot .cluster')
                        .attr('transform', function (d) {
                            return 'translate(0, ' + xScaleDim(d[dimension[0]]) + ')';
                        });

                }

                Clusteredhorizontalbar.prototype.renderChart = function () {
                    var data = this.originalData;
                    var me = this;

                    var width = this.container.clientWidth;
                    var height = this.container.clientHeight;

                    var dimension = me.helper.dimension,
                        measures = me.helper.measures;

                    var svg = d3.select(this.container).select('svg')
                        .on('click', function () {
                            d3.select(me.container).select('.sort_selection')
                                .style('visibility', 'hidden');

                            d3.select(me.container).select('.arrow-down')
                                .style('visibility', 'hidden');
                        });

                    svg.selectAll('g').remove();

                    svg.attr('width', width)
                        .attr('height', height);

                    var padding = this.helper.getPadding(),
                        margin = this.helper.getMargin();

                    var containerWidth = width - 2 * padding,
                        containerHeight = height - 2 * padding;

                    var container = svg.append('g')
                        .attr('transform', 'translate(' + padding + ', ' + padding + ')');

                    var contentWidth,
                        contentHeight,
                        legendBreak = 0,
                        legendBreakCount = 0;

                    var labelStack = this.labelStack = [];

                    var drawLegend = function (data) {
                        var me = this;

                        var legend = container.append('g')
                            .attr('class', 'clusteredhorizontalbar-legend')
                            .attr('display', function () {
                                if (me.helper.isLegendVisible()) {
                                    return 'block';
                                }
                                return 'none';
                            })
                            .selectAll('.item')
                            .data(measures)
                            .enter().append('g')
                            .attr('class', 'item')
                            .attr('id', function (d, i) {
                                return 'legend' + i;
                            })
                            .attr('transform', function (d, i) {
                                if (me.helper.getLegendPosition() == 'top') {
                                    return 'translate(' + i * Math.floor(containerWidth / measures.length) + ', 0)';
                                } else if (me.helper.getLegendPosition() == 'bottom') {
                                    return 'translate(' + i * Math.floor(containerWidth / measures.length) + ', ' + containerHeight + ')';
                                } else if (me.helper.getLegendPosition() == 'left') {
                                    return 'translate(0, ' + i * 20 + ')';
                                } else if (me.helper.getLegendPosition() == 'right') {
                                    return 'translate(' + (4 * containerWidth / 5) + ', ' + i * 20 + ')';
                                }
                            })
                            .on('mouseover', function () {
                                d3.select(this).attr('cursor', 'pointer')
                            })
                            .on('mousemove', function () {
                                d3.select(this).attr('cursor', 'pointer')
                            })
                            .on('mouseout', function () {
                                d3.select(this).attr('cursor', 'default')
                            })
                            .on('click', function (d, i) {
                                if (labelStack.indexOf(d) < 0) {
                                    labelStack.push(d);
                                } else {
                                    labelStack.splice(labelStack.indexOf(d), 1);
                                }

                                var o = parseInt(d3.select(this).select('rect').style('fill-opacity'));
                                if (!o) {
                                    d3.select(this).select('rect')
                                        .style('fill-opacity', 1)
                                        .style('stroke-width', 0);
                                } else {
                                    d3.select(this).select('rect')
                                        .style('fill-opacity', 0)
                                        .style('stroke-width', 1);
                                }

                                d3.select(me.container).select('.clusteredhorizontalbar-plot').remove();
                                drawPlot.call(me, data);
                            });

                        legend.append('rect')
                            .attr('x', 4)
                            .attr('width', 10)
                            .attr('height', 10)
                            .style('fill', function (d, i) {
                                return me.helper.getDisplayColor(d, i);
                            })
                            .style('stroke', function (d, i) {
                                return me.helper.getDisplayColor(d, i);
                            })
                            .style('stroke-width', 0);

                        legend.append('text')
                            .attr('x', 18)
                            .attr('y', 5)
                            .attr('dy', function (d) {
                                return d3.select(this).style('font-size').replace('px', '') / 2.5;
                            })
                            .text(function (d, i) {
                                return me.helper.getMesDisplayName(i);
                            })
                            .text(function (d, i) {
                                if ((me.helper.getLegendPosition() == 'top') || (me.helper.getLegendPosition() == 'bottom')) {
                                    return D3Utils.getTruncatedLabel(this, me.helper.getMesDisplayName(i), Math.floor(containerWidth / measures.length), 5);
                                } else if ((me.helper.getLegendPosition() == 'left') || (me.helper.getLegendPosition() == 'right')) {
                                    return D3Utils.getTruncatedLabel(this, me.helper.getMesDisplayName(i), containerWidth / 5);
                                }
                            });

                        if ((this.helper.getLegendPosition() == 'top') || (this.helper.getLegendPosition() == 'bottom')) {
                            legend.attr('transform', function (d, i) {
                                var count = i,
                                    widthSum = 0
                                while (count-- != 0) {
                                    widthSum += d3.select(me.container).select('#legend' + count).node().getBBox().width + me.offsetX;
                                }
                                return 'translate(' + widthSum + ', ' + (me.helper.getLegendPosition() == 'top' ? 0 : containerHeight) + ')';
                            });
                        }

                        if (this.helper.getLegendPosition() == 'top') {
                            legend.attr('transform', function (d, i) {
                                var postition = D3Utils.legendPosition(me, i, legendBreakCount, legendBreak);
                                legendBreakCount = postition.split(',')[2];
                                legendBreak = postition.split(',')[3];
                                return 'translate(' + postition.split(',')[0] + ', ' + postition.split(',')[1] + ')';
                            });
                            containerHeight = containerHeight - (20 * legendBreakCount);
                        }

                        if (!me.helper.isLegendVisible()) {
                            this.legendSpace = 0;
                            contentWidth = containerWidth - margin.left;
                            contentHeight = containerHeight - 2 * this.axisLabelSpace;
                        } else {
                            if ((me.helper.getLegendPosition() == 'top') || (me.helper.getLegendPosition() == 'bottom')) {
                                contentWidth = containerWidth - margin.left;
                                contentHeight = containerHeight - 3 * this.axisLabelSpace;
                                this.legendSpace = 20;
                            } else if ((me.helper.getLegendPosition() == 'left') || (me.helper.getLegendPosition() == 'right')) {
                                this.legendSpace = legend.node().parentNode.getBBox().width;
                                contentWidth = (containerWidth - this.legendSpace) - margin.left - this.axisLabelSpace;
                                contentHeight = containerHeight - 2 * this.axisLabelSpace;

                                legend.attr('transform', function (d, i) {
                                    if (me.helper.getLegendPosition() == 'left') {
                                        return 'translate(0, ' + i * 20 + ')';
                                    } else if (me.helper.getLegendPosition() == 'right') {
                                        return 'translate(' + (containerWidth - me.legendSpace) + ', ' + i * 20 + ')';
                                    }
                                });
                            }
                        }

                        me.contentWidth = contentWidth;
                        me.contentHeight = contentHeight;
                    }

                    var drawPlot = function (data) {
                        var me = this;

                        var globalMin,
                            globalMax,
                            xLabels;

                        var minMax = this.helper.getGlobalMinMax(data);
                        globalMin = minMax[0];
                        globalMax = minMax[1];

                        xLabels = this.helper.getXLabels(data);

                        var chart = container.append('g')
                            .attr('class', 'clusteredhorizontalbar-plot')
                            .attr('transform', function () {
                                if (me.helper.getLegendPosition() == 'top') {
                                    return 'translate(' + margin.left + ', ' + (parseInt(me.legendSpace) + parseInt(legendBreakCount * 20)) + ')';
                                } else if (me.helper.getLegendPosition() == 'bottom') {
                                    return 'translate(' + margin.left + ', 0)';
                                } else if (me.helper.getLegendPosition() == 'left') {
                                    return 'translate(' + (me.legendSpace + margin.left + me.axisLabelSpace) + ', 0)';
                                } else if (me.helper.getLegendPosition() == 'right') {
                                    return 'translate(' + margin.left + ', 0)';
                                }
                            });

                        var xScaleDim = this.xScaleDim = d3.scaleBand()
                            .domain(xLabels)
                            .padding([0.2])
                            .rangeRound([0, contentHeight]);

                        var scaleMes = measures.map(function (d, i) {
                            d = d + i;
                            return d;
                        });

                        var xScaleMes = this.xScaleMes = d3.scaleBand()
                            .domain(scaleMes)
                            .rangeRound([0, xScaleDim.bandwidth()])
                            .padding([0.2]);

                        var yScale = this.yScale = d3.scaleLinear()
                            .domain([globalMin, globalMax]);

                        var tickLength = this.tickLength = d3.scaleLinear()
                            .domain([22, 34])
                            .range([4, 6]);

                        var _yTicks = yScale.ticks(),
                            yDiff = _yTicks[1] - _yTicks[0],
                            correctionVal = 15;

                        if ((_yTicks[_yTicks.length - 1] + yDiff) > globalMax + correctionVal) {
                            yScale.domain([globalMin, (_yTicks[_yTicks.length - 1] + yDiff)])
                        } else {
                            yScale.domain([globalMin, (_yTicks[_yTicks.length - 1] + 2 * yDiff)])
                        }

                        yScale.range([0, contentWidth]);

                        var content = chart.append('g')
                            .attr('width', '100%')
                            .attr('class', 'chart');

                        var xGridLines,
                            yGridLines;

                        xGridLines = d3.axisLeft()
                            .tickFormat('')
                            .tickSize(-contentWidth);

                        yGridLines = d3.axisBottom()
                            .tickFormat('')
                            .tickSize(-contentHeight);

                        xGridLines.scale(xScaleDim);
                        yGridLines.scale(yScale);

                        content.append('g')
                            .attr('class', 'grid')
                            .attr('visibility', me.helper.getGridVisibility())
                            .call((function () {
                                return xGridLines;
                            })());

                        content.append('g')
                            .attr('class', 'grid')
                            .attr('visibility', me.helper.getGridVisibility())
                            .attr('transform', 'translate(0, ' + contentHeight + ')')
                            .call((function () {
                                return yGridLines;
                            })());

                        var cluster = content.selectAll('.cluster')
                            .data(data)
                            .enter().append('g')
                            .attr('class', 'cluster')
                            .attr('transform', function (d) {
                                return 'translate(0, ' + xScaleDim(d[dimension[0]]) + ')';
                            });

                        var clusteredhorizontalbar = cluster.selectAll('g.clusteredhorizontalbar')
                            .data(function (d) {
                                return measures.filter(function (m) {
                                    return labelStack.indexOf(m) == -1;
                                }).map(function (m) {
                                    var obj = {};
                                    obj[dimension[0]] = d[dimension[0]];
                                    obj[m] = d[m];
                                    obj['dimension'] = dimension[0];
                                    obj['measure'] = m;
                                    return obj;
                                });
                            })
                            .enter().append('g')
                            .attr('class', 'clusteredhorizontalbar');

                        var t = d3.transition()
                            .duration(800)
                            .ease(d3.easeQuadIn)
                            .on('end', afterTransition);

                        var rect = clusteredhorizontalbar.append('rect')
                            .style('fill', function (d, i) {
                                return me.helper.getDisplayColor(d);
                            })
                            .style('stroke', function (d, i) {
                                return me.helper.getBorderColor(d);
                            })
                            .style('stroke-width', 1)
                            .on('mouseover', this.helper.toggleTooltip('visible', me))
                            .on('mousemove', function () {
                                var tooltip = d3.select(me.container).select('.tooltip_custom');

                                var offset = $(me.container).offset();
                                var x = d3.event.pageX - offset.left,
                                    y = d3.event.pageY - offset.top;

                                tooltip.style('top', y + 10 + 'px').style('left', x + 10 + 'px');
                                D3Utils.constrainTooltip(me.container, tooltip.node());
                            })
                            .on('mouseout', this.helper.toggleTooltip('hidden', me))
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

                                var dimension = me.helper.dimension[0];

                                if (filter[dimension]) {
                                    var temp = filter[dimension];
                                    if (temp.indexOf(d[dimension]) < 0) {
                                        temp.push(d[dimension]);
                                    } else {
                                        temp.splice(temp.indexOf(d[dimension]), 1);
                                    }
                                    filter[dimension] = temp;
                                } else {
                                    filter[dimension] = [d[dimension]];
                                }

                                // Clear out the updateWidget property
                                var idWidget = $rootScope.updateWidget[me.id];
                                $rootScope.updateWidget = {};
                                $rootScope.updateWidget[me.id] = idWidget;

                                $rootScope.filterSelection.filter = filter;
                                //filterParametersService.save(filter);
                                var filterParameters = filterParametersService.get();
                                filterParameters[dimension] = filter[dimension];
                                filterParametersService.save(filterParameters);
                                $rootScope.$broadcast('flairbiApp:filter-input-refresh');
                                $rootScope.$broadcast('flairbiApp:filter');
                            });

                        function afterTransition() {
                            var text = clusteredhorizontalbar.append('text')
                                .text(function (d, i) {
                                    return D3Utils.getFormattedValue(d[d['measure']], me.helper.getValueNumberFormat(d));
                                })
                                .attr('visibility', function (d, i) {
                                    return me.helper.getValueVisibility(d);
                                })
                                .attr('visibility', function (d, i) {
                                    var rect = d3.select(this.previousElementSibling).node(),
                                        rectWidth = rect.getAttribute('width'),
                                        rectHeight = rect.getAttribute('height');

                                    if (this.getAttribute('visibility') == 'hidden') return 'hidden';

                                    if ((this.getComputedTextLength() + (me.offsetX / 2)) > parseFloat(contentWidth - rectWidth)) {
                                        return 'hidden';
                                    }

                                    if (rectHeight < me.helper.getValueFontSize(d)) {
                                        return 'hidden';
                                    }
                                    return 'visible';
                                })
                                .style('font-style', function (d, i) {
                                    return me.helper.getValueFontStyle(d);
                                })
                                .style('font-weight', function (d, i) {
                                    return me.helper.getValueFontWeight(d);
                                })
                                .style('font-size', function (d, i) {
                                    return me.helper.getValueFontSize(d);
                                })
                                .style('fill', function (d, i) {
                                    return me.helper.getValueColor(d);
                                });

                            text.attr('x', function (d, i) {
                                if ((d[d['measure']] === null) || (isNaN(d[d['measure']]))) {
                                    return 0;
                                } else if (d[d['measure']] > 0) {
                                    return yScale(d[d['measure']]);
                                }

                                return yScale(0);
                            })
                                .attr('y', function (d, i) {
                                    return xScaleMes(d['measure'] + i);
                                })
                                .attr('visibility', function (d, i) {
                                    var rect = d3.select(this.previousElementSibling).node(),
                                        rectWidth = rect.getAttribute('width'),
                                        rectHeight = rect.getAttribute('height');

                                    if (this.getAttribute('visibility') == 'hidden') return 'hidden';

                                    if ((this.getComputedTextLength() + (me.offsetX / 2)) > parseFloat(contentWidth - rectWidth)) {
                                        return 'hidden';
                                    }

                                    if (rectHeight < me.helper.getValueFontSize(d)) {
                                        return 'hidden';
                                    }
                                    return 'visible';
                                })
                                .attr('dx', function (d, i) {
                                    return me.offsetX / 8;
                                })
                                .attr('dy', function (d, i) {
                                    return xScaleMes.bandwidth() / 2 + d3.select(this).style('font-size').replace('px', '') / 2.5;
                                })
                                .text(function (d, i) {
                                    var barLength;

                                    if ((d[d['measure']] === null) || (isNaN(d[d['measure']]))) {
                                        barLength = 0;
                                    } else {
                                        barLength = Math.abs(yScale(0) - yScale(d[d['measure']]));
                                    }

                                    return D3Utils.getTruncatedLabel(this, d3.select(this).text(), contentWidth - barLength);
                                })
                                .style('text-anchor', 'start');
                        }

                        rect.attr('x', function (d, i) {
                            if ((d[d['measure']] === null) || (isNaN(d[d['measure']]))) {
                                return 0;
                            } else if (d[d['measure']] < 0) {
                                return yScale(d[d['measure']]) + 1; // 1 is the stroke offset
                            }

                            return yScale(0) + 1;
                        })
                            .attr('y', function (d, i) {
                                return xScaleMes(d['measure'] + i);
                            })
                            .attr('width', 0)
                            .attr('height', xScaleMes.bandwidth());

                        rect.transition(t)
                            .attr('width', function (d, i) {
                                if ((d[d['measure']] === null) || (isNaN(d[d['measure']]))) return 0;
                                return Math.abs(yScale(0) - yScale(d[d['measure']]));
                            });

                        var axisLeftG = chart.append('g')
                            .attr('class', function () {
                                return 'x axis';
                            })
                            .attr('visibility', function () {
                                return me.helper.getXaxisVisibility();
                            })
                            .attr('transform', 'translate(0, 0)');

                        axisLeftG.append('g')
                            .attr('class', 'label')
                            .attr('transform', function () {
                                return 'translate(' + (-margin.left) + ', ' + (contentHeight / 2) + ')';
                            })
                            .append('text')
                            .attr('transform', 'rotate(-90)')
                            .style('text-anchor', 'middle')
                            .style('font-weight', 'bold')
                            .style('fill', function () {
                                return me.helper.getXaxisColor();
                            })
                            .style('visibility', function () {
                                return me.helper.getXaxisLabelVisibility();
                            })
                            .text(function () {
                                return me.helper.getDimDisplayName();
                            });

                        var axisBottomG = chart.append('g')
                            .attr('class', function () {
                                return 'y axis';
                            })
                            .attr('visibility', function () {
                                return me.helper.getYaxisVisibility();
                            })
                            .attr('transform', 'translate(0, ' + contentHeight + ')');


                        var width = d3.select('.clusteredhorizontalbar-plot .chart').node().getBBox()
                        axisBottomG.append('text')
                            .style('font-size', 10)
                            .attr('transform', 'translate(' + (contentWidth / 2) + ', ' + (2 * me.axisLabelSpace + (me.axisLabelSpace / 2)) + ')')
                            .style('text-anchor', 'middle')
                            .style('font-weight', 'bold')
                            .attr('y', 0)
                            .attr('x', 0)
                            .attr('width', width.width + 'px;')
                            .attr('class', function () {
                                return 'yaxisText';
                            })

                            .style('fill', function () {
                                return me.helper.getYaxisColor();
                            })
                            .style('visibility', function () {
                                return me.helper.getYaxisLabelVisibility();
                            })
                            .text(function () {
                                return me.helper.getMesDisplayName();
                            });

                        var text = d3.select('.clusteredhorizontalbar-plot .yaxisText');
                        var words = text.text().split(/\s+/).reverse();
                        var lineHeight = parseFloat(text.style('font-size'));;
                        var width = parseFloat(text.attr('width'));
                        var y = parseFloat(text.attr('y'));
                        var x = text.attr('x');
                        var anchor = text.attr('text-anchor');

                        //width=parseFloat(width.width);
                        var tspan = text.text(null).append('tspan').attr('x', x).attr('y', y).attr('text-anchor', anchor);
                        var lineNumber = 0;
                        var line = [];
                        var word = words.pop();

                        while (word) {
                            line.push(word);
                            tspan.text(line.join(' '));
                            if (tspan.node().getComputedTextLength() > width) {
                                width = width - 10
                                lineNumber += 1;
                                line.pop();
                                tspan.text(line.join(' '));
                                line = [word];
                                tspan = text.append('tspan').attr('x', x).attr('y', y + lineNumber * lineHeight).attr('anchor', anchor).text(word);

                            }
                            word = words.pop();
                        }


                        var sortButton = container.append('g')
                            .attr('class', 'clusteredhorizontalbar-sort')
                            .attr('transform', function () {
                                return 'translate(0, ' + parseInt((containerHeight - 2 * padding + (legendBreakCount * 20))) + ')';
                            })

                        var ascendingSort = sortButton.append('svg:text')
                            .attr('fill', '#afafaf')
                            .attr('cursor', 'pointer')
                            .style('font-family', 'FontAwesome')
                            .style('font-size', 12)
                            .attr('transform', function () {
                                return 'translate(' + (containerWidth - 3 * me.offsetX) + ', ' + 2 * me.axisLabelSpace + ')';
                            })
                            .style('text-anchor', 'end')
                            .text(function () {
                                return "\uf161";
                            })
                            .on('click', this.helper.toggleSortSelection(me, 'ascending', drawPlot))
                        /*.on('click', function() {
                            d3.select(me.container).select('.bar-plot').remove();
                            drawPlot.call(me, D3Utils.sortData(data, measures, 'ascending'));
                        });*/

                        var descendingSort = sortButton.append('svg:text')
                            .attr('fill', '#afafaf')
                            .attr('cursor', 'pointer')
                            .style('font-family', 'FontAwesome')
                            .style('font-size', 12)
                            .attr('transform', function () {
                                return 'translate(' + (containerWidth - 1.5 * me.offsetX) + ', ' + 2 * me.axisLabelSpace + ')';
                            })
                            .style('text-anchor', 'end')
                            .text(function () {
                                return "\uf160";
                            })
                            .on('click', this.helper.toggleSortSelection(me, 'descending', drawPlot));

                        var resetSort = sortButton.append('svg:text')
                            .attr('fill', '#afafaf')
                            .attr('cursor', 'pointer')
                            .style('font-family', 'FontAwesome')
                            .style('font-size', 12)
                            .attr('transform', function () {
                                return 'translate(' + containerWidth + ', ' + 2 * me.axisLabelSpace + ')';
                            })
                            .style('text-anchor', 'end')
                            .text(function () {
                                return "\uf0c9";
                            })
                            .on('click', function () {
                                d3.select(me.container).select('.clusteredhorizontalbar-plot').remove();
                                drawPlot.call(me, me.originalData);

                                var persistence = $rootScope.persistence[me.id];
                                persistence['sort'] = {};
                            });

                        var axisBottom,
                            axisLeft;

                        axisBottom = d3.axisBottom(yScale)
                            .tickFormat(function (d) {
                                if ((contentWidth / yScale.ticks().length) < tickLength.invert(D3Utils.shortScale(2)(d).toString().split('').length)) {
                                    return D3Utils.getTruncatedTick(D3Utils.shortScale(2)(d), contentWidth / yScale.ticks().length, tickLength);
                                }
                                return D3Utils.shortScale(2)(d);
                            });

                        axisBottomG.append('g')
                            .attr('id', 'y_axis')
                            .call(axisBottom);

                        axisLeft = d3.axisLeft(xScaleDim)
                            .tickFormat(function (d) { return ''; });

                        axisLeftG.append('g')
                            .attr('id', 'x_axis')
                            .call(axisLeft);

                        var tickLabels = axisLeftG.append('g')
                            .attr('class', 'tick-labels')
                            .selectAll('text')
                            .data(xLabels)
                            .enter().append('text')
                            .text(function (d) { return d; })
                            .text(function (d) {
                                return D3Utils.getTruncatedLabel(this, d, (margin.left - me.axisLabelSpace));
                            })
                            .attr('visibility', function (d, i) {
                                var space = contentHeight / xLabels.length;
                                if (space <= parseFloat(d3.select(this).style('font-size').replace('px', ''))) {
                                    return 'hidden';
                                }
                                return 'visible';
                            })
                            .attr('y', function (d, i) { return xScaleDim(d) + xScaleDim.bandwidth() / 2; })
                            .attr('x', 0)
                            .attr('dx', -me.offsetX)
                            .attr('dy', me.offsetY)
                            .style('text-anchor', 'end');

                        me.helper.setAxisColor(this);

                        /*var lasso_area = content.append('rect')
                            .attr('width', contentWidth)
                            .attr('height', contentHeight)
                            .style('opacity', 0);*/

                        var lasso = d3.lasso()
                            .hoverSelect(true)
                            .closePathSelect(true)
                            .closePathDistance(100)
                            .items(clusteredhorizontalbar)
                            .targetArea(svg);

                        lasso.on('start', me.helper.onLassoStart(lasso, me))
                            .on('draw', me.helper.onLassoDraw(lasso, me))
                            .on('end', me.helper.onLassoEnd(lasso, me));

                        svg.call(lasso);
                    }

                    drawLegend.call(this, data);

                    if ((Object.keys($rootScope.persistence).indexOf(this.id) != -1) &&
                        (Object.keys($rootScope.persistence[this.id]['sort']).length)) {
                        var sort = $rootScope.persistence[this.id]['sort'];
                        drawPlot.call(this, D3Utils.sortData(data, sort.measure, sort.type));
                    } else {
                        drawPlot.call(this, data);
                    }
                }

                return Clusteredhorizontalbar;

            })();

            if (Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                if ($rootScope.filterSelection.id != record.id) {
                    var clusteredhorizontalbar = $rootScope.updateWidget[record.id];
                    clusteredhorizontalbar.updateChart(record.data);
                }
            } else {
                var clusteredhorizontalbar = new Clusteredhorizontalbar(element[0], record, getProperties(VisualizationUtils, record));
                clusteredhorizontalbar.renderChart();

                $rootScope.updateWidget[record.id] = clusteredhorizontalbar;
            }
        }
    }
}
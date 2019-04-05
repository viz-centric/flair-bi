(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('GeneratePieChart', GeneratePieChart);

    GeneratePieChart.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils', 'filterParametersService'];

    function GeneratePieChart(VisualizationUtils, $rootScope, D3Utils, filterParametersService) {

        return {
            build: function (record, element, panel) {

                function getProperties(VisualizationUtils, record) {
                    var result = {};

                    var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
                        dimension = features.dimensions,
                        measure = features.measures;

                    result['dimension'] = D3Utils.getNames(dimension);
                    result['measure'] = D3Utils.getNames(measure);

                    result['showLegend'] = VisualizationUtils.getPropertyValue(record.properties, 'Show Legend');
                    result['legendPosition'] = VisualizationUtils.getPropertyValue(record.properties, 'Legend position');
                    result['showValueAs'] = VisualizationUtils.getPropertyValue(record.properties, 'Show value as').toLowerCase();
                    result['valueAsArc'] = VisualizationUtils.getPropertyValue(record.properties, 'Value as Arc');
                    result['valuePosition'] = VisualizationUtils.getPropertyValue(record.properties, 'Value position').toLowerCase();

                    return result;
                }

                var Helper = (function() {

                    function Helper(config) {
                        this.config = config;
                        this.dimension = config.dimension;
                        this.measure = config.measure;
                        this.showLegend = config.showLegend;
                        this.legendPosition = config.legendPosition;
                        this.showValueAs = config.showValueAs;
                        this.valueAsArc = config.valueAsArc;
                        this.valuePosition = config.valuePosition;
                        this.total = 0;
                    }

                    Helper.prototype.getPadding = function() {
                        return 20;
                    }

                    Helper.prototype.getShowValueAs = function() {
                        return this.showValueAs;
                    }

                    Helper.prototype.isArcRepresentation = function() {
                        return this.valueAsArc;
                    }

                    Helper.prototype.getValuePosition = function() {
                        return this.valuePosition;
                    }

                    Helper.prototype.setTotal = function(val) {
                        this.total = val;
                    }

                    Helper.prototype.getTotal = function() {
                        return this.total;
                    }

                    Helper.prototype.isLegendVisible = function() {
                        return this.showLegend;
                    }

                    Helper.prototype.getLegendPosition = function() {
                        return this.legendPosition.toLowerCase();
                    }

                    Helper.prototype.getLabel = function(scope) {
                        return function(d, i) {
                            if(scope.helper.getShowValueAs() == "label") {
                                return d.data[scope.helper.dimension[0]];
                            } else if(scope.helper.getShowValueAs() == "value") {
                                return d.data[scope.helper.measure[0]];
                            } else if(scope.helper.getShowValueAs() == "percentage") {
                                return (100 * d.data[scope.helper.measure[0]] / scope.helper.getTotal()).toFixed(2) + " %";
                            }
                        }
                    }

                    Helper.prototype.pythogorousTheorem = function(x, y) {
                        if(typeof(x) == 'number' && typeof(y) == 'number') {
                            return Math.sqrt(x * x + y * y);
                        }

                        return 0;
                    }

                    Helper.prototype.toggleTooltip = function(visibility, scope) {
                        return function(d, i) {
                            var element = d3.select(this),
                            displayName=scope.helper.dimension[0],
                            dimension=d.data[scope.helper.dimension[0]],
                            measures= scope.helper.measure[0] ,
                            measuresFormate=  d.data[scope.helper.measure[0]];
                            D3Utils.contentTooltip(visibility, scope,element,displayName,dimension,measures,measuresFormate);
                        }
                    }

                    Helper.prototype.onLassoStart = function(lasso, scope) {
                        return function() {
                            if($rootScope.filterSelection.lasso) {
                                lasso.items().selectAll('path')
                                    .classed('not_possible', true)
                                    .classed('selected', false);
                            }
                        }
                    }

                    Helper.prototype.onLassoDraw = function(lasso, scope) {
                        return function() {
                            $rootScope.filterSelection.lasso = true;
                            lasso.items().selectAll('path')
                                .classed('selected', false);

                            lasso.possibleItems().selectAll('path')
                                .classed('not_possible', false)
                                .classed('possible', true);

                            lasso.notPossibleItems().selectAll('path')
                                .classed('not_possible', true)
                                .classed('possible', false);
                        }
                    }

                    Helper.prototype.onLassoEnd = function(lasso, scope) {
                        return function() {
                            var data = lasso.selectedItems().data();

                            if($rootScope.filterSelection.id && $rootScope.filterSelection.id != record.id) {
                                return;
                            }

                            if(!$rootScope.filterSelection.lasso) {
                                return;
                            }

                            lasso.items().selectAll('path')
                                .classed('not_possible', false)
                                .classed('possible', false);

                            lasso.selectedItems().selectAll('path')
                                .classed('selected', true)

                            lasso.notSelectedItems().selectAll('path');

                            var confirm = d3.select(scope.container).select('.confirm')
                                .style('visibility', 'visible');

                            var filter = {};
                            $rootScope.filterSelection.id = scope.id;

                            data.forEach(function(d) {
                                if(filter[scope.helper.dimension]) {
                                    var temp = filter[scope.helper.dimension];
                                    if(temp.indexOf(d.data[scope.helper.dimension]) < 0) {
                                        temp.push(d.data[scope.helper.dimension]);
                                    }
                                    filter[scope.helper.dimension] = temp;
                                } else {
                                    filter[scope.helper.dimension] = [d.data[scope.helper.dimension]];
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

                var Pie = (function() {

                    function Pie(container, record, properties) {
                        this.container = container;
                        this.id = record.id;
                        this.originalData = record.data;
                        this.helper = new Helper(properties);
                        this.legendSpace = 20,
                        this.pieOffset = 20;
                        this.offsetY = 5;

                        $('#pie-' + this.id).remove();
                        var div = d3.select(container).append('div')
                            .attr('id', 'pie-' + this.id)
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

                    Pie.prototype.updateChart = function(data) {
                        var me = this;

                        var container = d3.select(this.container);

                        var pie = d3.pie()
                            .sort(null)
                            .value(function(d) { return d[me.helper.measure[0]]; });

                        this.originalData = data;

                        this.helper.setTotal(d3.sum(data.map(function(d) { return d[me.helper.measure[0]]; })));

                        var arc = container.selectAll('.arc')
                            .data(pie(data));

                        arc.exit().remove();
                        arc.enter().append('g')
                            .attr('class', 'arc');

                        var arcText = container.selectAll('.arc-text')
                            .data(pie(data))

                        arcText.exit().remove();
                        arcText.enter().append('g')
                            .attr('class', 'arc-text');
                    }

                    Pie.prototype.renderChart = function() {
                        var data = this.originalData;
                        var me = this;

                        var width = this.container.clientWidth;
                        var height = this.container.clientHeight;

                        var dimension = me.helper.dimension,
                            measures = me.helper.measures;

                        var svg = d3.select(this.container).select('svg');

                        svg.selectAll('g').remove();

                        svg.attr('width', width)
                            .attr('height', height);

                        var colorScale = d3.scaleOrdinal()
                            .range(D3Utils.getDefaultColorset());

                        this.helper.setTotal(d3.sum(data.map(function(d) { return d[me.helper.measure[0]]; })));

                        var padding = this.helper.getPadding();

                        var containerWidth = width - 2 * padding,
                            containerHeight = height - 2 * padding;

                        var container = svg.append('g')
                            .attr('transform', 'translate(' + padding + ', ' + padding + ')');

                        var contentWidth = containerWidth,
                            contentHeight = containerHeight;

                        var labelStack = [];

                        var drawLegend = function(data) {
                            var me = this,
                                legendBreak = 0,
                                legendBreakCount = 0;
                            var legend = container.append('g')
                                .attr('class', 'pie-legend')
                                .attr('display', function() {
                                    if(me.helper.isLegendVisible()) {
                                        return 'block';
                                    }
                                    return 'none';
                                })
                                .selectAll('.item')
                                .data(data)
                                .enter().append('g')
                                    .attr('class', 'item')
                                    .attr('id', function(d, i) {
                                        return 'legend' + i;
                                    })
                                    .attr('transform', function(d, i) {
                                        if(me.helper.getLegendPosition() == 'top') {
                                            return 'translate(' + i * Math.floor(containerWidth/data.length) + ', 0)';
                                        } else if(me.helper.getLegendPosition() == 'bottom') {
                                            return 'translate(' + i * Math.floor(containerWidth/data.length) + ', ' + containerHeight + ')';
                                        } else if(me.helper.getLegendPosition() == 'left') {
                                            return 'translate(0, ' + i * 20 + ')';
                                        } else if(me.helper.getLegendPosition() == 'right') {
                                            return 'translate(' + (4 * containerWidth/5) + ', ' + i * 20 + ')';
                                        }
                                    })
                                    .on('mouseover', function() {
                                        d3.select(this).attr('cursor', 'pointer')
                                    })
                                    .on('mousemove', function() {
                                        d3.select(this).attr('cursor', 'pointer')
                                    })
                                    .on('mouseout', function() {
                                        d3.select(this).attr('cursor', 'default')
                                    })
                                    .on('click', function(d, i) {
                                        if(labelStack.indexOf(d) < 0) {
                                            labelStack.push(d);
                                        } else {
                                            labelStack.splice(labelStack.indexOf(d), 1);
                                        }

                                        var o = parseInt(d3.select(this).select('rect').style('fill-opacity'));
                                        if(!o) {
                                            d3.select(this).select('rect')
                                                .style('fill-opacity', 1)
                                                .style('stroke-width', 0);
                                        } else {
                                            d3.select(this).select('rect')
                                                .style('fill-opacity', 0)
                                                .style('stroke-width', 1);
                                        }

                                        d3.select(me.container).select('.pie-plot').remove();
                                        drawPlot.call(me, data.filter(function(d) { return labelStack.indexOf(d) == -1; }));
                                    });

                            legend.append('rect')
                                .attr('x', 4)
                                .attr('width', 10)
                                .attr('height', 10)
                                .style('fill', function(d, i) {
                                    return colorScale(d[me.helper.dimension[0]]);
                                })
                                .style('stroke', function(d, i) {
                                    return colorScale(d[me.helper.dimension[0]]);
                                })
                                .style('stroke-width', 0);

                            legend.append('text')
                                .attr('x', 18)
                                .attr('y', 5)
                                .attr('dy', function(d) {
                                    return d3.select(this).style('font-size').replace('px', '')/2.5;
                                })
                                .text(function(d) { return d[me.helper.dimension[0]]; })
                                .text(function(d) {
                                    if((me.helper.getLegendPosition() == 'top') || (me.helper.getLegendPosition() == 'bottom')) {
                                        return D3Utils.getTruncatedLabel(this, d[me.helper.dimension[0]], Math.floor(containerWidth/data.length) - 5);
                                    } else if((me.helper.getLegendPosition() == 'left') || (me.helper.getLegendPosition() == 'right')) {
                                        return D3Utils.getTruncatedLabel(this, d[me.helper.dimension[0]], containerWidth/5);
                                    }
                                });

                            if((this.helper.getLegendPosition() == 'top') || (this.helper.getLegendPosition() == 'bottom')) {
                                legend.attr('transform', function(d, i) {
                                    var count = i,
                                        widthSum = 0
                                    while(count-- != 0) {
                                        widthSum += d3.select(me.container).select('#legend' + count).node().getBBox().width + 3 * me.offsetY;
                                    }
                                    return 'translate(' + widthSum + ', ' + (me.helper.getLegendPosition() == 'top' ? 0 : containerHeight) + ')';
                                });
                            }
                            if(this.helper.getLegendPosition() == 'bottom') {
                                legend.attr('transform', function(d, i) {
                                    var count = i,
                                        widthSum = 0
                                    while(count-- != 0) {
                                        widthSum += d3.select(me.container).select('#legend' + count).node().getBBox().width + 3 * me.offsetY;
                                    }
                                    if((widthSum + 100) > me.container.offsetWidth){
                                        widthSum = 0;
                                        if(legendBreak == 0){
                                            legendBreak = i;
                                            legendBreakCount = legendBreakCount + 1;
                                        }
                                        if(i == (legendBreak * (legendBreakCount + 1))){
                                            legendBreakCount = legendBreakCount + 1;
                                        }
                                        var newcount = i - (legendBreak * legendBreakCount);
                                        while(newcount-- != 0) {
                                            widthSum += d3.select(me.container).select('#legend' + newcount).node().getBBox().width + 3 * me.offsetY;
                                        }
                                        return 'translate(' + widthSum + ', ' + (containerHeight - (legendBreakCount * 20)) +')';
                                    }
                                    return 'translate(' + widthSum + ', ' + (me.helper.getLegendPosition() == 'top' ? 0 : containerHeight) + ')';
                                });
                            }
                            if(this.helper.getLegendPosition() == 'top') {
                                legend.attr('transform', function(d, i) {
                                    var postition=D3Utils.legendPosition(me,i,legendBreakCount,legendBreak);
                                    legendBreakCount=postition.split(',')[2];
                                    legendBreak=postition.split(',')[3];
                                    return 'translate(' + postition.split(',')[0] + ', ' + postition.split(',')[1] + ')';
                                });
                                containerHeight=containerHeight-(20*legendBreakCount);
                            }
                            if(!this.helper.isLegendVisible()) {
                                this.legendSpace = 0;
                            } else {
                                if((this.helper.getLegendPosition() == 'top') || (this.helper.getLegendPosition() == 'bottom')) {
                                    this.legendSpace = 20;
                                } else if((this.helper.getLegendPosition() == 'left') || (this.helper.getLegendPosition() == 'right')) {
                                    contentWidth = (4 * containerWidth/5);
                                    this.legendSpace = containerWidth/5;
                                }
                            }
                        }

                        var drawPlot = function(data) {
                            var radius = Math.min(contentWidth, contentHeight) / 2,
                                outerRadius = radius - this.pieOffset;

                            var arc = d3.arc()
                                .outerRadius(outerRadius)
                                .innerRadius(0);

                            var labelArc = d3.arc()
                                .outerRadius(radius - 2 * this.pieOffset)
                                .innerRadius(Math.floor((radius - 2 * this.pieOffset) * 0.8));

                            var pie = d3.pie()
                                // .padAngle(.02)
                                .sort(null)
                                .value(function(d) { return d[me.helper.measure[0]]; });

                            var chart = container.append('g')
                                .attr('class', 'pie-plot')
                                .attr('transform', function() {
                                    if(me.helper.getLegendPosition() == 'top') {
                                        return 'translate(' + (contentWidth/2) + ', ' + (me.legendSpace + contentHeight/2) + ')';
                                    } else if(me.helper.getLegendPosition() == 'bottom') {
                                        return 'translate(' + (contentWidth/2) + ', ' + (contentHeight/2) + ')';
                                    } else if(me.helper.getLegendPosition() == 'left') {
                                        return 'translate(' + (me.legendSpace + contentWidth/2) + ', ' + contentHeight/2 + ')';
                                    } else if(me.helper.getLegendPosition() == 'right') {
                                        return 'translate(' + contentWidth/2 + ', ' + contentHeight/2 + ')';
                                    }
                                });

                            var gArc = chart.selectAll('.arc')
                                .data(pie(data))
                                .enter().append('g')
                                    .attr('class', 'arc')
                                    // Uncomment the code below to push the arcs away from center
                                    /*.attr('transform', function(d, i) {
                                        var theta = (d.startAngle + d.endAngle) / 2,
                                            x = Math.sin(theta) * 2,
                                            y = -Math.cos(theta) * 2;

                                        return 'translate(' + x + ', ' + y + ')';
                                    });*/

                            var pathArea = gArc.append('path')
                                .attr('id', function(d, i) {
                                    return 'arc-' + me.id + i;
                                })
                                .attr('d', arc)
                                .style('fill', function(d) {
                                    return colorScale(d.data[me.helper.dimension]);
                                })
                                .on('mouseover', this.helper.toggleTooltip('visible', me))
                                .on('mousemove', function() {
                                    var tooltip = d3.select(me.container).select('.tooltip_custom');

                                    var offset = $(me.container).offset();
                                    var x = d3.event.pageX - offset.left,
                                        y = d3.event.pageY - offset.top;

                                    tooltip.style('top', y + 10 + 'px').style('left', x + 10 + 'px');
                                    D3Utils.constrainTooltip(me.container, tooltip.node());
                                })
                                .on('mouseout', this.helper.toggleTooltip('hidden', me))
                                .on('click', function(d, i) {
                                    if($rootScope.filterSelection.id && $rootScope.filterSelection.id != record.id) {
                                        return;
                                    }

                                    $rootScope.filterSelection.lasso = false;

                                    var confirm = d3.select(me.container).select('.confirm')
                                        .style('visibility', 'visible');

                                    var filter = {};

                                    if($rootScope.filterSelection.id) {
                                        filter = $rootScope.filterSelection.filter;
                                    } else {
                                        $rootScope.filterSelection.id = me.id;
                                    }

                                    var path = d3.select(this);

                                    if(path.classed('selected')) {
                                        path.classed('selected', false);
                                    } else {
                                        path.classed('selected', true);
                                    }

                                    var dimension = me.helper.dimension[0];

                                    if(filter[dimension]) {
                                        var temp = filter[dimension];
                                        if(temp.indexOf(d['data'][dimension]) < 0) {
                                            temp.push(d['data'][dimension]);
                                        } else {
                                            temp.splice(temp.indexOf(d['data'][dimension]), 1);
                                        }
                                        filter[dimension] = temp;
                                    } else {
                                        filter[dimension] = [d['data'][dimension]];
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

                            pathArea.transition()
                                .duration(500)
                                .attrTween('d', function(d) {
                                    var i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
                                    return function(t) {
                                        d.endAngle = i(t);
                                        return arc(d)
                                    }
                                });

                            var label;

                            if(me.helper.isArcRepresentation()) {
                                label = gArc.append('text')
                                    .attr('dy', function(d, i) {
                                        if(me.helper.getValuePosition() == "border") {
                                            return 3 * me.offsetY;
                                        } else {
                                            return -me.offsetY;
                                        }
                                    })

                                label.append('textPath')
                                    .attr('xlink:href', function(d, i) {
                                        return "#arc-" + me.id + i;
                                    })
                                    .attr('text-anchor', function() {
                                        return "middle";
                                    })
                                    .transition()
                                    .delay(500)
                                    .on('start', function() {
                                        d3.select(this).attr('startOffset', function(d) {
                                            var length = pathArea.nodes()[d.index].getTotalLength();
                                            return 50 * (length - 2 * outerRadius)/length + "%";
                                        })
                                        .text(me.helper.getLabel(me))
                                        .filter(function(d, i) {
                                            var diff = d.endAngle - d.startAngle;
                                            return outerRadius * diff - 5 < this.getComputedTextLength();
                                        })
                                        .remove();
                                    });
                            } else {
                                var gArcText = chart.selectAll('.arc-text')
                                    .data(pie(data))
                                    .enter().append('g')
                                        .attr('class', 'arc-text');

                                label = gArcText.append('text')
                                    .attr('transform', function(d) {
                                        var centroid = labelArc.centroid(d),
                                            x = centroid[0],
                                            y = centroid[1],
                                            h = me.helper.pythogorousTheorem(x, y);

                                        if(me.helper.getValuePosition() == 'border') {
                                            return "translate(" + outerRadius*(x/h)*0.85 + ", " + outerRadius*(y/h)*0.85 + ")";
                                        } else {
                                            return "translate(" + outerRadius*(x/h)*1.05 + ", " + outerRadius*(y/h)*1.05 + ")";
                                        }
                                    })
                                    .attr('dy', '0.35em')
                                    .attr('text-anchor', function(d) {
                                        if(me.helper.getValuePosition() == 'border') {
                                            return "middle";
                                        } else {
                                            return (d.endAngle + d.startAngle)/2 > Math.PI ? "end" : "start";
                                        }
                                    })
                                    .transition()
                                    .delay(500)
                                    .on('start', function() {
                                        d3.select(this).text(me.helper.getLabel(me))
                                            .text(function(d) {
                                                var centroid = labelArc.centroid(d),
                                                    x = centroid[0],
                                                    y = centroid[1],
                                                    h = me.helper.pythogorousTheorem(x, y);

                                                var width = (containerWidth / 2) - Math.abs(outerRadius * (x/h));
                                                return D3Utils.getTruncatedLabel(this, d3.select(this).text(), width);
                                            });
                                    });
                            }

                            var lasso = d3.lasso()
                                .hoverSelect(true)
                                .closePathSelect(true)
                                .closePathDistance(100)
                                .items(gArc)
                                .targetArea(chart);

                            lasso.on('start', me.helper.onLassoStart(lasso, me))
                                .on('draw', me.helper.onLassoDraw(lasso, me))
                                .on('end', me.helper.onLassoEnd(lasso, me));

                            chart.call(lasso);
                        }

                        drawLegend.call(this, data);

                        drawPlot.call(this, data);
                    }

                    return Pie;

                })();

                if(Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                    if($rootScope.filterSelection.id != record.id) {
                        /*var pie = $rootScope.updateWidget[record.id];
                        pie.updateChart(record.data);*/

                        // TODO: This needs to be fixed, commented code need to be properly done
                        // ---------------*-----------------
                        var pie = new Pie(element[0], record, getProperties(VisualizationUtils, record));
                        pie.renderChart();

                        $rootScope.updateWidget[record.id] = pie;
                        // ---------------*-----------------
                    }
                } else {
                    var pie = new Pie(element[0], record, getProperties(VisualizationUtils, record));
                    pie.renderChart();

                    $rootScope.updateWidget[record.id] = pie;
                }
            }
        }
    }
})();

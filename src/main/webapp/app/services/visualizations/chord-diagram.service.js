(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('GenerateChordDiagram', GenerateChordDiagram);

    GenerateChordDiagram.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils', 'filterParametersService'];

    function GenerateChordDiagram(VisualizationUtils, $rootScope, D3Utils, filterParametersService) {
        return {
            build: function (record, element, panel, isNotification) {

                function getProperties(VisualizationUtils, record) {
                    var result = {};

                    var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
                        dimensions = features.dimensions,
                        measures = features.measures;

                    result['showLabels'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Show Labels');
                    result['labelColor'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Colour of labels');
                    result['fontStyle'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font style');
                    result['fontWeight'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font weight');
                    result['fontSize'] = parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font size'));
                    result['colorPattern'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Color Pattern').toLowerCase().replace(' ', '_');
                    result['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Number format');

                    
                    result['dimensions'] = D3Utils.getNames(dimensions);
                    result['measure'] = D3Utils.getNames(measures)[0];

                    return result;
                }

                var Helper = (function() {

                    var BASE_COLOR = "#aec7e8",
                        GRADIENT_COLOR = ['#ff9696', '#bc2f2f'];

                    var gradientColor = d3.scaleOrdinal();

                    function Helper(config) {
                        this.config = config;
                        this.dimensions = config.dimensions;
                        this.measure = config.measure;
                        this.showLabels = config.showLabels;
                        this.colorPattern = config.colorPattern;
                        this.labelColor = config.labelColor;
                        this.fontStyle = config.fontStyle;
                        this.fontWeight = config.fontWeight;
                        this.fontSize = config.fontSize;
                        this.numberFormat = config.numberFormat;
                        this.total = 0;
                    }

                    Helper.prototype.setColorDomain = function(groups) {
                        var values = groups.map(function(item) { return item.value; });

                        var domain = [],
                            range = [];

                        var color = d3.scaleLinear()
                            .domain([Math.min.apply(Math, values), Math.max.apply(Math, values)])
                            .range(GRADIENT_COLOR);

                        groups.sort(function(a, b) {
                            return (a.value > b.value) ? 1 : ((b.value > a.value) ? -1 : 0);
                        });

                        groups.forEach(function(item) {
                            domain.push(item.index);
                            range.push(color(item.value));
                        })

                        gradientColor.domain(domain);
                        gradientColor.range(range);
                    }

                    Helper.prototype.getFillColor = function(obj, index) {
                        if(this.colorPattern == 'single_color') {
                            return BASE_COLOR;
                        } else if(this.colorPattern == 'unique_color') {
                            var r = parseInt(Math.abs(Math.sin(2 * index + 100)) * 255),
                                g = parseInt(Math.abs(Math.cos(index + 75)) * 255),
                                b = parseInt(Math.abs(Math.sin(7 * index + 30)) * 255);
                            return d3.rgb(r, g, b);
                        } else if(this.colorPattern == 'gradient_color') {
                            return gradientColor(index);
                        }
                    }

                    Helper.prototype.getLabelVisibility = function() {
                        return this.showLabels ? "visible" : "hidden";
                    }

                    Helper.prototype.getLabelColor = function() {
                        return this.labelColor;
                    }

                    Helper.prototype.getFontStyle = function() {
                        return this.fontStyle;
                    }

                    Helper.prototype.getFontWeight = function() {
                        return this.fontWeight;
                    }

                    Helper.prototype.getFontSize = function() {
                        return this.fontSize;
                    }

                    Helper.prototype.fade = function(opacity, visibility, scope) {
                        return function(d, i) {
                            var tooltip = d3.select(scope.container).select('.tooltip_custom');
                            var svg = d3.select(scope.container).select('svg');

                            svg.selectAll('.ribbons path')
                                .filter(function(d) {
                                    return d.source.index != i && d.target.index != i;
                                })
                                .transition()
                                .style('opacity', opacity);
                  
                            if(visibility == 'visible') {
                                d3.select(this).style('cursor', 'pointer');
                                tooltip.html((function() {
                                    return '<p><strong>' + scope.nameByIndex.get(i) + '</td></tr>';
                                })());
                            } else {
                                d3.select(this).style('cursor', 'default');
                            }
                    
                            var offset = $(scope.container).offset();
                            var x = d3.event.pageX - offset.left,
                                y = d3.event.pageY - offset.top;
                
                            tooltip.style('top', y + 'px').style('left', x + 'px');
                            tooltip.style('visibility', visibility);
                            D3Utils.constrainTooltip(scope.container, tooltip.node(),d3.event.pageY);
                        };
                    }

                    Helper.prototype.fadeChord = function(opacityArcs, opacityRibbons, visibility, scope) {
                        return function(g, i) {
                            var tooltip = d3.select(scope.container).select('.tooltip_custom');
                            var svg = d3.select(scope.container).select('svg');

                            svg.selectAll('.ribbons path')
                                .filter(function(d, j) { return j != i; })
                                .transition()
                                .style('opacity', opacityRibbons);
                  
                            svg.selectAll('.groups path')
                                .filter(function(d) {
                                    return !(d.index == g.source.index || d.index == g.target.index);
                                })
                                .transition()
                                .style('opacity', opacityArcs);

                            function getFormattedValue(value, numberFormat) {
                                var si = scope.helper.numberFormat;

                                if(si == "Percent") {
                                    value = numberFormat(value/scope.helper.total);
                                } else {
                                    value = numberFormat(value);
                                }

                                if(value.indexOf("G") != -1) {
                                    value = value.slice(0, -1) + "B";
                                }

                                return value;
                            }

                            if(visibility == 'visible') {
                                d3.select(this).style('cursor', 'pointer');
                                tooltip.html((function() {
                                    var nf = D3Utils.getNumberFormatter(scope.helper.numberFormat),
                                        route = "",
                                        value;

                                    if(g.source.value != 0) {
                                        route += '<p><strong>' + scope.nameByIndex.get(g.source.index)
                                            + ' --> '
                                            + scope.nameByIndex.get(g.target.index)
                                            + '</strong>'
                                            + ' (' + getFormattedValue(g.source.value, nf) + ')'
                                            + '</p>';
                                    }
                                    if(g.target.value != 0) {
                                        route += '<p><strong>' + scope.nameByIndex.get(g.target.index)
                                            + ' --> '
                                            + scope.nameByIndex.get(g.source.index)
                                            + '</strong>'
                                            + ' (' + getFormattedValue(g.target.value, nf) + ')'
                                            + '</p>';
                                    }
                                    return route;
                                })());
                            } else {
                                d3.select(this).style('cursor', 'default');
                            }

                            var offset = $(scope.container).offset();
                            var x = d3.event.pageX - offset.left,
                                y = d3.event.pageY - offset.top;
                
                            tooltip.style('top', y + 'px').style('left', x + 'px');
                            tooltip.style('visibility', visibility);
                            D3Utils.constrainTooltip(scope.container, tooltip.node(),d3.event.pageY);
                        };
                    }

                    Helper.prototype.setTotal = function(val) {
                        this.total = val;
                    }

                    Helper.prototype.onLassoStart = function(lasso, scope) {
                        return function() {
                            if($rootScope.filterSelection.lasso) {
                                lasso.items().select('path')
                                    .classed('not_possible', true)
                                    .classed('selected', false);
                            }
                        }
                    }

                    Helper.prototype.onLassoDraw = function(lasso, scope) {
                        return function() {
                            $rootScope.filterSelection.lasso = true;
                            lasso.items().select('path')
                                .classed('selected', false);

                            lasso.possibleItems().select('path')
                                .classed('not_possible', false)
                                .classed('possible', true);

                            lasso.notPossibleItems().select('path')
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

                            lasso.items().select('path')
                                .classed('not_possible', false)
                                .classed('possible', false);

                            lasso.selectedItems().select('path')
                                .classed('selected', true)

                            lasso.notSelectedItems().select('path');
                                
                            var confirm = d3.select(scope.container).select('.confirm')
                                .style('visibility', 'visible');

                            var filter = {};
                            $rootScope.filterSelection.id = scope.id;

                            data.forEach(function(d) {
                                if(filter[scope.helper.dimensions[0]]) {
                                    var temp = filter[scope.helper.dimensions[0]],
                                        x;
                                    if(temp.indexOf(x = scope.nameByIndex.get(d.index)) < 0) {
                                        temp.push(x);
                                    }
                                    filter[scope.helper.dimensions[0]] = temp;
                                } else {
                                    filter[scope.helper.dimensions[0]] = [scope.nameByIndex.get(d.index)];
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

                var Chord = (function() {

                    function Chord(container, record, properties) {
                        this.container = container;
                        this.id = record.id;
                        this.originalData = record.data;
                        this.helper = new Helper(properties);
                        this.indexByName = d3.map();
                        this.nameByIndex = d3.map();
                        this.helper.setTotal(D3Utils.getSum(record.data, this.helper.measure));

                        $('#chord-' + this.id).remove();
                        var div = d3.select(container).append('div')
                            .attr('id', 'chord-' + this.id)
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

                    Chord.prototype.updateChart = function(data) {
                        var me = this;
                        
                        var container = d3.select(this.container),
                            svg = container.select('svg');

                        this.originalData = data;

                        this.indexByName = d3.map();
                        this.nameByIndex = d3.map();

                        var matrix = [],
                            n = 0;

                        data.forEach(function(d) {
                            var x;
                            if(!me.indexByName.has(x = d[me.helper.dimensions[0]])) {
                                me.nameByIndex.set(n, x);
                                me.indexByName.set(x, n++);
                            }
                        });

                        data.forEach(function(d) {
                            var source = me.indexByName.get(d[me.helper.dimensions[0]]),
                                row = matrix[source];

                            if(!row) {
                                row = matrix[source] = [];
                                d3.range(n).forEach(function(i) {
                                    row[i] = 0;
                                });
                            }

                            row[me.indexByName.get(d[me.helper.dimensions[1]])] = d[me.helper.measure];
                        });

                        svg.select('g')
                            .datum(this._chord(matrix));

                        this.helper.setColorDomain(this._chord(matrix)['groups']);
                    }

                    Chord.prototype.renderChart = function() {
                        var data = this.originalData;
                        var me = this;

                        var width = this.container.clientWidth;
                        var height = this.container.clientHeight;

                        var svg = d3.select(this.container).select('svg');

                        svg.selectAll('g').remove();

                        svg = svg.attr('width', width)
                            .attr('height', height);

                        var outerRadius = Math.min(width, height) * 0.5 - 15,
                            innerRadius = outerRadius - 20;

                        var chord = this._chord = d3.chord()
                            .padAngle(0.05)
                            .sortSubgroups(d3.descending);

                        var arc = this._arc = d3.arc()
                            .innerRadius(innerRadius)
                            .outerRadius(outerRadius);

                        var ribbon = this._ribbon = d3.ribbon()
                            .radius(innerRadius);

                        var matrix = [],
                            n = 0;

                        data.forEach(function(d) {
                            var x;
                            if(!me.indexByName.has(x = d[me.helper.dimensions[0]])) {
                                me.nameByIndex.set(n, x);
                                me.indexByName.set(x, n++);
                            }
                        });

                        data.forEach(function(d) {
                            var source = me.indexByName.get(d[me.helper.dimensions[0]]),
                                row = matrix[source];

                            if(!row) {
                                row = matrix[source] = [];
                                d3.range(n).forEach(function(i) {
                                    row[i] = 0;
                                });
                            }

                            row[me.indexByName.get(d[me.helper.dimensions[1]])] = d[me.helper.measure];
                        });

                        var g = svg.append('g')
                            .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
                            .datum(chord(matrix));

                        this.helper.setColorDomain(chord(matrix)['groups']);

                        var group = g.append('g')
                            .attr('class', 'groups')
                            .selectAll('g')
                            .data(function(chords) { return chords.groups; })
                            .enter().append('g')
                                .on('mouseover', me.helper.fade(0.05, 'visible', me))
                                .on('mousemove', function() {
                                    var tooltip = d3.select(me.container).select('.tooltip_custom');
                                    var offset = $(me.container).offset();
                                    var x = d3.event.pageX - offset.left,
                                        y = d3.event.pageY - offset.top;
                        
                                    tooltip.style('top', y + 10 + 'px').style('left', x + 10 + 'px');
                                })
                                .on('mouseout', me.helper.fade(1, 'hidden', me))
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

                                    var path = d3.select(this).select('path');

                                    if(path.classed('selected')) {
                                        path.classed('selected', false);
                                    } else {
                                        path.classed('selected', true);
                                    }

                                    if(filter[me.helper.dimensions[0]]) {
                                        var temp = filter[me.helper.dimensions[0]],
                                            x;
                                        if(temp.indexOf(x = me.nameByIndex.get(d.index)) < 0) {
                                            temp.push(x);
                                        } else {
                                            temp.splice(temp.indexOf(x), 1);
                                        }
                                        filter[me.helper.dimensions[0]] = temp;
                                    } else {
                                        filter[me.helper.dimensions[0]] = [me.nameByIndex.get(d.index)];
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

                        var groupPath = group.append('path')
                            .attr('id', function(d, i) {
                                return 'group_' + me.id + '_' + i;
                            })
                            .style('fill', function(d, i) {
                                return me.helper.getFillColor(d, i);
                            })
                            .style('stroke', function(d, i) {
                                return me.helper.getFillColor(d, i);
                            })
                            .transition()
                            .duration(750)
                            .attrTween('d', function(d) {
                                var i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
                                return function(t) {
                                    d.endAngle = i(t);
                                    return arc(d);
                                }
                            })
                            .call(endall, afterTransition);
                            // .attr('d', arc); 

                        function endall(transition, callback) { 
                            if(typeof callback !== 'function') {
                                throw new Error('Wrong callback in endall');  
                            }

                            if(transition.size() === 0) {
                                callback();
                            }

                            var n = 0;

                            transition.each(function() { ++n; }) 
                                .on('end', function() {
                                    if(!--n) {
                                        callback.apply(this, arguments);
                                    }
                                }); 
                        }

                        var ribbonPath = g.append('g')
                            .attr('class', 'ribbons')
                            .selectAll('path')
                            .data(function(chords) { return chords; })
                            .enter().append('path')
                                .style('fill', function(d, i) {
                                    return me.helper.getFillColor(d, d.source.index);
                                })
                                .style('stroke', function(d, i) {
                                    return me.helper.getFillColor(d, d.source.index);
                                })
                                .on('mouseover', me.helper.fadeChord(0.05, 0.05, 'visible', me))
                                .on('mousemove', function() {
                                    var tooltip = d3.select(me.container).select('.tooltip_custom');
                                    var offset = $(me.container).offset();
                                    var x = d3.event.pageX - offset.left,
                                        y = d3.event.pageY - offset.top;
                        
                                    tooltip.style("top", y + 10 +"px").style("left",x + 10 +"px");
                                    D3Utils.constrainTooltip(me.container, tooltip.node());
                                })
                                .on('mouseout', me.helper.fadeChord(1, 1, 'hidden', me));

                        function afterTransition() {
                            var groupText = group.append('text')
                                .attr('x', 6)
                                .attr('dy', 13)
                                .attr('fill', function(d) {
                                    return me.helper.getLabelColor();
                                })
                                .style('text-anchor', 'middle')
                                .style('visibility', function(d) {
                                    return me.helper.getLabelVisibility();
                                })
                                .style('font-style', function(d) {
                                    return me.helper.getFontStyle();
                                })
                                .style('font-weight', function(d) {
                                    return me.helper.getFontWeight();
                                })
                                .style('font-size', function(d) {
                                    return me.helper.getFontSize();
                                });

                            groupText.append('textPath')
                                .attr('startOffset', function(d) {
                                    var length = groupPath.nodes()[d.index].getTotalLength();
                                    return (25 - (50 * outerRadius)/length + (50 * innerRadius)/length) + "%";
                                })
                                .attr('xlink:href', function(d, i) { return '#group_' + me.id + '_' + i; })
                                .text(function(d, i) {
                                    return me.nameByIndex.get(d.index);
                                });
                 
                            groupText.filter(function(d, i) {
                                return groupPath.nodes()[d.index].getTotalLength() / 2 - 26 < this.getComputedTextLength();
                            })
                            .remove();

                            ribbonPath.attr('d', ribbon);
                        }

                        var lasso = d3.lasso()
                            .hoverSelect(true)
                            .closePathSelect(true)
                            .closePathDistance(100)
                            .items(group)
                            .targetArea(svg);
                        
                        lasso.on('start', me.helper.onLassoStart(lasso, me))
                            .on('draw', me.helper.onLassoDraw(lasso, me))
                            .on('end', me.helper.onLassoEnd(lasso, me));
                        
                        svg.call(lasso);
                    }

                    return Chord;

                })();

                if(Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                    if($rootScope.filterSelection.id != record.id) {
                        var chord = $rootScope.updateWidget[record.id];
                        chord.updateChart(record.data);
                    }
                } else {
                    var chord = new Chord(element[0], record, getProperties(VisualizationUtils, record));
                    chord.renderChart();

                    $rootScope.updateWidget[record.id] = chord;
                }
            }
        }
    }
})();
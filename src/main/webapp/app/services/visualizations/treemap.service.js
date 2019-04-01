(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('GenerateTreemap', GenerateTreemap);

    GenerateTreemap.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils', 'filterParametersService'];

    function GenerateTreemap(VisualizationUtils, $rootScope, D3Utils, filterParametersService) {
        return {
            build: function (record, element, panel) {

                function getProperties(VisualizationUtils, record) {
                    var result = {};

                    var features = VisualizationUtils.getDimensionsAndMeasures(record.fields),
                        dimensions = features.dimensions,
                        measures = features.measures;

                    result['maxDim'] = dimensions.length;
                    result['colorPattern'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Color Pattern').toLowerCase().replace(' ', '_');
                    result['showValues'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Value on Points');
                    result['valueTextColour'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Text colour');
                    result['fontStyleForMes'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font style');
                    result['fontWeightForMes'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font weight');
                    result['fontSizeForMes'] = parseInt(VisualizationUtils.getFieldPropertyValue(measures[0], 'Font size'));
                    result['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Number format');
                    result['measure'] = measures[0].feature.name;

                    for (var i = 0, j = ''; i < result.maxDim; i++ , j = i + 1) {
                        result['dimension' + j] = dimensions[i].feature.name;
                        result['showLabel' + j] = VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Show Labels');
                        result['labelColor' + j] = VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Colour of labels');
                        result['displayColor' + j] = VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Display colour');
                        result['fontWeightForDim' + j] = VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font weight');
                        result['fontStyleForDim' + j] = VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font style');
                        result['fontSizeForDim' + j] = parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font size'));
                    }

                    return result;
                }

                var Helper = (function () {

                    var BASE_COLOR = '#ffffff';

                    var dim1Color = d3.scaleLinear();

                    var dim2Color = d3.scaleLinear();

                    function Helper(config) {
                        this.config = config;
                        this.dimension = config.dimension;
                        this.dimension2 = config.dimension2;
                        this.measure = config.measure;
                        this.colorPattern = config.colorPattern;
                        this.maxDim = config.maxDim;
                        this.showValues = config.showValues;
                        this.valueTextColour = config.valueTextColour;
                        this.showLabel = config.showLabel;
                        this.showLabel2 = config.showLabel2;
                        this.labelColor = config.labelColor;
                        this.labelColor2 = config.labelColor2;
                        this.displayColor = config.displayColor;
                        this.displayColor2 = config.displayColor2 || '#999';
                        this.fontWeightForDim = config.fontWeightForDim;
                        this.fontWeightForDim2 = config.fontWeightForDim2;
                        this.fontWeightForMes = config.fontWeightForMes;
                        this.fontStyleForDim = config.fontStyleForDim;
                        this.fontStyleForDim2 = config.fontStyleForDim2;
                        this.fontStyleForMes = config.fontStyleForMes;
                        this.fontSizeForDim = config.fontSizeForDim;
                        this.fontSizeForDim2 = config.fontSizeForDim2;
                        this.fontSizeForMes = config.fontSizeForMes;
                        this.numberFormat = config.numberFormat;
                        this.textPadding = 2;
                        this.total = 0;
                    }

                    Helper.prototype.setColorDomainRange = function (arr, dim) {
                        var values = [];
                        arr.forEach(function (item) {
                            if (item.depth == dim) {
                                values.push(item.value);
                            }
                        });

                        if (dim == 1) {
                            dim1Color.domain([Math.min.apply(Math, values), Math.max.apply(Math, values)]);
                            dim1Color.range([d3.rgb(this.displayColor).brighter(), d3.rgb(this.displayColor).darker()])
                        } else if (dim == 2) {
                            dim2Color.domain([Math.min.apply(Math, values), Math.max.apply(Math, values)]);
                            dim2Color.range([d3.rgb(this.displayColor2).brighter(), d3.rgb(this.displayColor2).darker()])
                        }
                    }

                    Helper.prototype.getFillColor = function (obj, index) {
                        if (index == 0) {
                            return BASE_COLOR;
                        }

                        if (this.colorPattern == 'single_color') {
                            if (this.maxDim == 2) {
                                if (obj.children) {
                                    return this.displayColor;
                                } else {
                                    return this.displayColor2;
                                }
                            } else {
                                return this.displayColor;
                            }/*
                            var lightness = 0.70 + obj.depth / 10;
                            return d3.hsl(213, .13, lightness);*/
                        } else if (this.colorPattern == 'unique_color') {
                            /*var r = parseInt(Math.abs(Math.sin(5*index)) * 255),
                                g = parseInt(Math.abs(Math.cos(3*index)) * 255),
                                b = parseInt(Math.abs(Math.sin(7*index)) * 255);
                            return d3.rgb(r, g, b);*/
                            var defaultColors = D3Utils.getDefaultColorset();
                            return defaultColors[index % (defaultColors.length)];
                            // return d3.schemeCategory20c[index % (d3.schemeCategory20c.length)];
                        } else if (this.colorPattern == 'gradient_color') {
                            if (this.maxDim == 2) {
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

                    Helper.prototype.getVisibilityValue = function (element, node) {
                        var contWidth = node.x1 - node.x0,
                            contHeight = node.y1 - node.y0,
                            textWidth = element.getComputedTextLength(),
                            textHeight = parseInt(d3.select(element).style('font-size').replace('px', ''));

                        if (((textWidth + 2 * this.textPadding) > contWidth) || ((textHeight + 2 * this.textPadding) > contHeight)) {
                            return 'hidden';
                        }

                        return 'visible';
                    }

                    Helper.prototype.getFilterLabels = function (obj) {
                        var result = [];

                        if (this.maxDim == 2) {
                            if (obj.children) {
                                if (this.showLabel) {
                                    result = result.concat({ node: obj, data: obj.data.key });
                                }
                            } else {
                                if (this.showLabel2) {
                                    result = result.concat({ node: obj, data: obj.data.key });
                                }
                            }
                        } else {
                            if (this.showLabel) {
                                result = result.concat({ node: obj, data: obj.data.key });
                            }
                        }

                        if (this.showValues) {
                            var nf = D3Utils.getNumberFormatter(this.numberFormat),
                                value;

                            if (this.numberFormat == "Percent") {
                                value = nf(obj.value / this.total);
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

                    Helper.prototype.getColorValue = function (data, index) {
                        if (index === 0) {
                            if ((data.node.children && this.maxDim == 2) || (!data.node.children && this.maxDim == 1)) {
                                if (this.showLabel) {
                                    return this.labelColor;
                                }
                            } else {
                                if (this.showLabel2) {
                                    return this.labelColor2;
                                }
                            }
                        } else if (this.showValues) {
                            return this.valueTextColour;
                        }

                        return null;
                    }

                    Helper.prototype.getFontWeightValue = function (obj, index) {
                        if (index === 0) {
                            if ((obj.node.children && this.maxDim == 2) || (!obj.node.children && this.maxDim == 1)) {
                                if (this.showLabel) {
                                    return this.fontWeightForDim;
                                }
                            } else {
                                if (this.showLabel2) {
                                    return this.fontWeightForDim2;
                                }
                            }
                        } else if (this.showValues) {
                            return this.fontWeightForMes;
                        }

                        return null;
                    }

                    Helper.prototype.getFontStyleValue = function (obj, index) {
                        if (index === 0) {
                            if ((obj.node.children && this.maxDim == 2) || (!obj.node.children && this.maxDim == 1)) {
                                if (this.showLabel) {
                                    return this.fontStyleForDim;
                                }
                            } else {
                                if (this.showLabel2) {
                                    return this.fontStyleForDim2;
                                }
                            }
                        } else if (this.showValues) {
                            return this.fontStyleForMes;
                        }

                        return null;
                    }

                    Helper.prototype.getFontSizeValue = function (obj, index) {
                        if (index === 0) {
                            if ((obj.node.children && this.maxDim == 2) || (!obj.node.children && this.maxDim == 1)) {
                                if (this.showLabel) {
                                    return this.fontSizeForDim;
                                }
                            } else {
                                if (this.showLabel2) {
                                    return this.fontSizeForDim2;
                                }
                            }
                        } else if (this.showValues) {
                            return this.fontSizeForMes;
                        }

                        return null;
                    }

                    Helper.prototype.toggleTooltip = function (visibility, scope) {
                        return function (d, i) {
                            var measuresFormate,
                                nf = D3Utils.getNumberFormatter(scope.helper.numberFormat);
                            if (scope.helper.numberFormat == "Percent") {
                                measuresFormate = nf(d.value / scope.helper.total);
                            } else {
                                measuresFormate = nf(d.value);
                            }
                            var element = d3.select(this),

                                displayName = d.data.key,
                                dimension = '',
                                measures = D3Utils.title(scope.helper.measure);

                            D3Utils.contentTooltip(visibility, scope, element, displayName, dimension, measures, measuresFormate);
                        }
                    }

                    Helper.prototype.hovered = function (state) {
                        return function (d, i) {
                            d3.select(d.node).select('rect')
                                .classed('focused', state);
                        };
                    }

                    Helper.prototype.onLassoStart = function (lasso, scope) {
                        return function () {
                            if ($rootScope.filterSelection.lasso) {
                                lasso.items()
                                    // .attr("r",3.5) // reset size
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
                            // .a`ttr("r",7);

                            lasso.notSelectedItems()
                            // .attr("r",3.5);

                            var confirm = d3.select(scope.container).select('.confirm')
                                .style('visibility', 'visible');

                            var filter = {};
                            $rootScope.filterSelection.id = scope.id;

                            data.forEach(function (d) {
                                if (scope.helper.maxDim == 2) {
                                    if (d.children) {
                                        if (filter[scope.helper.dimension]) {
                                            var temp = filter[scope.helper.dimension];
                                            if (temp.indexOf(d.data.key) < 0) {
                                                temp.push(d.data.key);
                                            }
                                            filter[scope.helper.dimension] = temp;
                                        } else {
                                            filter[scope.helper.dimension] = [d.data.key];
                                        }
                                    } else {
                                        if (filter[scope.helper.dimension2]) {
                                            var temp = filter[scope.helper.dimension2];
                                            if (temp.indexOf(d.data.key) < 0) {
                                                temp.push(d.data.key);
                                            }
                                            filter[scope.helper.dimension2] = temp;
                                        } else {
                                            filter[scope.helper.dimension2] = [d.data.key];
                                        }
                                    }
                                } else {
                                    if (filter[scope.helper.dimension]) {
                                        var temp = filter[scope.helper.dimension];
                                        if (temp.indexOf(d.data.key) < 0) {
                                            temp.push(d.data.key);
                                        }
                                        filter[scope.helper.dimension] = temp;
                                    } else {
                                        filter[scope.helper.dimension] = [d.data.key];
                                    }
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

                var Treemap = (function () {

                    function Treemap(container, record, properties) {
                        this.container = container;
                        this.id = record.id;
                        this.originalData = record.data;
                        this.helper = new Helper(properties);

                        $('#treemap-' + this.id).remove();
                        var div = d3.select(container).append('div')
                            .attr('id', 'treemap-' + this.id)
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

                    Treemap.prototype.updateChart = function (data) {
                        var me = this;

                        var container = d3.select(this.container),
                            svg = container.select('svg');

                        this.originalData = data;

                        var root = d3.hierarchy({ values: me._nest.entries(data) }, function (d) { return d.values; })
                            .sum(function (d) { return d.value; })
                            .sort(function (a, b) { return b.value - a.value; });

                        this.helper.total = root.value;
                        this._treemap(root);

                        var dim = this.helper.maxDim;

                        while (dim > 0) {
                            this.helper.setColorDomainRange(root.descendants(), dim);
                            dim -= 1;
                        }

                        var cell = container.selectAll('.node')
                            .data(transformedData);

                        var cell = svg.selectAll('.node')
                            .data(root.descendants());

                        cell.exit().remove();
                        cell.enter().append('g')
                            .attr('class', 'node');
                    }

                    Treemap.prototype.renderChart = function () {
                        var data = this.originalData;
                        var padding = 15,
                            offsetHeight = 15,
                            offsetWidth = 30;

                        var me = this;

                        var width = this.container.clientWidth - offsetWidth;
                        var height = this.container.clientHeight - offsetHeight;

                        var svg = d3.select(this.container).select('svg');

                        svg.selectAll('g').remove();

                        svg.attr('width', width)
                            .attr('height', height);

                        var treemap = this._treemap = d3.treemap()
                            .size([width, height])
                            .paddingOuter(function (node) {
                                if (node.parent) {
                                    return 3;
                                }
                                return 1;
                            })
                            .paddingTop(function (node) {
                                if (node.parent) {
                                    return 20;
                                }
                                return padding;
                            })
                            .paddingInner(3)
                            .round(true);

                        if (this.helper.maxDim == 2) {
                            var nest = this._nest = d3.nest()
                                .key(function (d) { return d[me.helper.dimension]; })
                                .key(function (d) { return d[me.helper.dimension2]; })
                                .rollup(function (d) { return d3.sum(d, function (d) { return d[me.helper.measure]; }); });
                        } else {
                            var nest = this._nest = d3.nest()
                                .key(function (d) { return d[me.helper.dimension]; })
                                .rollup(function (d) { return d3.sum(d, function (d) { return d[me.helper.measure]; }); });
                        }

                        var root = d3.hierarchy({ values: nest.entries(data) }, function (d) { return d.values; })
                            .sum(function (d) { return d.value; })
                            .sort(function (a, b) { return b.value - a.value; });

                        this.helper.total = root.value;

                        treemap(root);

                        var dim = this.helper.maxDim;

                        while (dim > 0) {
                            this.helper.setColorDomainRange(root.descendants(), dim);
                            dim -= 1;
                        }

                        var tooltip = d3.select(me.container).select('.tooltip_custom');
                        tooltip.on('mouseover', function () {
                            var top = parseFloat(tooltip.style('top').replace('px', ''));
                            tooltip.style('top', top - 10 + 'px');
                        });

                        var cell = svg.selectAll('.node')
                            .data(root.descendants())
                            .enter().append('g')
                            .attr('transform', function (d) {
                                return 'translate(' + d.x0 + ',' + d.y0 + ')';
                            })
                            .attr('class', 'node')
                            .each(function (d) { d.node = this; });

                        cell.filter(function (d) { return d.parent; })
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

                                var rect = d3.select(this).select('rect');

                                if (rect.classed('selected')) {
                                    rect.classed('selected', false);
                                } else {
                                    rect.classed('selected', true);
                                }

                                if (me.helper.maxDim == 2) {
                                    if (d.children) {
                                        if (filter[me.helper.dimension]) {
                                            var temp = filter[me.helper.dimension];
                                            if (temp.indexOf(d.data.key) < 0) {
                                                temp.push(d.data.key);
                                            } else {
                                                temp.splice(temp.indexOf(d.data.key), 1);
                                            }
                                            filter[me.helper.dimension] = temp;
                                        } else {
                                            filter[me.helper.dimension] = [d.data.key];
                                        }
                                    } else {
                                        if (filter[me.helper.dimension2]) {
                                            var temp = filter[me.helper.dimension2];
                                            if (temp.indexOf(d.data.key) < 0) {
                                                temp.push(d.data.key);
                                            } else {
                                                temp.splice(temp.indexOf(d.data.key), 1);
                                            }
                                            filter[me.helper.dimension2] = temp;
                                        } else {
                                            filter[me.helper.dimension2] = [d.data.key];
                                        }
                                    }
                                } else {
                                    if (filter[me.helper.dimension]) {
                                        var temp = filter[me.helper.dimension];
                                        if (temp.indexOf(d.data.key) < 0) {
                                            temp.push(d.data.key);
                                        } else {
                                            temp.splice(temp.indexOf(d.data.key), 1);
                                        }
                                        filter[me.helper.dimension] = temp;
                                    } else {
                                        filter[me.helper.dimension] = [d.data.key];
                                    }
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

                        var t = d3.transition()
                            .duration(COMMON.DURATION)
                            .ease(d3.easeQuadIn)
                            .on('end', afterTransition);

                        var rect = cell.append('rect')
                            .attr('rx', 2)
                            .attr('ry', 2)

                            .attr('id', function (d, i) {
                                return 'rect-' + i;
                            });

                        rect.transition(t)
                            .attr('width', function (d) {
                                return d.x1 - d.x0;
                            })
                            .attr('height', function (d) {
                                return d.y1 - d.y0;
                            })
                            .attr('fill', function (d, i) {
                                return me.helper.getFillColor(d, i);
                            });

                        rect.filter(function (d) { return d.parent; })
                            .on('mouseover', me.helper.hovered(true))
                            .on('mouseout', me.helper.hovered(false));

                        function afterTransition() {
                            cell.filter(function (d, i) { return d.parent; })
                                .append('text')
                                .selectAll('tspan')
                                .data(function (d, i) {
                                    return me.helper.getFilterLabels(d);
                                })
                                .enter().append('tspan')
                                .attr('x', function (d, i) {
                                    return i ? null : me.helper.textPadding;
                                })
                                .attr('y', '1em')
                                .text(function (d, i) {
                                    return i ? ', ' + d.data : d.data;
                                })
                                .attr('fill', function (d, i) {
                                    return me.helper.getColorValue(d, i);
                                })
                                .attr('visibility', function (d, i) {
                                    var parentNode = d3.select(this).node().parentNode;
                                    return me.helper.getVisibilityValue(parentNode, d.node);
                                })
                                .style('font-style', function (d, i) {
                                    return me.helper.getFontStyleValue(d, i);
                                })
                                .style('font-weight', function (d, i) {
                                    return me.helper.getFontWeightValue(d, i);
                                })
                                .style('font-size', function (d, i) {
                                    return me.helper.getFontSizeValue(d, i);
                                });
                        }

                        var lasso = d3.lasso()
                            .hoverSelect(true)
                            .closePathSelect(true)
                            .closePathDistance(100)
                            .items(rect.filter(function (d) { return d.parent; }))
                            .targetArea(svg);

                        lasso.on('start', me.helper.onLassoStart(lasso, me))
                            .on('draw', me.helper.onLassoDraw(lasso, me))
                            .on('end', me.helper.onLassoEnd(lasso, me));

                        svg.call(lasso);
                    }

                    return Treemap;

                })();

                if (Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                    if ($rootScope.filterSelection.id != record.id) {
                        var treemap = $rootScope.updateWidget[record.id];
                        treemap.updateChart(record.data);
                    }
                } else {
                    var treemap = new Treemap(element[0], record, getProperties(VisualizationUtils, record));
                    treemap.renderChart();

                    $rootScope.updateWidget[record.id] = treemap;
                }
            }
        }
    }
})();
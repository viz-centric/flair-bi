(function() {
    "use strict";

    angular.module("flairbiApp").factory("GenerateBoxplot", GenerateBoxplot);

    GenerateBoxplot.$inject = [
        "VisualizationUtils",
        "$rootScope",
        "D3Utils",
        "filterParametersService"
    ];

    function GenerateBoxplot(
        VisualizationUtils,
        $rootScope,
        D3Utils,
        filterParametersService
    ) {
        return {
            build: function(record, element, panel) {
                function getProperties(VisualizationUtils, record) {
                    var result = {};

                    var features = VisualizationUtils.getDimensionsAndMeasures(
                            record.fields
                        ),
                        dimensions = features.dimensions,
                        measures = features.measures,
                        eachMeasure,
                        allMeasures = [];

                    result["dimension"] = D3Utils.getNames(dimensions)[0];
                    result["measures"] = D3Utils.getNames(measures);

                    result["maxMes"] = measures.length;

                    result["showXaxis"] = VisualizationUtils.getPropertyValue(
                        record.properties,
                        "Show X Axis"
                    );
                    result["showYaxis"] = VisualizationUtils.getPropertyValue(
                        record.properties,
                        "Show Y Axis"
                    );
                    result["axisColor"] = VisualizationUtils.getPropertyValue(
                        record.properties,
                        "Axis Colour"
                    );

                    result[
                        "showLabels"
                    ] = VisualizationUtils.getFieldPropertyValue(
                        dimensions[0],
                        "Show Labels"
                    );
                    result[
                        "labelColor"
                    ] = VisualizationUtils.getFieldPropertyValue(
                        dimensions[0],
                        "Colour of labels"
                    );
                    result[
                        "numberFormat"
                    ] = VisualizationUtils.getFieldPropertyValue(
                        dimensions[0],
                        "Number format"
                    );

                    for (var i = 0; i < result.maxMes; i++) {
                        eachMeasure = {};
                        eachMeasure["measure"] = result["measures"][i];
                        eachMeasure[
                            "color"
                        ] = VisualizationUtils.getFieldPropertyValue(
                            measures[i],
                            "Display colour"
                        );
                        allMeasures.push(eachMeasure);
                    }

                    result["measure_property"] = allMeasures;

                    return result;
                }

                var Helper = (function() {
                    function Helper(config) {
                        this.config = config;
                        this.dimension = config.dimension;
                        this.measures = config.measures;
                        this.showXaxis = config.showXaxis;
                        this.showYaxis = config.showYaxis;
                        this.axisColor = config.axisColor;
                        this.showLabels = config.showLabels;
                        this.labelColor = config.labelColor;
                        this.numberFormat = config.numberFormat;
                        this.measure_property = config.measure_property;
                    }

                    Helper.prototype.getXAxisVisibility = function() {
                        return this.showXaxis ? "visible" : "hidden";
                    };

                    Helper.prototype.getYAxisVisibility = function() {
                        return this.showYaxis ? "visible" : "hidden";
                    };

                    Helper.prototype.getLabelVisibility = function() {
                        return this.showLabels ? "visible" : "hidden";
                    };

                    Helper.prototype.getAxisColor = function() {
                        return this.axisColor;
                    };

                    Helper.prototype.setAxisColor = function(scope) {
                        d3
                            .select(scope.container)
                            .select("#x_axis path")
                            .attr("stroke", this.axisColor);

                        d3
                            .select(scope.container)
                            .select("#y_axis path")
                            .attr("stroke", this.axisColor);
                    };

                    Helper.prototype.getLabelColor = function() {
                        return this.labelColor;
                    };

                    Helper.prototype.getGlobalMinMax = function(data) {
                        var me = this;
                        var minValues = [],
                            maxValues = [];

                        data.forEach(function(d) {
                            minValues.push(d[me.measures[0]]);
                            maxValues.push(d[me.measures[4]]);
                        });

                        return [
                            Math.min.apply(Math, minValues),
                            Math.max.apply(Math, maxValues)
                        ];
                    };

                    Helper.prototype.getXLabels = function(data) {
                        var me = this;
                        return data.map(function(d) {
                            return d[me.dimension];
                        });
                    };

                    Helper.prototype.getMargin = function() {
                        return {
                            top: 15,
                            right: 15,
                            bottom: 35,
                            left: 35
                        };
                    };

                    Helper.prototype.getColor = function(key) {
                        var property = this.measure_property.filter(function(
                            obj
                        ) {
                            return obj.measure == key;
                        })[0];

                        return property.color;
                    };

                    Helper.prototype.toggleTooltip = function(
                        visibility,
                        scope
                    ) {
                        return function(d, i) {
                            var tooltip = d3
                                .select(scope.container)
                                .select(".tooltip_custom");

                            if (visibility == "visible") {
                                d3.select(this).style("cursor", "pointer");
                                tooltip.html(
                                    (function() {
                                        var si = scope.helper.numberFormat,
                                            nf = D3Utils.getNumberFormatter(si);

                                        return (
                                            "<p><strong>" +
                                            d[scope.helper.dimension] +
                                            "</strong></p>" +
                                            "<p><strong>Low: </strong><strong class='tooltipData'>" +
                                            D3Utils.getFormattedValue(
                                                d[scope.helper.measures[0]],
                                                nf
                                            ) +
                                            "</p></strong>" +
                                            "<p><strong>First Quartile: </strong><strong class='tooltipData'>" +
                                            D3Utils.getFormattedValue(
                                                d[scope.helper.measures[1]],
                                                nf
                                            ) +
                                            "</p></strong>" +
                                            "<p><strong>Median: </strong><strong class='tooltipData'>" +
                                            D3Utils.getFormattedValue(
                                                d[scope.helper.measures[2]],
                                                nf
                                            ) +
                                            "</p></strong>" +
                                            "<p><strong>Third Quartile: </strong><strong class='tooltipData'>" +
                                            D3Utils.getFormattedValue(
                                                d[scope.helper.measures[3]],
                                                nf
                                            ) +
                                            "</p></strong>" +
                                            "<p><strong>High: </strong><strong class='tooltipData'>" +
                                            D3Utils.getFormattedValue(
                                                d[scope.helper.measures[4]],
                                                nf
                                            ) +
                                            "</p></strong>" 
                                        );
                                    })()
                                );
                            } else {
                                d3.select(this).style("cursor", "default");
                            }

                            var offset = $(scope.container).offset();
                            var x = d3.event.pageX - offset.left,
                                y = d3.event.pageY - offset.top;

                            tooltip
                                .style("top", y + "px")
                                .style("left", x + "px");
                            tooltip.style("visibility", visibility);
                            D3Utils.constrainTooltip(
                                scope.container,
                                tooltip.node(),
                                d3.event.pageY
                            );
                        };
                    };

                    Helper.prototype.onLassoStart = function(lasso, scope) {
                        return function() {
                            if ($rootScope.filterSelection.lasso) {
                                lasso
                                    .items()
                                    .selectAll("rect")
                                    .classed("not_possible", true)
                                    .classed("selected", false);
                            }
                        };
                    };

                    Helper.prototype.onLassoDraw = function(lasso, scope) {
                        return function() {
                            $rootScope.filterSelection.lasso = true;
                            lasso
                                .items()
                                .selectAll("rect")
                                .classed("selected", false);

                            lasso
                                .possibleItems()
                                .selectAll("rect")
                                .classed("not_possible", false)
                                .classed("possible", true);

                            lasso
                                .notPossibleItems()
                                .selectAll("rect")
                                .classed("not_possible", true)
                                .classed("possible", false);
                        };
                    };

                    Helper.prototype.onLassoEnd = function(lasso, scope) {
                        return function() {
                            var data = lasso.selectedItems().data();

                            if (
                                $rootScope.filterSelection.id &&
                                $rootScope.filterSelection.id != record.id
                            ) {
                                return;
                            }

                            if (!$rootScope.filterSelection.lasso) {
                                return;
                            }

                            lasso
                                .items()
                                .selectAll("rect")
                                .classed("not_possible", false)
                                .classed("possible", false);

                            lasso
                                .selectedItems()
                                .selectAll("rect")
                                .classed("selected", true);

                            lasso.notSelectedItems().selectAll("rect");

                            var confirm = d3
                                .select(scope.container)
                                .select(".confirm")
                                .style("visibility", "visible");

                            var filter = {};
                            $rootScope.filterSelection.id = scope.id;

                            data.forEach(function(d) {
                                if (filter[scope.helper.dimension]) {
                                    var temp = filter[scope.helper.dimension];
                                    if (
                                        temp.indexOf(
                                            d[scope.helper.dimension]
                                        ) < 0
                                    ) {
                                        temp.push(d[scope.helper.dimension]);
                                    }
                                    filter[scope.helper.dimension] = temp;
                                } else {
                                    filter[scope.helper.dimension] = [
                                        d[scope.helper.dimension]
                                    ];
                                }
                            });

                            // Clear out the updateWidget property
                            var idWidget = $rootScope.updateWidget[scope.id];
                            $rootScope.updateWidget = {};
                            $rootScope.updateWidget[scope.id] = idWidget;

                            $rootScope.filterSelection.filter = filter;
                            filterParametersService.save(filter);
                            $rootScope.$broadcast(
                                "flairbiApp:filter-input-refresh"
                            );
                            $rootScope.$broadcast("flairbiApp:filter");
                        };
                    };

                    return Helper;
                })();

                var Boxplot = (function() {
                    function Boxplot(container, record, properties) {
                        this.container = container;
                        this.id = record.id;
                        this.originalData = record.data;
                        this.helper = new Helper(properties);
                        this.offset = 16;

                        $("#boxplot-" + this.id).remove();
                        var div = d3
                            .select(container)
                            .append("div")
                            .attr("id", "boxplot-" + this.id)
                            .style("width", this.container.clientWidth + "px")
                            .style("height", this.container.clientHeight + "px")
                            .style("overflow", "hidden")
                            .style("text-align", "center")
                            .style("position", "relative");

                        div.append("svg");

                        div.append("div").attr("class", "tooltip_custom");

                        D3Utils.prepareFilterButtons(
                            div,
                            $rootScope,
                            filterParametersService
                        );
                    }

                    Boxplot.prototype.updateChart = function(data) {
                        var me = this;
                        
                        var container = d3.select(this.container),
                            svg = container.select('svg');

                        this.originalData = data;

                        var globalMin, globalMax, xLabels;

                        var minMax = this.helper.getGlobalMinMax(data);
                        globalMin = minMax[0];
                        globalMax = minMax[1];

                        xLabels = this.helper.getXLabels(data);

                        this._colorScale.domain(xLabels);
                        this._xScale.domain(xLabels);
                        this._yScale.domain([globalMin, globalMax]);

                        var dimLabel = svg.selectAll('.dimLabel')
                            .data(xLabels);

                        dimLabel.exit().remove();
                        dimLabel.enter().append('g')
                            .attr('class', 'dimLabel');

                        var verticalLines = svg.selectAll('.verticalLines')
                            .data(data);
                        
                        verticalLines.exit().remove();
                        verticalLines.enter().append('line')
                            .attr('class', 'verticalLines');

                        var horizontalLines = svg.selectAll('.horizontalLines')
                            .data(data);
                        
                        horizontalLines.exit().remove();
                        horizontalLines.enter().append('line')
                            .attr('class', 'horizontalLines');

                        var box = svg.selectAll('.box')
                            .data(data);

                        box.exit().remove();
                        box.enter().append('g')
                            .attr('class', 'box');
                    }

                    Boxplot.prototype.renderChart = function() {
                        var data = this.originalData;
                        var me = this;

                        var width = this.container.clientWidth;
                        var height = this.container.clientHeight;

                        var svg = d3.select(this.container).select("svg");

                        svg.selectAll("g").remove();

                        svg.attr("width", width).attr("height", height);

                        var globalMin, globalMax, xLabels;

                        var minMax = this.helper.getGlobalMinMax(data);
                        globalMin = minMax[0];
                        globalMax = minMax[1];

                        xLabels = this.helper.getXLabels(data);

                        var margin = this.helper.getMargin();

                        var gWidth = width - margin.left - margin.right,
                            gHeight = height - margin.top - margin.bottom;

                        var barWidth = Math.floor(gWidth / data.length / 2);

                        var colorScale = this._colorScale = d3
                            .scaleOrdinal(d3.schemeCategory20)
                            .domain(xLabels);

                        var xScale = this._xScale = d3
                            .scalePoint()
                            .domain(xLabels)
                            .rangeRound([0, gWidth])
                            .padding([0.5]);

                        var yScale = this._yScale = d3
                            .scaleLinear()
                            .domain([globalMin, globalMax])
                            .range([gHeight, 0]);

                        var g = svg
                            .append("g")
                            .attr(
                                "transform",
                                "translate(" +
                                    margin.left +
                                    "," +
                                    margin.top +
                                    ")"
                            );

                        var axisLeftG = g
                            .append("g")
                            .attr("transform", "translate(0,0)");

                        var axisBottomG = g
                            .append("g")
                            .attr("transform", "translate(0," + gHeight + ")");

                        var dimLabel = g
                            .selectAll(".dimLabel")
                            .data(xLabels)
                            .attr("class",'tick')
                            .enter()
                            .append("text")
                            .text(function(d) {
                                return d;
                            })
                            .text(function(d) {
                                return D3Utils.getTruncatedLabel(
                                    this,
                                    d,
                                    barWidth,
                                    me.offset
                                );
                            })
                            .attr("x", function(d, i) {
                                return xScale(d);
                            })
                            .attr("y", 0)
                            .attr("dy", me.offset)
                            .style("text-anchor", "middle")
                            .style(
                                "visibility",
                                this.helper.getLabelVisibility()
                            )
                            .attr("fill", this.helper.getLabelColor())
                            .attr("transform", "translate(0," + gHeight + ")");

                            d3.selectAll('text.tick')
                            .attr("transform", "rotate(-20)"); 

                        var boxPlot = g
                            .append("g")
                            .attr("transform", "translate(0,0)");

                        var verticalLines = boxPlot
                            .selectAll(".verticalLines")
                            .data(data)
                            .enter()
                            .append("line")
                            .attr('class', 'verticalLines')
                            .attr("stroke", "#000")
                            .attr("stroke-width", 1)
                            .style("stroke-dasharray", 3)
                            .attr("fill", "none");

                        var box = boxPlot
                            .selectAll(".box")
                            .data(data)
                            .enter()
                            .append("g")
                            .attr('class', 'box')
                            .attr("id", function(d, i) {
                                return "box" + i;
                            })
                            .on(
                                "mouseover",
                                this.helper.toggleTooltip("visible", me)
                            )
                            .on("mousemove", function() {
                                var tooltip = d3
                                    .select(me.container)
                                    .select(".tooltip_custom");
                                var offset = $(me.container).offset();
                                var x = d3.event.pageX - offset.left,
                                    y = d3.event.pageY - offset.top;

                                tooltip
                                    .style("top", y + 10 + "px")
                                    .style("left", x + 10 + "px");
                                D3Utils.constrainTooltip(
                                    me.container,
                                    tooltip.node(),
                                    d3.event.pageY
                                );
                            })
                            .on(
                                "mouseout",
                                this.helper.toggleTooltip("hidden", me)
                            )
                            .on("click", function(d, i) {
                                if (
                                    $rootScope.filterSelection.id &&
                                    $rootScope.filterSelection.id != record.id
                                ) {
                                    return;
                                }

                                $rootScope.filterSelection.lasso = false;

                                var confirm = d3
                                    .select(me.container)
                                    .select(".confirm")
                                    .style("visibility", "visible");

                                var filter = {};

                                if ($rootScope.filterSelection.id) {
                                    filter = $rootScope.filterSelection.filter;
                                } else {
                                    $rootScope.filterSelection.id = me.id;
                                }

                                var rect = d3.select(this).selectAll("rect");

                                if (rect.classed("selected")) {
                                    rect.classed("selected", false);
                                } else {
                                    rect.classed("selected", true);
                                }

                                if (filter[me.helper.dimension]) {
                                    var temp = filter[me.helper.dimension];
                                    if (
                                        temp.indexOf(d[me.helper.dimension]) < 0
                                    ) {
                                        temp.push(d[me.helper.dimension]);
                                    } else {
                                        temp.splice(
                                            temp.indexOf(
                                                d[me.helper.dimension]
                                            ),
                                            1
                                        );
                                    }
                                    filter[me.helper.dimension] = temp;
                                } else {
                                    filter[me.helper.dimension] = [
                                        d[me.helper.dimension]
                                    ];
                                }

                                // Clear out the updateWidget property
                                var idWidget = $rootScope.updateWidget[me.id];
                                $rootScope.updateWidget = {};
                                $rootScope.updateWidget[me.id] = idWidget;

                                $rootScope.filterSelection.filter = filter;
                                filterParametersService.save(filter);
                                $rootScope.$broadcast(
                                    "flairbiApp:filter-input-refresh"
                                );
                                $rootScope.$broadcast("flairbiApp:filter");
                            });

                        var lowerBox = box
                            .append("rect")
                            .attr("width", barWidth)
                            .attr("x", function(d) {
                                return (
                                    xScale(d[me.helper.dimension]) -
                                    barWidth / 2
                                );
                            })
                            .attr("y", function(d) {
                                return yScale(d[me.helper.measures[2]]);
                            })
                            .attr("fill", function(d) {
                                return me.helper.getColor(
                                    me.helper.measures[1]
                                );
                            })
                            .attr("stroke", function(d) {
                                return d3
                                    .rgb(
                                        me.helper.getColor(
                                            me.helper.measures[1]
                                        )
                                    )
                                    .darker();
                            })
                            .attr("stroke-width", 1)
                            .attr("height", 0)
                            .transition()
                            .duration(800)
                            .ease(d3.easeQuadIn)
                            .attr("height", function(d) {
                                var height =
                                    yScale(d[me.helper.measures[1]]) -
                                    yScale(d[me.helper.measures[2]]);
                                return height;
                            });

                        var upperBox = box
                            .append("rect")
                            .attr("width", barWidth)
                            .attr("x", function(d) {
                                return (
                                    xScale(d[me.helper.dimension]) -
                                    barWidth / 2
                                );
                            })
                            .attr("fill", function(d) {
                                return me.helper.getColor(
                                    me.helper.measures[3]
                                );
                            })
                            .attr("stroke", function(d) {
                                return d3
                                    .rgb(
                                        me.helper.getColor(
                                            me.helper.measures[3]
                                        )
                                    )
                                    .darker();
                            })
                            .attr("stroke-width", 1)
                            .attr("y", function(d) {
                                return yScale(d[me.helper.measures[2]]);
                            })
                            .attr("height", 0)
                            .transition()
                            .duration(800)
                            .ease(d3.easeQuadIn)
                            .attr("height", function(d) {
                                var height =
                                    yScale(d[me.helper.measures[2]]) -
                                    yScale(d[me.helper.measures[3]]);
                                return height;
                            })
                            .attr("y", function(d) {
                                return yScale(d[me.helper.measures[3]]);
                            })
                            .on("end", afterTransition);

                        var horizontalLineConfigs = [
                            {
                                label: me.helper.measures[4],
                                x1: function(d) {
                                    return (
                                        xScale(d[me.helper.dimension]) -
                                        barWidth / 2
                                    );
                                },
                                y1: function(d) {
                                    return yScale(d[me.helper.measures[4]]);
                                },
                                x2: function(d) {
                                    return (
                                        xScale(d[me.helper.dimension]) +
                                        barWidth / 2
                                    );
                                },
                                y2: function(d) {
                                    return yScale(d[me.helper.measures[4]]);
                                }
                            },
                            {
                                label: me.helper.measures[2],
                                x1: function(d) {
                                    return (
                                        xScale(d[me.helper.dimension]) -
                                        barWidth / 2
                                    );
                                },
                                y1: function(d) {
                                    return yScale(d[me.helper.measures[2]]);
                                },
                                x2: function(d) {
                                    return (
                                        xScale(d[me.helper.dimension]) +
                                        barWidth / 2
                                    );
                                },
                                y2: function(d) {
                                    return yScale(d[me.helper.measures[2]]);
                                }
                            },
                            {
                                label: me.helper.measures[0],
                                x1: function(d) {
                                    return (
                                        xScale(d[me.helper.dimension]) -
                                        barWidth / 2
                                    );
                                },
                                y1: function(d) {
                                    return yScale(d[me.helper.measures[0]]);
                                },
                                x2: function(d) {
                                    return (
                                        xScale(d[me.helper.dimension]) +
                                        barWidth / 2
                                    );
                                },
                                y2: function(d) {
                                    return yScale(d[me.helper.measures[0]]);
                                }
                            }
                        ];

                        function afterTransition() {
                            verticalLines
                                .attr("x1", function(d) {
                                    return xScale(d[me.helper.dimension]);
                                })
                                .attr("y1", function(d) {
                                    return yScale(d[me.helper.measures[0]]);
                                })
                                .attr("x2", function(d) {
                                    return xScale(d[me.helper.dimension]);
                                })
                                .attr("y2", function(d) {
                                    return yScale(d[me.helper.measures[4]]);
                                });

                            horizontalLineConfigs.forEach(function(config) {
                                g
                                    .selectAll(".horizontalLines")
                                    .data(data)
                                    .enter()
                                    .append("line")
                                    .attr('class', 'horizontalLines')
                                    .attr("x1", config.x1)
                                    .attr("y1", config.y1)
                                    .attr("x2", config.x2)
                                    .attr("y2", config.y2)
                                    .attr("stroke", function(d) {
                                        return me.helper.getColor(config.label);
                                    })
                                    .attr("stroke-width", 2)
                                    .attr("fill", "none");
                            });
                        }

                        var axisLeft = d3.axisLeft(yScale);
                        axisLeftG
                            .append("g")
                            .attr("id", "y_axis")
                            .style(
                                "visibility",
                                this.helper.getYAxisVisibility()
                            )
                            .call(axisLeft);

                        var axisBottom = d3
                            .axisBottom(xScale)
                            .tickFormat(function(d) {
                                return "";
                            });
                        axisBottomG
                            .append("g")
                            .attr("id", "x_axis")
                            .call(axisBottom);

                        if (this.helper.getXAxisVisibility() == "visible") {
                            d3
                                .select("#x_axis path")
                                .style("stroke-opacity", 1);
                        } else {
                            d3
                                .select("#x_axis path")
                                .style("stroke-opacity", 0);
                        }

                        this.helper.setAxisColor(this);

                        var lasso = d3
                            .lasso()
                            .hoverSelect(true)
                            .closePathSelect(true)
                            .closePathDistance(100)
                            .items(box)
                            .targetArea(svg);

                        lasso
                            .on("start", me.helper.onLassoStart(lasso, me))
                            .on("draw", me.helper.onLassoDraw(lasso, me))
                            .on("end", me.helper.onLassoEnd(lasso, me));

                        boxPlot.call(lasso);
                    };

                    return Boxplot;
                
                })();

                if(Object.keys($rootScope.updateWidget).indexOf(record.id) != -1) {
                    if($rootScope.filterSelection.id != record.id) {
                        var boxplot = $rootScope.updateWidget[record.id];
                        boxplot.updateChart(record.data);
                    }
                } else {
                    var boxplot = new Boxplot(element[0], record, getProperties(VisualizationUtils, record));
                    boxplot.renderChart();

                    $rootScope.updateWidget[record.id] = boxplot;
                }
            }
        };
    }
})();

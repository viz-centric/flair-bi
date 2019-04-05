var COMMON = require('../extras/common.js')();

function legend() {
    return function(data, selection, extraParams) {
        if(extraParams.labelStack == void 0) {
            extraParams.labelStack = [];
        }

        var me = this;

        var width = 12,
            height = 12;

        var legend = selection.append('g')
            .attr('id', function() {
                return me._getName() + '-legend';
            })
            .attr('class', 'legend')
            .attr('display', 'block');

        var legendItem = legend.selectAll('.item')
            .data(data)
            .enter().append('g')
                .attr('class', 'item')
                .attr('id', function(d, i) {
                    return me._getName() + '-legend-item' + i;
                })
                .attr('transform', function(d, i) {
                    var translate = [0, 0];

                    switch(me.legendPosition()) {
                        case 'Top':
                            translate = [i * Math.floor(extraParams.width/data.length), 0];
                            break;
                        case 'Bottom':
                            translate = [i * Math.floor(extraParams.width/data.length), (extraParams.height - COMMON.PADDING)];
                            break;
                        case 'right':
                            translate = [(4 / 5) * extraParams.width, i * 20];
                            break;
                        case 'Left':
                            translate = [0, i * 20];
                    }

                    return 'translate(' + translate.toString() + ')';
                })
                .on('mouseover', function(d, i) {
                    d3.select(this).attr('cursor', 'pointer');
                    me._legendInteraction('mouseover', d);
                })
                .on('mousemove', function(d, i) {
                    d3.select(this).attr('cursor', 'pointer');
                    me._legendInteraction('mousemove', d);
                })
                .on('mouseout', function(d, i) {
                    d3.select(this).attr('cursor', 'default');
                    me._legendInteraction('mouseout', d);
                })
                .on('click', function(d, i) {
                    var rect = d3.select(this).select('rect'),
                        o = parseInt(rect.style('fill-opacity'));

                    if(!o) {
                        rect.style('fill-opacity', 1)
                            .style('stroke-width', 0);
                    } else {
                        rect.style('fill-opacity', 0)
                            .style('stroke-width', 1);
                    }

                    me._legendInteraction('click', d);
                });

        legendItem.append('rect')
            .attr('width', width)
            .attr('height', height)
            .style('fill', function(d, i) {
                if(typeof d == 'string') {
                    return COMMON.COLORSCALE(d);
                }
                return COMMON.COLORSCALE(d[me.dimension()]);
            })
            .style('fill-opacity', function(d, i) {
                if(typeof d == 'string') {
                    return extraParams.labelStack.indexOf(d) == -1 ? 1 : 0;
                }
                return extraParams.labelStack.indexOf(d[me.dimension()]) == -1 ? 1 : 0;
            })
            .style('stroke', function(d, i) {
                if(typeof d == 'string') {
                    return COMMON.COLORSCALE(d);
                }
                return COMMON.COLORSCALE(d[me.dimension()]);
            })
            .style('stroke-width', function(d, i) {
                if(typeof d == 'string') {
                    return extraParams.labelStack.indexOf(d) == -1 ? 1 : 0;
                }
                return extraParams.labelStack.indexOf(d[me.dimension()]) == -1 ? 0 : 1;
            }),

        legendItem.append('text')
            .attr('x', 18)
            .attr('y', 10)
            .text(function(d) {
                if(typeof d == 'string') {
                    return d;
                }
                return d[me.dimension()];
            })
            .style('fill', COMMON.LEGEND_COLOR)
            .style('font-weight', 'bold')

        var legendWidth = legend.node().getBBox().width,
            legendHeight = legend.node().getBBox().height;

        legendItem.attr('transform', function(d, i) {
            var translate = [0, 0];

            switch(me.legendPosition()) {
                case 'Top':
                    translate = [i * Math.floor(extraParams.width/data.length), 0];
                    break;
                case 'Bottom':
                    translate = [i * Math.floor(extraParams.width/data.length), (extraParams.height - COMMON.PADDING)];
                    break;
                case 'right':
                    /* For pie and doughnut chart vertically center the legend items */
                    if(me._getName() == 'pie' || me._getName() == 'doughnut') {
                        translate = [(4 / 5) * extraParams.width, ((extraParams.height / 2) - (legendHeight / 2) + i * 20)];
                    } else {
                        translate = [(extraParams.width - legendWidth), i * 20];
                    }
                    break;
                case 'Left':
                    /* For pie and doughnut chart vertically center the legend items */
                    if(me._getName() == 'pie' || me._getName() == 'doughnut') {
                        translate = [0, ((extraParams.height / 2) - (legendHeight / 2) + i * 20)];
                    } else {
                        translate = [0, i * 20];
                    }
            }

            return 'translate(' + translate.toString() + ')';
        });

        return {
            legendWidth: legendWidth,
            legendHeight: legendHeight
        }
    }
}

module.exports = legend;
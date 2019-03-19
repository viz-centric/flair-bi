function legend() {
    return function (data, selection, extraParams) {
        var me = this,
            labelStack = [];

        var width = 12,
            height = 12;

        var legend = selection.append('g')
            .attr('id', function () {
                return me._getName() + '-legend';
            })
            .attr('class', 'legend')
            .attr('display', 'block');

        var legendItem = legend.selectAll('.item')
            .data(data)
            .enter().append('g')
            .attr('class', 'item')
            .attr('id', function (d, i) {
                return me._getName() + '-legend-item' + i;
            })
            .attr('transform', function (d, i) {
                var translate = [0, 0];

                switch (me.legendPosition()) {
                    case 'top':
                        translate = [i * Math.floor(extraParams.width / data.length), 0];
                        break;
                    case 'bottom':
                        translate = [i * Math.floor(extraParams.width / data.length), (extraParams.height - COMMON.PADDING)];
                        break;
                    case 'right':
                        translate = [(4 / 5) * extraParams.width, i * 20];
                        break;
                    case 'left':
                        translate = [0, i * 20];
                }

                return 'translate(' + translate.toString() + ')';
            })
            .on('mouseover', function (d, i) {
                d3.select(this).attr('cursor', 'pointer');
                me._legendInteraction('mouseover', d);
            })
            .on('mousemove', function (d, i) {
                d3.select(this).attr('cursor', 'pointer');
                me._legendInteraction('mousemove', d);
            })
            .on('mouseout', function (d, i) {
                d3.select(this).attr('cursor', 'default');
                me._legendInteraction('mouseout', d);
            })
            .on('click', function (d, i) {
                d3.select(this).attr('')
                if (labelStack.indexOf(d[chart.dimension().toString()]) == -1) {
                    labelStack.push(d[chart.dimension().toString()]);
                } else {
                    labelStack.splice(labelStack.indexOf(d[chart.dimension().toString()]), 1);
                }

                var o = parseInt(d3.select(this).select('rect').style('fill-opacity'));
                if (!o) {
                    d3.select(this).select('rect')
                        .style('fill-opacity', 1)
                        .style('stroke-width', 0);
                } else {
                    d3.select(this).select('rect')
                        .style('fill-opacity', .5)
                        .style('stroke-width', 2);
                }
                var _filter =
                    me._Local_data.filter(function (val) {
                        if (labelStack.indexOf(val[chart.dimension().toString()]) == -1) {
                            return val
                        }
                    });

                var k = d3.select(this.parentNode)
                d3.select(k.node().parentNode).select('.plot').remove();

                me.drawPlot.call(me, _filter);

            });

        legendItem.append('rect')
            .attr('width', width)
            .attr('height', height)
            .style('fill', function (d, i) {
                return COMMON.COLORSCALE(d[me.dimension()]);
            })
            .style('stroke', function (d, i) {
                return COMMON.COLORSCALE(d[me.dimension()]);
            })
            .style('stroke-width', 0);

        legendItem.append('text')
            .attr('x', 18)
            .attr('y', 10)
            .text(function (d) {
                return d[me.dimension()];
            })
            .style('font-weight', 'bold')

        if (me.legendPosition() == 'bottom' || me.legendPosition() == 'top') {
            legendItem.attr('transform', function (d, i) {
                var count = i,
                    widthSum = 0
                while (count-- != 0) {
                    widthSum += d3.select('#' + me._getName() + '-legend-item' + count).node().getBBox().width + 3 * 16;
                }
                return 'translate(' + widthSum + ', ' + (me.legendPosition() == 'top' ? 0 : extraParams.height) + ')';

            });

        }

        return {
            legendWidth: legend.node().getBBox().width,
            legendHeight: legend.node().getBBox().height
        }
    }
}
function common() {
    return {
        MARGIN: 15,
        PADDING: 15,
        OFFSET: 10,
        DEFAULT_FONTSTYLE: 'normal',
        DEFAULT_FONTSIZE: '60px',
        DEFAULT_FONTWEIGHT: 200,
        DEFAULT_COLOR: '#DC1C50',
        LEGEND_COLOR: '#6B6A5D',
        HIGHLIGHTER: '#DCDCDC',
        BORDER_RADIUS: 5,
        DURATION: 1000,
        AXIS_THICKNESS: 50,
        COLORSCALE: d3.scaleOrdinal()
            .range(['#4897D8',
                '#ED5752',
                '#5BC8AC',
                '#20948B',
                '#9A9EAB',
                '#755248',
                '#FA6E59',
                '#CF3721',
                '#31A9B8',
                '#F1F3CE',
                '#34675C',
                '#AF4425'
                ])
    }
}

module.exports = common;
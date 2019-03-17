function common() {
    return {
        PADDING: 15,
        HIGHLIGHTER: '#DCDCDC',
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
                '#EFEFEF',
                '#34675C',
                '#AF4425'
                ])
    }
}
function getPadding() {
    return 20;
}
function getMargin() {
    var margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 100
    };
    
    return margin;
}


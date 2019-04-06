import angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .factory('d3Builder', d3Builder);

d3Builder.$inject = ['d3'];

function d3Builder(d3) {
    var service = {
        createSkeleton: createSkeleton
    };

    return service;

    ////////////////
    function createSkeleton(el, height, width, margin, padding) {
        return d3.select(el)
            .append("svg")
            .attr("width", width + margin.left + margin.right + padding)
            .attr("height", height + margin.top + margin.bottom + padding)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");
    }
}
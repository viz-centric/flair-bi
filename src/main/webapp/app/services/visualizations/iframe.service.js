(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('GenerateIframe', GenerateIframe);

    GenerateIframe.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils', 'filterParametersService'];

    function GenerateIframe(VisualizationUtils, $rootScope, D3Utils, filterParametersService) {
        return {
            build: function (record, element, panel, isNotification) {
                var iframeLink = VisualizationUtils.getPropertyValue(record.properties, 'iFrame link');
                d3.select(element[0]).html('')
                var div = d3.select(element[0]).append('iframe')
                    .attr('id', 'iframe-' + element[0].id)
                    .attr('src', iframeLink)
                    .style('width', element[0].clientWidth + 'px')
                    .style('height', element[0].clientHeight + 'px')
                    .style('overflow', 'hidden')
                    .style('text-align', 'center')
                    .style('position', 'relative');

                $rootScope.updateWidget[record.id] = iframe;
            }
        }
    }
})();

(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('GenerateIframe', GenerateIframe);

    GenerateIframe.$inject = ['VisualizationUtils', '$rootScope', 'D3Utils', 'filterParametersService'];

    function GenerateIframe(VisualizationUtils, $rootScope, D3Utils, filterParametersService) {
        return {
            build: function (record, element, panel, isNotification, isIframe) {
                var iframeLink = record.properties[0].value;
                iframeLink = iframeLink + "&ifIframe=true&d=" + '_' + Math.random().toString(36).substr(2, 9)
                    ;
                // d3.select(element[0]).html('')
                if ($("iframe#iframe-" + element[0].id).length !== 0) {
                    // $("#iframe-" + element[0].id).attr('src',iframeLink)
                    var iframe = document.getElementById("iframe-" + element[0].id)
                    iframe.src = iframeLink;
                    iframe.style.width = element[0].clientWidth + 'px';
                    iframe.style.height = element[0].clientHeight + 'px';

                } else {
                    var div = d3.select(element[0]).append('iframe')
                        .attr('id', 'iframe-' + element[0].id)
                        .attr('src', iframeLink)
                        .style('width', element[0].clientWidth + 'px')
                        .style('height', element[0].clientHeight + 'px')
                        .style('overflow', 'hidden')
                        .style('border', 0)
                        .style('text-align', 'center')
                        .style('position', 'relative');
                    $rootScope.updateWidget[record.id] = iframe;
                }

            }
        }
    }
})();

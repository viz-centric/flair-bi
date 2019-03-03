(function () {
    'use strict';

    /**
     * Printing service for visual metadata
     */
    angular
        .module('flairbiApp')
        .factory('PrintService', PrintService);

    PrintService.$inject = ['$document', '$window', '$q', 'CryptoService'];

    function PrintService($document, $window, $q, CryptoService) {
        var service = {
            printWidgets: printWidgets
        };

        return service;

        ////////////////
        function printWidgets(widgetIds) {

            var docDefinition = {
                content: [],
                images: {}
            };

            var promises = [];

            widgetIds.forEach(function (item) {

                promises.push(domtoimage.toPng($('#' + item)[0])
                    .then(function (dataUrl) {
                        var img = new Image();
                        img.src = dataUrl;
                        docDefinition.content.push({
                            image: item,
                            width: 520,
                            margin: 10,
                        });
                        docDefinition.images[item] = dataUrl;
                    })
                    .catch(function (error) {
                        console.error('oops, something went wrong!', error);
                    }));
            });

            $q.all(promises).then(function () {
                pdfMake.createPdf(docDefinition).download(CryptoService.UUIDv4() + '-widgets.pdf');
            });
        }
    }
})();

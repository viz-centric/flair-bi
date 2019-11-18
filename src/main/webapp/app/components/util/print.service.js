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
        function printWidgets(widgetIds, dashboardName, viewName, buildURL) {
            
            var docDefinition = {
                content: [],
                images: {}
            };

            var promises = [];
            var fileName = "";

            widgetIds.forEach(function (item) {

                promises.push(domtoimage.toPng($('#' + item.widgetsID)[0])
                    .then(function (dataUrl) {
                        var img = new Image();
                        img.src = dataUrl;
                        fileName = item.widgetsTitle;
                        docDefinition.content.push({
                            text: item.widgetsTitle,
                            margin: 10,
                            bold: true
                        });

                        docDefinition.content.push({
                            image: item.widgetsID,
                            width: 520,
                            margin: 10,
                        });

                        docDefinition.images[item.widgetsID] = dataUrl;
                    })
                    .catch(function (error) {
                        console.error('oops, something went wrong!', error);
                    }));
            });

            $q.all(promises).then(function () {

                if (widgetIds.length > 1) {
                    fileName = viewName;
                }
                docDefinition.header = function (currentPage, pageCount, pageSize) {
                    return {
                        margin: 10,
                        table: {
                            widths: [170, 170, 170],
                            body: [
                                [
                                    {
                                        image: 'data:image/png;base64,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',
                                        fit: [100, 100],
                                        style: 'header'
                                    },
                                    {
                                        text: "Dashboard: " + dashboardName,
                                        color: 'blue',
                                        alignment: 'center'
                                    },
                                    {
                                        text: "View: " + viewName,
                                        color: 'blue',
                                        alignment: 'right'
                                    }
                                ]
                            ]
                        },
                        layout: 'noBorders'
                    }
                }
                docDefinition.footer = function (currentPage, pageCount) {
                    return {
                        margin: 10,
                        table: {
                            widths: [260, 260],
                            body: [
                                [
                                    { text: 'Page ' + currentPage.toString() + ' of ' + pageCount, alignment: 'left', style: 'footer' },
                                    { text: "Goto  Dashboard", color: 'blue', decoration: "underline", link: buildURL, alignment: 'right', style: 'footer' }
                                ]
                            ]
                        },
                        layout: 'noBorders'
                    }
                }
                pdfMake.createPdf(docDefinition).download(fileName + ".pdf");
            });
        }
    }
})();

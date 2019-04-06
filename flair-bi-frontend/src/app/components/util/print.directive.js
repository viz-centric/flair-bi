import * as angular from 'angular';
'use strict';

printDirective.$inject = ['$document', '$window'];

function printDirective($document, $window) {
    var printSection = $document[0].getElementById('printSection');
    // if there is no printing section, create one
    if (!printSection) {
        printSection = $document[0].createElement('div');
        printSection.id = 'printSection';
        $document[0].body.appendChild(printSection);
    }

    function link(scope, element, attrs) {
        element.on('click', function () {
            var elemToPrint = $document[0].getElementById(attrs.printElementId);

            if (elemToPrint) {
                printElement(elemToPrint);
            }
        });
        $window.onafterprint = function () {
            // clean the print section before adding new content
            printSection.innerHTML = '';
        };
    }

    function printElement(elem) {
        // clones the element you want to print
        var domClone = elem.cloneNode(true);
        printSection.appendChild(domClone);
        $window.print();
        printSection.innerHTML = '';
    }
    return {
        link: link,
        restrict: 'A'
    };
}
angular.module('flairbiApp').directive('printDirective', printDirective);


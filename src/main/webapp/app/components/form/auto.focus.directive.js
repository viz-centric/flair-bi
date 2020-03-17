(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .directive('autoFocus', focusDirective);

    focusDirective.$inject = ['$timeout'];
    function focusDirective($timeout) {
        var directive = {
            link: link,
            restrict: 'AC'
        };
        return directive;

        function link(_scope, element, _attrs) {
            $timeout(function(){
                element[0].focus();
            }, 0);
        }
    }
    
})();
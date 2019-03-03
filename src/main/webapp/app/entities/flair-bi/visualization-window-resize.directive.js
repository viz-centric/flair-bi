(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .directive('visualizationWindowResize', visualizationWindowResize);

    visualizationWindowResize.$inject = ['$window','$rootScope','VisualDispatchService'];

    function visualizationWindowResize($window,$rootScope,VisualDispatchService) {
        return {
            link: link,
            restrict: 'A'           
         };
    
         function link(scope, element, attrs){
    
           angular.element($window).bind('resize', function(){
               VisualDispatchService.reloadGrids();
           });  
         } 
    }
})();

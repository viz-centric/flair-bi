(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('metricProgressComponent', {
            templateUrl: 'app/components/shared/metric-progress.component.html',
            controller: metricProgressController,
            controllerAs: 'vm',
            transclude: true,
            bindings: {
                max: '=',
                min: '=',
                value: '=',
                type: '@'

            }
        });

    metricProgressController.$inject = ['$scope'];

    function metricProgressController($scope) {
        var vm = this;


        activate();

        ////////////////

        function activate() {}
    }
})();

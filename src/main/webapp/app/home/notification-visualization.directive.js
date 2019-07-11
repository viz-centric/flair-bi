(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .directive('notificationVisualizationRender', Directive);

    Directive.$inject = [];

    function Directive() {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            bindToController: true,
            controller: notificationVisualizationRenderController,
            controllerAs: 'vm',
            link: link,
            restrict: 'A',
            scope: {
                canBuild: '=',
                data: '=',
                id: '@'
            }
        };
        return directive;

        function link(scope, element, attrs) { }
    }

    notificationVisualizationRenderController.$inject = [
        '$scope','visualizationRenderService'
    ];
    /* @ngInject */
    function notificationVisualizationRenderController(
        $scope,visualizationRenderService
    ) {

        var vm = this;
        var widgets = [];
        activate();

        function activate() {
            vm.id = vm.id || 'no-id-defined';
            vm.canBuild = vm.canBuild || false;
            //vm.data=data;
            registerCanBuildChange();
        }

        function registerCanBuildChange() {
            $scope.$watch(function () {
                return vm.canBuild;
            }, function (newVal, oldVal) {
                if (vm.canBuild) {
                    build(true);
                }
            });
        }


        function build(forceQuery) {
            var contentId = "content-" + vm.data.id;
            vm.data.loading = false;
            vm.data.dataReceived = true;
            visualizationRenderService.setMetaData(
                vm.data,
                vm.data.data,
                contentId
            );
        }
    }
})();

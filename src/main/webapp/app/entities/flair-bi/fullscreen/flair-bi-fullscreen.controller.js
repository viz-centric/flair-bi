(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('FlairBiFullscreenController', FlairBiFullscreenController);

    FlairBiFullscreenController.$inject = ['$scope',
        'visualMetadata',
        'VisualWrap',
        "datasource"
    ];

    function FlairBiFullscreenController($scope,
        visualMetadata,
        VisualWrap,
        datasource) {
        var vm = this;

        vm.visualMetadata = new VisualWrap(visualMetadata);
        vm.datasource = datasource;
        activate();

        ////////////////

        function activate() {}
    }
})();

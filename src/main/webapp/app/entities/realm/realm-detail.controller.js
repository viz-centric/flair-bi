(function() {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('RealmDetailController', RealmDetailController);

    RealmDetailController.$inject = ['$scope', '$rootScope', '$stateParams', 'previousState', 'entity', 'Realm'];

    function RealmDetailController($scope, $rootScope, $stateParams, previousState, entity, Realm) {
        var vm = this;

        vm.realm = entity;
        vm.previousState = previousState.name;

        var unsubscribe = $rootScope.$on('flairbiApp:realmUpdate', function(event, result) {
            vm.realm = result;
        });
        $scope.$on('$destroy', unsubscribe);
    }
})();

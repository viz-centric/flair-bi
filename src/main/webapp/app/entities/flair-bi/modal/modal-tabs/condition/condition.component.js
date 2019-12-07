(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('conditionComponent', {
            templateUrl: 'app/entities/flair-bi/modal/modal-tabs/condition/condition.component.html',
            controller: conditionComponent,
            controllerAs: 'vm',
            bindings: {
                condition: '=',
                features: '=',
                showAdd: '@',
                showDelete: '@',
                datasourceId:'='
            }
        });

    conditionComponent.$inject = ['$scope', 'CONDITION_TYPES', 'COMPARE_TYPES', '$rootScope', 'CryptoService','proxyGrpcService'];

    function conditionComponent($scope, CONDITION_TYPES, COMPARE_TYPES, $rootScope, CryptoService,proxyGrpcService) {
        var vm = this;
        vm.load=load;
        vm.dimension={};


        vm.simpleTypes = CONDITION_TYPES.filter(function (item) {
            return item.type === 'simple';
        });
        vm.compositeTypes = CONDITION_TYPES.filter(function (item) {
            return item.type === 'composite';
        });
        vm.compareTypes = COMPARE_TYPES;
        vm.addComposition = addComposition;
        vm.removeCondition = removeCondition;
        vm.$onInit = activate;
        ////////////////

        function activate() {}

        function addComposition() {
            $rootScope.$broadcast('flairbiApp:composeCondition', vm.condition);
        }

        function removeCondition() {
            $rootScope.$broadcast('flairbiApp:decomposeCondition', vm.condition);
        }

        function load(q, featureName) {
            var dimensions = vm.features.filter(function(item) {
                return item.name === featureName;
            });
            var query = {"distinct":true,"limit":100};
            query.fields = [featureName];
            if (q) {
                query.conditionExpressions = [{
                    sourceType: 'FILTER',
                    conditionExpression: {
                        '@type': 'Like',
                        featureName: featureName,
                        caseInsensitive: true,
                        value: q
                    }
                }];
            }
            proxyGrpcService.forwardCall(
                vm.datasourceId, {
                    queryDTO: query,
                    vId:dimensions[0].id
                }
            );
        }
    }
})();

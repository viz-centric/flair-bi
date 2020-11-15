(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('conditionTabController',conditionTabController);

    conditionTabController.$inject = ['$scope', '$translate', 'CryptoService', '$log',
        'conditionExpression', 'features', '$uibModalInstance',
        'VisualDispatchService', '$rootScope', 'visualMetaData', 'datasource',
        'filterParametersService', 'Visualmetadata', 'QueryValidationService', '$q', 'SEPARATORS'];

    function conditionTabController($scope, $translate, CryptoService, $log,
                                    conditionExpression, features, $uibModalInstance,
                                    VisualDispatchService, $rootScope, visualMetaData, datasource,
                                    filterParametersService, Visualmetadata, QueryValidationService, $q, SEPARATORS) {
        var vm = this;
        vm.addStartingCondition = addStartingCondition;
        vm.conditionExpression=conditionExpression;
        vm.features=features;
        vm.clear = clear;
        vm.validate=validate;
        vm.isValidated=false;
        vm.save=save;
        vm.isSaving=false;
        vm.query='';
        vm.datasource=datasource;
        vm.separators = SEPARATORS;
        vm.separator =  vm.separators[0];

        activate();

        ////////////////

        function activate() {
            vm.features.$promise.then(function(result){
                vm.dimensions = result;
            })
            registerComposition();
            registerDecomposition();
        }

        function addStartingCondition() {
            vm.conditionExpression = {
                uuid: CryptoService.UUIDv4(),
                '@type': 'Compare',
                comparatorType: 'EQ',
                valueType: {
                    '@type': 'valueType',
                    value: '',
                    type: ''
                },
                valueTypes: []
            };
        }

        /**
         * Go through condition expression and apply changes to each node based on uuid
         *
         * @param {any} exp : expression where changes will be applied
         * @param {any} changes : list of new nodes that contain new changes
         * @returns changes expression
         */
        function applyChanges(exp, changes) {
            var expression = angular.copy(exp);
            var element = changes.filter(function (item) {
                return item.uuid === expression.uuid;
            })[0];
            if (element) {
                expression = element;
                changes.splice(changes.indexOf(element), 1);
                return expression;
            }
            if (expression.firstExpression) {
                expression.firstExpression = applyChanges(expression.firstExpression, changes);
            }
            if (expression.secondExpression) {
                expression.secondExpression = applyChanges(expression.secondExpression, changes);
            }
            return expression;

        }



        /**
         *
         * Iterate though condition expression and apply visitors
         *
         * @param {any} expression root expression
         * @param {any} visitors list of functions to be called on each node
         */
        function depthFirstVisit(expression, visitors) {
            var stack = [expression];
            var current, previous, previousLeaf, parent;

            while (stack.length > 0) {

                current = stack.pop();
                if (current.secondExpression) {
                    current.secondExpression.parent = current;
                    stack.push(current.secondExpression);
                }
                if (current.firstExpression) {
                    current.firstExpression.parent = current;
                    stack.push(current.firstExpression);
                }

                parent = current.parent;
                delete current.parent;
                //process node
                if (visitors instanceof Array) {
                    visitors.forEach(function (visitor) {

                        visitor(current, previous, previousLeaf, parent);
                    });
                } else if (visitors instanceof Function) {
                    visitors(current, previous, previousLeaf, parent);
                }


                previous = current;

                /*
                    it is leaf if it does not have this elements
                */
                if (!current.firstExpression && !current.secondExpression) {
                    previousLeaf = current;
                }

            }

        }

        function registerComposition() {
            var unsubscribe = $scope.$on('flairbiApp:composeCondition', function (event, condition) {

                var changes = [];
                depthFirstVisit(vm.conditionExpression, function (current, previous, previousLeaf, parent) {

                    if (current.uuid === condition.uuid) {
                        var newCurrent = {
                            firstExpression: angular.copy(current),
                            '@type': 'Or',
                            secondExpression: {
                                uuid: CryptoService.UUIDv4(),
                                '@type': 'Compare',
                                comparatorType: 'EQ',
                                valueType: {
                                    '@type': 'valueType',
                                    value: '',
                                    type: ''
                                },
                                valueTypes: []
                            }
                        };
                        newCurrent.uuid = current.uuid;
                        newCurrent.firstExpression.uuid = CryptoService.UUIDv4();

                        changes.push(newCurrent);
                    }
                });

                vm.conditionExpression = applyChanges(vm.conditionExpression, changes);
            });

            $scope.$on('$destroy', unsubscribe);
        }

        function registerDecomposition() {
            var unsubscribe = $scope.$on('flairbiApp:decomposeCondition', function (event, condition) {
                if (vm.conditionExpression.uuid === condition.uuid) {
                    vm.conditionExpression = null;
                } else {
                    var changes = [];
                    depthFirstVisit(vm.conditionExpression, function (current, previous, previousLeaf, parent) {
                        if (current.uuid === condition.uuid) {
                            var newParent;
                            if (parent.firstExpression && parent.firstExpression.uuid === condition.uuid) {
                                newParent = angular.copy(parent.secondExpression);
                            } else if (parent.secondExpression && parent.secondExpression.uuid === condition.uuid) {
                                newParent = angular.copy(parent.firstExpression);
                            }
                            if (newParent) {
                                newParent.uuid = parent.uuid;
                                changes.push(newParent);
                            }
                        }
                    });
                    vm.conditionExpression = applyChanges(vm.conditionExpression, changes);
                }
            });

            $scope.$on('$destroy', unsubscribe);
        }

        function clear() {
            $uibModalInstance.dismiss("cancel");
        }

        function validate() {
            vm.isValidated = false;
            vm.query = null;
            vm.queryValidationError = null;

            var deferred = $q.defer();

            Visualmetadata.validate({}, {
                datasourceId: datasource.id,
                queryDTO: visualMetaData.getQueryParameters(filterParametersService,
                    filterParametersService.getConditionExpression()),
                visualMetadataId: visualMetaData.id,
                conditionExpression: vm.conditionExpression
            }).$promise
                .then(function (data) {
                    vm.isValidated = data.validationResultType === 'SUCCESS';
                    vm.query = data.rawQuery;
                    var validationError = null;
                    if (!vm.isValidated) {
                        validationError = QueryValidationService.getQueryValidationError(data.error);
                    }
                    if (validationError) {
                        vm.queryValidationError = $translate.instant(validationError.msgKey, validationError.params);
                    }
                    if (vm.isValidated) {
                        deferred.resolve();
                    } else {
                        deferred.reject();
                    }
                })
                .catch(function (error) {
                    vm.queryValidationError = $translate.instant('error.query.failed');
                    deferred.reject(error);
                });

            return deferred.promise;
        }

        function save(){
            vm.isSaving = true;
            validate()
                .then(function () {
                    VisualDispatchService.saveDataConstraints(vm.conditionExpression);
                    $rootScope.$broadcast('flairbiApp:saveDataConstraints');
                    clear();
                })
                .catch(function () {
                    vm.isSaving = false;
                });
        }

    }
})();

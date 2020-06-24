(function () {
    "use strict";

    angular
        .module('flairbiApp')
        .component('datasourceConstraintDialogComponent', {
            templateUrl: 'app/entities/datasource-constraint/datasource-constraint-dialog.component.html',
            controller: DatasourceConstraintDialogController,
            controllerAs: 'vm',
            bindings: {
                resolve: '<',
                close: '&',
                dismiss: '&'
            }
        });

    DatasourceConstraintDialogController.$inject = [
        "$timeout",
        "$scope",
        "DatasourceConstraint",
        "Datasources",
        "Features",
        "$translate",
        "$rootScope",
        "ComponentDataService",
        "proxyGrpcService",
        "AuthServerProvider",
        "stompClientService",
        "QueryValidationService",
        "$stateParams",
        "$state",
        "VisualDispatchService"
    ];

    function DatasourceConstraintDialogController(
        $timeout,
        $scope,
        DatasourceConstraint,
        Datasources,
        Features,
        $translate,
        $rootScope,
        ComponentDataService,
        proxyGrpcService,
        AuthServerProvider,
        stompClientService,
        QueryValidationService,
        $stateParams,
        $state,
        VisualDispatchService
    ) {
        var vm = this;


        vm.clear = clear;
        vm.save = save;
        vm.constraintTypes = ["Inclusion", "Exclusion"];
        vm.datasourceChange = datasourceChange;
        vm.addConstraint = addConstraint;
        vm.removeConstraint = removeConstraint;
        vm.features = [];
        vm.search = search;
        vm.load = load;
        vm.featureChange = featureChange;
        vm.added = added;
        vm.removed = removed;
        vm.validate = validate;
        vm.displayTextboxForValues = displayTextboxForValues;
        vm.addToFilter = addToFilter;
        vm.$onInit = function () {
            activate();
            $timeout(function () {
                angular.element(".form-group:eq(1)>input").focus();
            });
        }



        function activate() {
            connectWebSocket();
            if($stateParams.id){
                getDatasourceConstraint();
            }else{
                vm.datasourceConstraint = {constraintDefinition:{featureConstraints: [{}]},id: null}
            }
        }

        function addConstraint() {
            vm.datasourceConstraint.constraintDefinition.featureConstraints.push(
                {
                    "@type": vm.constraintTypes[0]
                }
            );
        }

        function removeConstraint(constraint) {
            var index = vm.datasourceConstraint.constraintDefinition.featureConstraints.indexOf(
                constraint
            );
            if (index > -1) {
                vm.datasourceConstraint.constraintDefinition.featureConstraints.splice(
                    index,
                    1
                );
            }
        }

        function datasourceChange(id) {
            if (id) {
                Features.query(
                    {
                        datasource: id,
                        featureType: "DIMENSION"
                    },
                    function (result) {
                        vm.features = result;
                    },
                    function (_) { }
                );
            }
        }

        function clear() {
            vm.dismiss();
        }

        function save() {
            vm.isSaving = true;
            if (vm.datasourceConstraint.id !== null) {
                DatasourceConstraint.update(
                    vm.datasourceConstraint,
                    onUpdateSuccess,
                    onSaveError
                );
            } else {
                vm.datasourceConstraint.user = ComponentDataService.getUser();
                DatasourceConstraint.save(
                    vm.datasourceConstraint,
                    onSaveSuccess,
                    onSaveError
                );
            }
        }

        function onSaveSuccess(result) {
            onSave(result);
            var info = { text: $translate.instant('flairbiApp.datasourceConstraint.created', { param: result.id }), title: "Saved" }
            $rootScope.showSuccessToast(info);
            $state.go('^');
        }

        function onUpdateSuccess(result) {
            onSave(result);
            var info = { text: $translate.instant('flairbiApp.datasourceConstraint.updated', { param: result.id }), title: "Updated" }
            $rootScope.showSuccessToast(info);
        }

        function onSaveError() {
            vm.isSaving = false;
            $rootScope.showErrorSingleToast({
                text: $translate.instant('flairbiApp.datasourceConstraint.errorSaving')
            });
        }

        function onSave(result) {
            $scope.$emit("flairbiApp:datasourceConstraintUpdate", result);
            vm.close(result);
            vm.isSaving = false;
        }

        function search(e, searchedText) {
            e.preventDefault();
            if (searchedText) {
                Datasources.search({
                    page: 0,
                    size: 10,
                    sort: 'lastUpdated,desc',
                    name: searchedText
                }, function (data) {
                    vm.datasources = data;
                }, function () {
                    $rootScope.showErrorSingleToast({
                        text: $translate.instant('flairbiApp.datasources.error.datasources.all')
                    });
                });
            }
        }

        function featureChange(type,constraint){
            constraint.type=type;
            constraint.selected=new Array();
            constraint.values=new Array();
            constraint.isCommaSeparatedInput = false;
            vm.commaSeparatedToolTip = VisualDispatchService.setcommaSeparatedToolTip(constraint.isCommaSeparatedInput);
        }

        function load(q,constraint) {
            var vId = constraint.id;
            var query = {};
            query.fields = [{ name: constraint.featureName }];
            if (q) {
                query.conditionExpressions = [{
                    sourceType: 'FILTER',
                    conditionExpression: {
                        '@type': 'Like',
                        featureType: { featureName: constraint.featureName, type: constraint.featureName.type },
                        caseInsensitive: true,
                        value: q
                    }
                }];
            }
            query.distinct = true;
            query.limit = 20;
            proxyGrpcService.forwardCallV2(
                vm.datasourceConstraint.datasource.id, {
                queryDTO: query
            }
            );
        }
        function connectWebSocket() {
            stompClientService.connect(
                { token: AuthServerProvider.getToken() },
                function (frame) {
                    console.log('flair-bi controller connected web socket');
                    stompClientService.subscribe("/user/exchange/metaData", onExchangeMetadata);
                    stompClientService.subscribe("/user/exchange/metaDataError", onExchangeMetadataError);
                }
            );

            $scope.$on("$destroy", function (event) {
                stompClientService.disconnect();
            });
        }

        function onExchangeMetadataError(data) {
            var body = JSON.parse(data.body || '{}');
            if (body.description === "io exception") {
                var msg = $translate.instant('flairbiApp.visualmetadata.errorOnReceivingMataData') + " : " + body.cause.message;
                $rootScope.showErrorSingleToast({
                    text: msg
                });
            } else {
                var error = QueryValidationService.getQueryValidationError(body.description);
                $rootScope.showErrorSingleToast({
                    text: $translate.instant(error.msgKey, error.params)
                });
            }
        }

        function onExchangeMetadata(data) {
            var metaData = data.body === "" ? { data: [] } : JSON.parse(data.body);
            if (data.headers.request === "filters") {
                $rootScope.$broadcast(
                    "flairbiApp:filters-meta-Data",
                    metaData.data
                );
            }
        }

        function added(tag,constraint) {
            if(constraint.values){
                constraint.values.push(tag['text']);
            }else{
                constraint.values = new Array();
                constraint.values.push(tag['text']);        
            }
        }

        function removed(tag,constraint){
            var index = constraint.values.indexOf(tag['text']);
            if (index > -1) {
                constraint.values.splice(index, 1);
            }
        }

        function generateReductionCondition(){
            vm.query = '';
            angular.forEach(vm.datasourceConstraint.constraintDefinition.featureConstraints, function(value, key) {
              if(key==0){
                vm.query += 'WHERE ';
                vm.query += value.featureName;
                vm.query += value['@type']===vm.constraintTypes[0] ? ' IN ' : ' NOT IN ';
                vm.query += '(';
                vm.query += value.values.join(",");
                vm.query += ')';
              }else{
                vm.query += ' AND ';
                vm.query += value.featureName;
                vm.query += value['@type']===vm.constraintTypes[0] ? ' IN ' : ' NOT IN ';
                vm.query += '(';
                vm.query += value.values.join(",");
                vm.query += ')';
              }
            });
        }

        function validate(){
            generateReductionCondition();
        }

        function getDatasourceConstraint(){
            DatasourceConstraint.get({
                id: $stateParams.id
            },function(result){
                vm.datasourceConstraint=result;
                if (
                    vm.datasourceConstraint.constraintDefinition &&
                    vm.datasourceConstraint.constraintDefinition.featureConstraints
                ) {
                    vm.datasourceConstraint.constraintDefinition.featureConstraints.forEach(
                        function (item) {
                            if (item.values) {
                                item.isCommaSeparatedInput = false;
                                item.selected = item.values.map(function (item) {
                                    var newItem = {};
                                    newItem['text'] = item;
                                    return newItem;
                                });
                            }
                        }
                    );
                    datasourceChange(vm.datasourceConstraint.datasource.id);
                }
            });
        }
        function displayTextboxForValues(constraint) {
            constraint.isCommaSeparatedInput = !constraint.isCommaSeparatedInput;
            if(constraint.selected && constraint.selected.length>0){
                vm.commaSeparatedValues = constraint.selected.map(function(elem){
                    return elem.text;
                }).join(",");
            }
            vm.commaSeparatedToolTip = VisualDispatchService.setcommaSeparatedToolTip(constraint.isCommaSeparatedInput);
        }

        function addToFilter(constraint) {
            if (vm.commaSeparatedValues && vm.commaSeparatedValues.length > 0) {
                constraint.isCommaSeparatedInput = false;
                constraint.selected =[];
                constraint.values = [];
                var getList = vm.commaSeparatedValues.split(',');
                getList = getList.filter((item, i, ar) => ar.indexOf(item) === i);
                getList.forEach(element => {
                    added({ text: element },constraint);
                    constraint.selected.push({ text: element });
                });
                vm.commaSeparatedToolTip = VisualDispatchService.setcommaSeparatedToolTip(constraint.isCommaSeparatedInput);
            }
        }
    }
})();

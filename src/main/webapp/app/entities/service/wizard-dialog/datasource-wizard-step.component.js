(function() {
    "use strict";

    angular.module("flairbiApp").component("datasourceWizardStep", {
        templateUrl:
            "app/entities/service/wizard-dialog/datasource-wizard-step.component.html",
        controller: DatasourceWizardStepController,
        controllerAs: "vm",
        bindings: {
            datasources: "=",
            connection: "=",
            connectionType: "=",
            selectedConnection: "=",
            features: "=",
            connectionParameters: "=",
        }
    });

    DatasourceWizardStepController.$inject = ["$scope","$timeout", "Datasources","$rootScope","$translate","Query","Connections","WizardHandler","$q","proxyGrpcService","AuthServerProvider","stompClientService","AlertService","QueryValidationService", "$uibModal"];
    function DatasourceWizardStepController($scope,$timeout,Datasources,$rootScope,$translate,Query,Connections,WizardHandler,$q,proxyGrpcService,AuthServerProvider,stompClientService,AlertService,QueryValidationService, $uibModal) {
        var vm = this;
        var delayedSearch;

        vm.datePickerOpenStatus = {};
        vm.openCalendar = openCalendar;
        vm.setDataSource = setDataSource;
        vm.onSearchKeyUp = onSearchKeyUp;
        vm.search=search;
        vm.tables=[];
        vm.datasources.name=null;
        vm.createDataSource=createDataSource;
        vm.features=[];
        vm.resetTest=resetTest;
        vm.showData=showData;

        activate();

        ////////////////

        vm.$onInit = function() {};
        vm.$onChanges = function(changesObj) {};
        vm.$onDestroy = function() {};

        function activate() {
            connectWebSocket();
            $scope.$on('$destroy', function () {
                clearDelayedSearch();
            })
        }

        function openCalendar(date) {
            vm.datePickerOpenStatus[date] = true;
        }
        function setDataSource(name){
            vm.datasources.name=name;
        }

        function clearDelayedSearch() {
            if (delayedSearch) {
                $timeout.cancel(delayedSearch);
            }
        }

        function onSearchKeyUp(name) {
            clearDelayedSearch();
            delayedSearch = $timeout(function () {
                search(name);
            }, 1000);
        }

        function search(searchedText) {
            if (searchedText) {
                var body = {
                    searchTerm: searchedText
                };
                if (vm.selectedConnection) {
                    body.connectionLinkId = vm.connection.linkId;
                } else {
                    body.connection = prepareConnection();
                }

                Datasources.listTables(
                    body,
                    function (data) {
                        vm.tables = data.tableNames;
                        if (data.tableNames.length === 0) {
                            setInputText(searchedText);
                        }
                    },
                    function () {
                        $rootScope.showErrorSingleToast({
                            text: $translate.instant('flairbiApp.datasources.error.datasources.all')
                        });
                    });
            }
        }

        function prepareConnection() {
            var conn = vm.connection;
            conn.connectionType = vm.connectionType;
            conn.connectionTypeId = vm.connectionType.id;
            conn.connectionParameters = vm.connectionParameters;
            conn.details["@type"] =
                vm.connectionType.connectionPropertiesSchema.connectionDetailsType;
            return conn;
        }

        function setInputText(searchedText){
            vm.datasources.name=searchedText;
            vm.datasource=vm.datasources.name;
        }

        function createDataSource() {
            saveConnection(
                function(conn) {
                    saveDatasource(conn.linkId);
                },
                function() {}
            );
        }

        function saveConnection(cb, err) {
            if (!vm.selectedConnection) {
                var connection = prepareConnection();
                return Connections.save(
                    connection,
                    function(result) {
                        vm.connection = result;
                        return cb(result);
                    },
                    function(error) {
                        return err(error);
                    }
                );
            } else {
                return cb(vm.connection);
            }
        }

        function sendSaveDatasource(customAction) {
            Datasources.save({datasource: vm.datasources, action: customAction})
                .$promise
                .then(function (resultData) {
                    if (resultData.error === 'SAME_NAME_EXISTS') {
                        return showDuplicateDatasourceModal(vm.datasources);
                    } else {
                        $rootScope.$broadcast('flairbiApp:data-connection:next-page');
                        vm.datasources["datasourceId"] = resultData.id;
                        return fetchFeatures(resultData.id)
                    }
                })
                .then(function () {
                    WizardHandler.wizard().next();
                })
                .catch(function (error) {
                    rollbackConnection();
                    if (error.data.message == 'uniqueError') {
                        $rootScope.showErrorSingleToast({
                            text: $translate.instant('flairbiApp.datasources.' + error.data.message)
                        });
                    }
                });
        }

        function saveDatasource(connectionLinkId, customAction) {
            vm.datasources.connectionName = connectionLinkId;
            sendSaveDatasource(customAction);
        }

        function showDuplicateDatasourceModal(datasource) {
            $uibModal
                .open({
                    templateUrl:
                        "app/entities/datasources/datasources-duplicate-dialog.html",
                    controller: "DatasourcesDuplicateDialogController",
                    controllerAs: "vm",
                    backdrop: "static",
                    size: "lg",
                    resolve: {
                        datasource: datasource
                    }
                })
                .result.then(
                function (result) {
                    if (result.result === 'edit') {
                        editDatasource();
                    } else if (result.result === 'delete') {
                        deleteDatasource();
                    }
                }
            );

            return $q.defer().promise;
        }

        function editDatasource() {
            sendSaveDatasource('EDIT');
        }

        function deleteDatasource() {
            sendSaveDatasource('DELETE');
        }

        function fetchFeatures(datasourceId) {
            var deferred = $q.defer();

            vm.queryDTO = {
                metaRetrieved: true,
                limit: 1,
                distinct: false
            };

            Connections.fetchFeatures(
                { datasourceId: datasourceId },
                vm.queryDTO,
                function (data) {
                    onFeaturesFetched(data);
                    deferred.resolve();
                },
                function () {
                    deferred.reject();
                }
            );

            return deferred.promise;
        }

        function onFeaturesFetched(result) {
            var metaData = result.metadata;
            var data = result.data[0];
            for (var prop in metaData) {
                vm.features.push({
                    name: prop,
                    featureType:
                        typeof data[prop] === "string" ||
                        data[prop] instanceof String
                            ? "DIMENSION"
                            : "MEASURE",
                    type: metaData[prop],
                    isSelected: true
                });
            }
        }

        function rollbackConnection() {
            if (!vm.selectedConnection) {
                Connections.delete(
                    { id: vm.connection.id },
                    function() {},
                    function() {}
                );
            }
        }

        function resetTest() {
            $rootScope.$broadcast('flairbiApp:data-connection:previous-page');
        }

        function showData(){
            var body = {};
            if (vm.selectedConnection) {
                body.connectionLinkId = vm.connection.linkId;
            } else {
                body.connection = prepareConnection();
            }

            var query = {};
            query.fields = [];
            query.distinct = true;
            query.limit = 10;
            query.source = vm.datasources.name;
            body.query = query;
            body.sourceId = vm.datasources.id;
            proxyGrpcService.queryAll(body);
        }

        function connectWebSocket() {
            stompClientService.connect(
                { token: AuthServerProvider.getToken() },
                function() {
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
            var error = QueryValidationService.getQueryValidationError(body.description);
            if (error) {
                AlertService.error(error.msgKey, error.params);
            }
        }

        function onExchangeMetadata(data) {
            var metaData = JSON.parse(data.body);
            toggleSampleData(metaData.data.length);
            createHeader(metaData.data[0]);
            addDataInTable(metaData.data);

        }

        function createHeader(cols){
            $("#datasource-table-col").empty();
            var row=$("#datasource-table-col");
            angular.forEach(cols, function(value, key){
                 row.append("<th>"+key+"</th>");
            });
        }

        function addDataInTable(data){
            $("#datasource-table > tbody").empty();
            var tBody=$("#datasource-table > tbody");
            angular.forEach(data, function(row, index){
                var tr=$("<tr></tr>");
                angular.forEach(row, function(value, key){
                     tr.append("<td>"+value+"</td>");
                });
                tBody.append(tr);
            });
        }

        function toggleSampleData(size){
           if(size>0){
                angular.element("#sample-data-holder").show();
           }else{
                angular.element("#sample-data-holder").hide();
                var sm = [];
                sm.title=$translate.instant('flairbiApp.datasources.noDataFound')
                $rootScope.showWarningToast(sm);
           }
        }
    }
})();

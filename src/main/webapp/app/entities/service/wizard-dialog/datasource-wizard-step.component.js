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

    DatasourceWizardStepController.$inject = ["$scope","Datasources","$rootScope","$translate","Query","Connections","WizardHandler","$q","proxyGrpcService","AuthServerProvider","stompClientService","AlertService","QueryValidationService"];
    function DatasourceWizardStepController($scope,Datasources,$rootScope,$translate,Query,Connections,WizardHandler,$q,proxyGrpcService,AuthServerProvider,stompClientService,AlertService,QueryValidationService) {
        var vm = this;

        vm.datePickerOpenStatus = {};
        vm.openCalendar = openCalendar;
        vm.setDataSource=setDataSource;
        vm.search=search;
        vm.tables=[];
        vm.testConnection=testConnection;
        vm.datasources.name=null;
        vm.createDataSource=createDataSource;
        vm.features=[];
        vm.resetTest=resetTest;
        vm.showData=showData;
        vm.sampleData=[];
        connectWebSocket();

        ////////////////

        vm.$onInit = function() {};
        vm.$onChanges = function(changesObj) {};
        vm.$onDestroy = function() {};

        function openCalendar(date) {
            vm.datePickerOpenStatus[date] = true;
        }
        function setDataSource(name){
            vm.datasources.name=name;
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

        function testConnection() {
            vm.testResult = "loading";
            var body = {
                datasourceName: vm.datasources.name
            };
            if (vm.selectedConnection) {
                body.connectionLinkId = vm.connection.linkId;
            } else {
                body.connection = prepareConnection();
            }

            Query.testConnection(
                body,
                function(data) {
                    if (data.success) {
                        vm.testResult = "success";
                    } else {
                        vm.testResult = "error";
                    }
                },
                function() {
                    vm.testResult = "error";
                }
            );
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

        function saveDatasource(connectionLinkId) {
            vm.datasources.connectionName = connectionLinkId;

            Datasources.save(vm.datasources)
                .$promise
                .then(function (resultData) {
                    $rootScope.$broadcast('flairbiApp:data-connection:next-page');
                    vm.datasources["datasourceId"] = resultData.id;
                    return fetchFeatures(resultData.id)
                })
                .then(function () {
                    WizardHandler.wizard().next();
                })
                .catch(function (err) {
                    rollbackConnection();
                });
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
            vm.testResult = null;
            $rootScope.$broadcast('flairbiApp:data-connection:previous-page');
        }

        function showData(){
            var query = {};
            query.fields = [];
            query.distinct = true;
            query.limit = 10;
            query.source = vm.datasources.name;
            proxyGrpcService.sampleDataCall(vm.connection.linkId,query);
        }

        function connectWebSocket() {
            stompClientService.connect(
                { token: AuthServerProvider.getToken() },
                function(frame) {
                    console.log('controller connected web socket');
                    stompClientService.subscribe("/user/exchange/sampleMetaData", onExchangeMetadata.bind(this));
                    stompClientService.subscribe("/user/exchange/metaDataError", onExchangeMetadataError.bind(this));
                }
            );
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
    }
})();

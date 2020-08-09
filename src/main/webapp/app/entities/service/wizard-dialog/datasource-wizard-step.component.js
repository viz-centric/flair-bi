(function () {
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

    DatasourceWizardStepController.$inject = ["$scope", "$timeout", "Datasources", "$rootScope", "$translate", "Query", "Connections", "WizardHandler", "$q", "AlertService", "QueryValidationService", "$uibModal", 'Toastr','SqlFormatter'];
    function DatasourceWizardStepController($scope, $timeout, Datasources, $rootScope, $translate, Query, Connections, WizardHandler, $q, AlertService, QueryValidationService, $uibModal, Toastr,SqlFormatter) {
        var vm = this;
        var delayedSearch;

        vm.onSubmitDisabled = onSubmitDisabled;
        vm.tabIndex = 0;
        vm.sql = null;
        vm.datePickerOpenStatus = {};
        vm.openCalendar = openCalendar;
        vm.onSearchKeyUp = onSearchKeyUp;
        vm.onSelectedTableChanged = onSelectedTableChanged;
        vm.search = search;
        vm.tables = [];
        vm.displayTables = [];
        vm.createDataSource = createDataSource;
        vm.isShowDataEnabled = isShowDataEnabled;
        vm.getDatasourceNames = getDatasourceNames;
        vm.features = [];
        vm.resetTest = resetTest;
        vm.showData = showData;
        vm.onTabClick = onTabClick;
        vm.data = [];
        vm.formatSql = formatSql;
        vm.sqlQuerylength = 10;



        ////////////////

        vm.$onInit = function () {
            activate();
        };
        vm.$onChanges = function (_) { };
        vm.$onDestroy = function () { };

        function activate() {
            $scope.$on('$destroy', function () {
                clearDelayedSearch();
            })
        }

        function isShowDataEnabled() {
            if (vm.loading) {
                return true;
            }
            if (vm.tabIndex === 0) {
                return !vm.selectedTable;
            } else if (vm.tabIndex === 1) {
                return !vm.sql || !vm.selectedTable;
            }
            return false;
        }

        function onTabClick(tabIndex) {
            vm.tabIndex = tabIndex;
            vm.selectedTable = null;
            vm.sql = null;
            vm.tables = [];
            vm.displayTables = [];
        }

        function onSelectedTableChanged(table) {
            vm.selectedTable = table;
            vm.sql = table.sql || vm.sql;
            if(vm.tabIndex==1){
                formatSql(vm.sql);
            }
        }

        function onSubmitDisabled() {
            return isShowDataEnabled();
        }

        function openCalendar(date) {
            vm.datePickerOpenStatus[date] = true;
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

        function getDatasourceNames(search) {
            if (search) {
                const existingList = vm.displayTables
                    .filter(item => !vm.tables.includes(item));
                existingList
                    .forEach(item => item.name = search);
                if (existingList.length === 0) {
                    vm.displayTables.unshift({name: search, sql: null, temp: true});
                }
            }
            return vm.displayTables;
        }

        function search(searchedText) {
            if (searchedText) {
                var body = {
                    searchTerm: searchedText,
                    filter: vm.tabIndex === 0 ? 'TABLE' : 'SQL'
                };
                if (vm.selectedConnection) {
                    body.connectionLinkId = vm.connection.linkId;
                } else {
                    body.connection = prepareConnection();
                }

                Datasources.listTables(
                    body,
                    function (data) {
                        vm.tables = data.tables;
                        vm.displayTables = vm.tables.concat();
                    },
                    function () {
                        Toastr.error({
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

        function createDataSource() {
            saveConnection(
                function (conn) {
                    saveDatasource(conn.linkId);
                },
                function () { }
            );
        }

        function saveConnection(cb, err) {
            var connection = prepareConnection();
            const success = function (result) {
                vm.connection = result;
                return cb(result);
            };
            const failure = function (error) {
                return err(error);
            };
            if (!vm.selectedConnection) {
                return Connections.save(
                    connection,
                    success,
                    failure
                );
            } else {
                return Connections.update(
                    connection,
                    success,
                    failure
                );
            }
        }

        function sendSaveDatasource(customAction) {
            Datasources.save({ datasource: vm.datasources, action: customAction })
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
                        Toastr.error({
                            text: $translate.instant('flairbiApp.datasources.' + error.data.message)
                        });
                    }
                });
        }

        function saveDatasource(connectionLinkId, customAction) {
            vm.datasources.sql = vm.sql;
            vm.datasources.name = vm.selectedTable.name;
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
                    function () { },
                    function () { }
                );
            }
        }

        function resetTest() {
            $rootScope.$broadcast('flairbiApp:data-connection:previous-page');
        }

        function showData() {
            vm.loading = true;
            var body = {
                query: {
                    fields: [],
                    distinct: true,
                    limit: 10,
                    source: vm.selectedTable.name,
                },
                sql: vm.sql,
                sourceId: vm.datasources.id
            };
            if (vm.selectedConnection) {
                body.connectionLinkId = vm.connection.linkId;
            } else {
                body.connection = prepareConnection();
            }
            Query.executeQuery(body).$promise.then(function (data) {
                vm.data = data.data;
                if (vm.data.length <= 0) {
                    Toastr.warning({
                        title: $translate.instant('flairbiApp.datasources.noDataFound')
                    });
                }
                vm.loading = false;
            }, function (_) {
                Toastr.error({
                    title: $translate.instant('flairbiApp.datasources.dataError')
                });
                vm.loading = false;
            });
        }

        function formatSql(sqlQuery){
            vm.lines = [];
            var result = SqlFormatter.formatSql(sqlQuery);
            vm.lines = result.split('\n');
            vm.sqlQuerylength = vm.lines.length+1;
            vm.sql = result;
        }

    }
})();

import * as angular from 'angular';
import testConnectionWizardStepComponentHtml from './test-connection-wizard-step.component.html';

"use strict";

angular.module("flairbiApp").component("testConnectionWizardStep", {
    template: testConnectionWizardStepComponentHtml,
    controller: TestConnectionWizardStepController,
    controllerAs: "vm",
    bindings: {
        connection: "=",
        connectionType: "=",
        selectedConnection: "=",
        datasources: "=",
        features: "="
    }
});

TestConnectionWizardStepController.$inject = [
    "Connections",
    "Datasources",
    "WizardHandler",
    "Query",
    "$q"
];

function TestConnectionWizardStepController(
    Connections,
    Datasources,
    WizardHandler,
    Query,
    $q
) {
    var vm = this;

    vm.testConnection = testConnection;
    vm.resetTest = resetTest;
    vm.createDataSource = createDataSource;
    vm.features = [];
    vm.updatedFeatures = [];

    ////////////////
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
            function (data) {
                if (data.success) {
                    vm.testResult = "success";
                } else {
                    vm.testResult = "error";
                }
            },
            function () {
                vm.testResult = "error";
            }
        );
    }

    function resetTest() {
        vm.testResult = null;
    }

    function prepareConnection() {
        var conn = vm.connection;
        conn.connectionType = vm.connectionType;
        conn.connectionTypeId = vm.connectionType.id;
        conn.details["@type"] =
            vm.connectionType.connectionPropertiesSchema.connectionDetailsType;
        return conn;
    }

    function saveConnection(cb, err) {
        if (!vm.selectedConnection) {
            var connection = prepareConnection();
            return Connections.save(
                connection,
                function (result) {
                    vm.connection = result;
                    return cb(result);
                },
                function (error) {
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
            {datasourceId: datasourceId},
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
                {id: vm.connection.id},
                function () {
                },
                function () {
                }
            );
        }
    }

    function createDataSource() {
        saveConnection(
            function (conn) {
                saveDatasource(conn.linkId);
            },
            function () {
            }
        );
    }
}

(function() {
    "use strict";

    angular.module("flairbiApp").controller("DataExploration", DataExploration);

    DataExploration.$inject = [
        "$scope",
        "$state",
        "Datasources",
        "$rootScope",
        "ExecutorFactory",
        "Explorer",
        "$timeout"
    ];

    function DataExploration(
        $scope,
        $state,
        Datasources,
        $rootScope,
        ExecutorFactory,
        Explorer,
        $timeout
    ) {
        var vm = this;

        vm.datasources = [];

        var editor;
        $scope.dataExploration = [];
        $scope.dataExploration.hasData = false;
        $scope.dataExploration.id = "d";
        $scope.dataExploration.selectedAlg = "";
        $scope.dataExploration.SQLquery = "";
        $scope.algorithums = [
            { id: 0, name: "Linear Regression" },
            { id: 1, name: "Logistic Regression" },
            { id: 2, name: "K-Means" },
            { id: 3, name: "SVM" },
            { id: 4, name: "Random Forest" },
            { id: 5, name: "SVD" },
            { id: 6, name: "Decision Tree" },
            { id: 7, name: "Naive Bayes" },
            { id: 8, name: "Artificial Nural Networks" },
            { id: 9, name: "More will be added..." }
        ];

        $timeout(function() {
            editor = CodeMirror.fromTextArea(document.getElementById("code"), {
                lineNumbers: true,
                styleActiveLine: true,
                matchBrackets: true,
                theme: "neat",
                mode: "text/x-mariadb",
                setSize: "100%",
                width: "100%"
            });

            $(".flip").flip({
                trigger: "manual"
            });
        }, 10);

        loadAll();

        $scope.flipper = function(id) {
            if ($scope.dataExploration.hasData) {
                $(".flip").flip(id == 1);
            } else {
                var sm = [];
                sm.title = "No data available!";
                $rootScope.showWarningToast(sm);
            }
        };

        function loadAll() {
            Datasources.query(function(result) {
                vm.datasources = result;
                vm.searchQuery = null;
            });
        }

        $rootScope.$on("getdata", function(event, result) {
            $scope.dataExploration.SQLquery = editor
                .getValue()
                .trim()
                .replace(";", "");
            $scope.dataExploration.SQLqueryMin =
                "SELECT * FROM ( " +
                $scope.dataExploration.SQLquery +
                " ) limit 1000";
            $scope.dataExploration.SQLqueryCount =
                "SELECT count(*) as NOOFRECORDS FROM ( " +
                $scope.dataExploration.SQLquery +
                " );";
            if ($rootScope.dataExplorerSource) {
                if ($rootScope.dataExplorerSource != null) {
                    if (editor.getValue()) {
                        if (
                            editor
                                .getValue()
                                .toUpperCase()
                                .trim() != ""
                        ) {
                            $scope.getCount(
                                $rootScope.dataExplorerSource,
                                $scope.dataExploration.SQLqueryCount
                            );
                        }
                    } else {
                        var sm = [];
                        sm.title = "No Query Written!";
                        $rootScope.showWarningToast(sm);
                    }
                }
            } else {
                var sm = [];
                sm.title = "Select a Datasource!";
                $rootScope.showWarningToast(sm);
            }
        });

        $scope.trainSetChange = function() {
            $scope.dataExploration.testsetSize =
                $scope.dataExploration.datasetSize -
                $scope.dataExploration.trainingsetSize;
        };

        $scope.getData = function(source, sqlMin) {
            if (editor.getValue()) {
                ExecutorFactory.executor(
                    sqlMin,
                    source.toString(),
                    "{}",
                    false,
                    function(callback) {
                        var sm = [];
                        sm.title = "Query ok!";
                        $rootScope.showSuccessToast(sm);
                        $scope.dataExploration.data = callback;
                        $scope.dataExploration.hasData = false;
                        if (callback.length > 0) {
                            $scope.dataExploration.hasData = true;
                            $scope.displayData();
                        }
                    },
                    function(error) {
                        var sm = [];
                        sm.title = "Query failed!";
                        sm.text = [];
                        sm.text.push("Status : " + error.status.toString());
                        sm.text.push("Description : " + error.statusText);
                        $rootScope.showErrorToast(sm);
                    }
                );
            }
        };

        $scope.getCount = function(source, sqlCount) {
            if (editor.getValue()) {
                ExecutorFactory.executor(
                    sqlCount,
                    source.toString(),
                    "{}",
                    false,
                    function(callback) {
                        if (callback.length > 0) {
                            $scope.dataExploration.hasData = true;
                            $scope.dataExploration.datasetSize =
                                callback[0]["NOOFRECORDS"];
                            $scope.dataExploration.trainingsetSize = Math.ceil(
                                $scope.dataExploration.datasetSize * 0.8
                            );
                            $scope.dataExploration.testsetSize =
                                $scope.dataExploration.datasetSize -
                                $scope.dataExploration.trainingsetSize;
                            if (callback[0]["NOOFRECORDS"] < 1) {
                                $scope.dataExploration.hasData = false;
                                $scope.$apply();
                            }
                        } else {
                            $scope.dataExploration.hasData = false;
                            $scope.$apply();
                        }
                        $scope.getData(
                            $rootScope.dataExplorerSource,
                            $scope.dataExploration.SQLqueryMin
                        );
                    },
                    function(error) {
                        var sm = [];
                        sm.title = "Query failed!";
                        sm.text = [];
                        sm.text.push("Status : " + error.status.toString());
                        sm.text.push("Description : " + error.statusText);
                        $rootScope.showErrorToast(sm);
                    }
                );
            }
        };

        $scope.flairml = function() {
            if (editor.getValue()) {
                ExecutorFactory.flairml(
                    $scope.dataExploration.SQLqueryCount,
                    $rootScope.dataExplorerSource.toString(),
                    function(callback) {},
                    function(error) {
                        var sm = [];
                        sm.title = "Query failed in ML!";
                        sm.text = [];
                        sm.text.push("Status : " + error.status.toString());
                        sm.text.push("Description : " + error.statusText);
                        $rootScope.showErrorToast(sm);
                    }
                );
            }
        };

        $scope.displayData = function() {
            $scope.columns = [];
            $scope.data_display = [];
            $scope.dataRow = [];
            $scope.columns.push({ id: 0, name: "#" });
            if ($scope.dataExploration.data) {
                if ($scope.dataExploration.data.length > 0) {
                    var row = $scope.dataExploration.data[0];
                    var cnt = 0;
                    for (var f in row) {
                        cnt += 1;
                        $scope.columns.push({ id: 1, name: f });
                    }
                    for (
                        var a = 0;
                        a < $scope.dataExploration.data.length;
                        a++
                    ) {
                        $scope.dataExploration.data[a].id = a + 1;
                        $scope.dataRow = [];
                        for (var c = 0; c < $scope.columns.length; c++) {
                            c > 0
                                ? $scope.dataRow.push(
                                      $scope.dataExploration.data[a][
                                          $scope.columns[c]["name"]
                                      ]
                                  )
                                : $scope.dataRow.push(
                                      $scope.dataExploration.data[a].id
                                  );
                        }
                        $scope.data_display.push($scope.dataRow);
                        $scope.dataRow = [];
                    }
                    $scope.$apply();
                } else {
                    $scope.$apply();
                }
            } else {
                $scope.$apply();
            }
        };
    }
})();

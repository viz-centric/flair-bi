(function() {
    "use strict";

    angular
        .module("flairbiApp")
        .controller("HierModalInstanceCtrl", HierModalInstanceCtrl);

    HierModalInstanceCtrl.$inject = [
        "$scope",
        "$uibModalInstance",
        "modalInfo",
        "$rootScope",
        "$http",
        "ExecutorFactory",
        "Visualproperties",
        "Visualmetadata",
        "Drilldown"
    ];
    function HierModalInstanceCtrl(
        $scope,
        $uibModalInstance,
        modalInfo,
        $rootScope,
        $http,
        ExecutorFactory,
        Visualproperties,
        Visualmetadata,
        Drilldown
    ) {
        var initial = 0;
        var editor;
        $scope.showEditProperties = false;
        $scope.currentHierarchy = [];
        $scope.hierarchy = {};
        $scope.hierarchy.name = modalInfo.hierarchy.name;
        $scope.innerRecord = {};
        $scope.editProperty = null;
        var dimensions = [];
        var dimBuild = {};
        var toUpper = function(x) {
            dimensions.push(x.name.toUpperCase());
            dimBuild[x.name.toUpperCase()] = {};
            dimBuild[x.name.toUpperCase()].name = x.name.toUpperCase();
            dimBuild[x.name.toUpperCase()].id = x.id;
            dimBuild[x.name.toUpperCase()].source = x.dimensionDatasource.id;
        };
        modalInfo.dimensions.map(toUpper);
        //drillLoadAll();
        $scope.attachEdit = false;
        if (modalInfo.getcurrentHier.length > 0) {
            $scope.attachEdit = true;
            if ($rootScope.drilldowns.length > 0) {
                for (var b = 0; b < $rootScope.drilldowns.length; b++) {
                    if (
                        modalInfo.getcurrentHier.indexOf(
                            $rootScope.drilldowns[b].id.toString()
                        ) > -1
                    ) {
                        $scope.currentHierarchy.push($rootScope.drilldowns[b]);
                    }
                }
                if ($scope.currentHierarchy.length > 0) {
                    $scope.hierarchy = {};
                    $scope.hierarchy.name = $scope.currentHierarchy[0]["name"];
                }
            }
        }

        $scope.showEditor = function() {
            $scope.updateValidator(1);
            if (initial == 0) {
                editor = CodeMirror.fromTextArea(
                    document.getElementById("code"),
                    {
                        lineNumbers: true,
                        styleActiveLine: true,
                        matchBrackets: true,
                        theme: "neat",
                        mode: "text/x-mariadb",
                        height: "400px"
                    }
                );
                initial = 1;
            }
        };

        function drillLoadAll() {
            Drilldown.query(function(result) {
                $scope.currentHierarchy = result;
                if (result.length > 0) {
                    $scope.hierarchy = {};
                    $scope.hierarchy.name = result[0]["name"];
                }
                vm.searchQuery = null;
            });
        }

        var vm = this;

        $scope.currentDimensions = modalInfo.dimensions;
        if ($scope.currentDimensions.length > 0) {
            $scope.currentSourceId =
                modalInfo.dimensions[0].dimensionDatasource.id;
        }

        $scope.treeIds = [];

        $scope.fieldOrder = "";

        $scope.updateValidator = function(id) {
            if (id == 2) {
                $("#nestable2").sortable({
                    stop: function(event, ui) {
                        var sortedIDs = $("#nestable2").sortable("toArray");
                        var sequenceNo = {};
                        for (var i = 0; i < sortedIDs.length; i++) {
                            sequenceNo[i] = isNaN(sortedIDs[i])
                                ? sortedIDs[i]
                                : Number(sortedIDs[i]);
                            isNaN(sortedIDs[i])
                                ? (sortedIDs[i] = sortedIDs[i])
                                : (sortedIDs[i] = Number(sortedIDs[i]));
                        }
                        $scope.fieldOrder = "";
                        for (var sq in sequenceNo) {
                            for (
                                var b = 0;
                                b < $scope.currentHierarchy.vProperties.length;
                                b++
                            ) {
                                if (
                                    $scope.currentHierarchy.vProperties[b].id ==
                                    sequenceNo[sq]
                                ) {
                                    $scope.fieldOrder +=
                                        $scope.currentHierarchy.vProperties[
                                            b
                                        ].name;
                                    $scope.fieldOrder += ",";
                                }
                            }
                        }
                        $scope.fieldOrder = $scope.fieldOrder.substring(
                            0,
                            $scope.fieldOrder.length - 1
                        );
                        for (
                            var a = 0;
                            a < $scope.currentHierarchy.vProperties.length;
                            a++
                        ) {
                            $scope.currentHierarchy.vProperties[
                                a
                            ].sequenceNumber =
                                sortedIDs.indexOf(
                                    $scope.currentHierarchy.vProperties[a].id
                                ) + 1;
                        }
                        $scope.currentHierarchy.chartProperties.orderOfDisplay = $scope.fieldOrder.toUpperCase();
                    }
                });
                $scope.setInitialized = true;
            }
        };

        $scope.displayRow = function(fid, id) {
            if (
                $scope.editProperty != null &&
                $scope.editProperty != fid &&
                $scope.editProperty !== undefined
            ) {
                $scope.currentHierarchy[$scope.editProperty] =
                    $scope.innerRecord;
            }
            for (var a = 0; a < $scope.currentHierarchy.length; a++) {
                if ($scope.currentHierarchy[a]["id"] == fid) {
                    $scope.editProperty = a;
                    $scope.innerRecord = $scope.currentHierarchy[a];
                    $scope.showEditProperties = true;
                }
            }
        };

        $scope.addField = function(id) {
            var settings = {};
            var newField = {};

            id == 2
                ? (settings = {
                      selector: "ol.fields",
                      dclass: "warning",
                      iclass: "tag"
                  })
                : (settings = {
                      selector: "ol.fields",
                      dclass: "primary",
                      iclass: "percent"
                  });
            var randId = Math.round(Math.random() * 1000);
            if ($scope.treeIds.indexOf("R" + randId.toString()) < 0) {
                newField.id = "R" + randId.toString();
                newField.field = "Fieldname";
                //newField.field_id = ;
                //newField.source_id = ;
                newField.visualmetadata_id = "";
                newField.name = $scope.hierarchy.name;
                newField.sequence = $scope.currentHierarchy.length;
                $scope.currentHierarchy.push(newField);
                newField = {};
            }
        };

        $scope.notFound = false;
        $scope.checkDimension = function() {
            if (
                dimensions.indexOf(
                    $scope.innerRecord.field.trim().toUpperCase()
                ) < 0
            ) {
                $scope.notFound = true;
            } else {
                $scope.notFound = false;
            }
        };
        $scope.notFound2 = false;
        $scope.checkHierName = function() {
            if (
                dimensions.indexOf($scope.hierarchy.name.trim().toUpperCase()) <
                    0 &&
                $rootScope.hierNames.indexOf(
                    $scope.hierarchy.name.trim().toUpperCase()
                ) < 0
            ) {
                $scope.notFound2 = false;
            } else {
                $scope.notFound2 = true;
            }
        };

        $scope.ok = function() {
            savedLines = 0;
            for (var j = 0; j < $scope.currentHierarchy.length; j++) {
                $scope.currentHierarchy[j]["field"] = $scope.currentHierarchy[
                    j
                ]["field"].toUpperCase();
                if (
                    dimensions.indexOf($scope.currentHierarchy[j]["field"]) > -1
                ) {
                    $scope.currentHierarchy[j].field_id =
                        dimBuild[$scope.currentHierarchy[j]["field"]].id;
                    $scope.currentHierarchy[j].source_id =
                        dimBuild[$scope.currentHierarchy[j]["field"]].source;
                    $scope.currentHierarchy[j].name = $scope.currentHierarchy[
                        j
                    ].name.toUpperCase();
                    var tmpRow = $scope.currentHierarchy[j];
                    if (isNaN(tmpRow.id)) {
                        tmpRow.id = null;
                    }
                    saveDrill(tmpRow, j);
                } else {
                    var sm = [];
                    sm.title =
                        "Field name : " +
                        $scope.currentHierarchy[j]["field"] +
                        " does not exist";
                    sm.text = [];
                    $rootScope.showErrorToast(sm);
                }
            }
            $rootScope.$broadcast("updatehier", "chill");
            $uibModalInstance.close();
        };

        var savedLines = 0;
        function saveDrill(row, id) {
            vm.isSaving = true;
            if (row.id !== null) {
                Drilldown.update(
                    row,
                    function(callback) {
                        $scope.currentHierarchy[id] = callback;
                        savedLines += 1;
                        if (savedLines == $scope.currentHierarchy.length) {
                            savedLines = 0;
                            $rootScope.$broadcast("updatehier", "chill");
                        }
                    },
                    function(error) {
                        var sm = [];
                        sm.title = "Save failed";
                        sm.text = [];
                        sm.text.push(
                            "failed to fetch " +
                                $scope.currentRecord.Id +
                                " properties."
                        );
                        sm.text.push("Status : " + error.status.toString());
                        sm.text.push("Description : " + error.statusText);
                        $rootScope.showErrorToast(sm);
                    }
                );
            } else {
                Drilldown.save(
                    row,
                    function(callback) {
                        $scope.currentHierarchy[id] = callback;
                        savedLines += 1;
                        if (savedLines == $scope.currentHierarchy.length) {
                            savedLines = 0;
                            $rootScope.$broadcast("updatehier", "chill");
                        }
                    },
                    function(error) {
                        var sm = [];
                        sm.title = "Save failed";
                        sm.text = [];
                        sm.text.push(
                            "failed to fetch " +
                                $scope.currentRecord.Id +
                                " properties."
                        );
                        sm.text.push("Status : " + error.status.toString());
                        sm.text.push("Description : " + error.statusText);
                        $rootScope.showErrorToast(sm);
                    }
                );
            }
        }

        $scope.cancel = function() {
            $rootScope.$broadcast("updatehier", "chill");
            $uibModalInstance.dismiss("cancel");
        };

        $scope.updateValidator(2);

        $scope.deleteAllFields = function() {
            for (var x = 0; x < $scope.currentHierarchy.length; x++) {
                $scope.deleteField($scope.currentHierarchy[x].id);
            }
            $rootScope.$broadcast("updatehier", "chill");
            $scope.cancel();
        };

        $scope.deleteField = function(id) {
            for (var a = 0; a < $scope.currentHierarchy.length; a++) {
                if ($scope.currentHierarchy[a].id == id) {
                    var rElem = a;
                }
            }
            if (!isNaN(id)) {
                Drilldown.delete(
                    { id: id },
                    function(callback) {
                        $scope.currentHierarchy.splice(rElem, 1);
                        $scope.showEditProperties = false;
                        $scope.innerRecord = [];
                        $scope.editProperty = null;
                        savedLines += 1;
                        if (savedLines == $scope.currentHierarchy.length) {
                            savedLines = 0;
                            $rootScope.$broadcast("updatehier", "chill");
                        }
                    },
                    function(error) {
                        var sm = [];
                        sm.title = "Failed to Delete!";
                        sm.text = [];
                        sm.text.push("Status : " + error.status.toString());
                        sm.text.push("Description : " + error.statusText);
                        $rootScope.showErrorToast(sm);
                    }
                );
            } else {
                $scope.currentHierarchy.splice(rElem, 1);
                $scope.editProperty != null;
                $scope.showEditProperties = false;
                $scope.innerRecord = [];
                savedLines += 1;
                if (savedLines == $scope.currentHierarchy.length) {
                    savedLines = 0;
                    $rootScope.$broadcast("updatehier", "chill");
                }
            }
        };
    }
})();

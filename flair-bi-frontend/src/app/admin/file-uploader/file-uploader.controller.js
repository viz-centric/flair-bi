(function() {
    "use strict";

    angular.module("flairbiApp").controller("FileUploaderController", FileUploaderController);

    FileUploaderController.$inject = ["$scope", "Upload", 'fileSystemList', 'uploadFileService', 'DataUtils', 'csvParserService', '$uibModal','separatorList','$rootScope','$state','Principal','PERMISSIONS','FileUploaderStatus', 'ParseLinks', 'AlertService', 'paginationConstants', 'pagingParams','appPropertiesService'];

    function FileUploaderController($scope, Upload, fileSystemList, uploadFileService, DataUtils, csvParserService, $uibModal,separatorList,$rootScope,Principal,PERMISSIONS, $state, FileUploaderStatus, ParseLinks, AlertService, paginationConstants, pagingParams,appPropertiesService) {
        var vm = this;
        vm.fileSystemList = fileSystemList;
        vm.changeFileSystem = changeFileSystem;
        vm.clearFileSystem = clearFileSystem;
        vm.clearFile = clearFile;
        vm.uploadFile = uploadFile;
        vm.separatorList=[{"id":"|","name":"Pipe"}, {"id":",","name":"Comma"}, {"id":":","name":"Colon"}, {"id":";","name":"Semi-Colon"}];
        vm.clearSeparator=clearSeparator;
        vm.changeSeparator=changeSeparator;
        vm.resetFileDTO=resetFileDTO;
        vm.authorities = ['ROLE_USER','ROLE_ADMIN'];
        vm.fileError="";
        vm.loadPage = loadPage;
        vm.predicate = pagingParams.predicate;
        vm.reverse = pagingParams.ascending;
        vm.transition = transition;
        vm.itemsPerPage = paginationConstants.itemsPerPage;
        
        activate();

        ////////////////

        function activate() {
            resetFileDTO();
            loadAll();
            if($rootScope.appProperies.maxDataFileSize==="0"){
                getApplicationSettings();
            }
        }

        function resetFileDTO(){
            vm.fileDTO = {
                "file": null,
                "fileSystem": null,
                "contentType": null,
                "fileName": null
            }
        }

        function uploadFile() {
            createCSVFile(csvParserService.getCSVData());
            uploadFileService.uploadFile(vm.fileDTO, onUploadSuccess, onUploadError);
        }

        function onUploadSuccess(response) {
            var info = {
                text: response.data.message,
                title: "saved"
            }
            $rootScope.showSuccessToast(info);
            resetFileDTO();
            loadAll();
        }

        function onUploadError(error) {
            console.log("error==" + error);
        }

        function clearFileSystem(fileSystem) {
            vm.fileDTO.fileSystem = null;
        }

        function changeFileSystem(fileSystem) {
            vm.fileDTO.fileSystem = fileSystem;
        }

        function clearFile() {
            vm.fileDTO.fileName = null;
        }

        $scope.$watch('files', function() {
            if ($scope.files && $scope.files.length) {
                if(isFileSizeInRange($scope.files[0].size)){    
                    $scope.upload($scope.files[0]);
                }else{
                    showCSVError({
                        text: "you can not upload the file more than "+$rootScope.appProperies.maxDataFileSize+" MB!!",
                        title: "Error"
                    });   
                }
            }
        });
        $scope.$watch('file', function() {
            if ($scope.file != null) {
                $scope.files = [$scope.file];
            }
        });
        $scope.log = '';

        $scope.upload = function (file) {
            //vm.fileDTO.contentType = files[0].type.substring(files[0].type.lastIndexOf("/") + 1, files[0].type.length);
            var reader = new FileReader();
            reader.onload = function () {
                if (vm.separator != null) {
                    var csvData = csvParserService.csvToArray(reader.result, vm.separator.id);
                    if (csvData[0].length > 1) {
                        csvParserService.setCSVData(csvData);
                        openCSVFile(csvData);
                        vm.fileDTO.fileName = file.name.trim().substring(0, file.name.indexOf('.'));
                        vm.fileDisplayName = file.name;
                    } else {
                        showCSVError({
                            text: "Please select the correct separator",
                            title: "Error"
                        });
                    }
                } else {
                    showCSVError({
                        text: "Please select the separator first",
                        title: "Error"
                    });
                }
            };
            reader.readAsBinaryString(file);
        };

        function showCSVError(info){
            $rootScope.showErrorSingleToast(info);
        }


        function openCSVFile(csvData) {
            $uibModal.open({
                    animation: true,
                    templateUrl: "app/admin/file-uploader/csv-dialoag.html",
                    size: "lg",
                    controller: "CSVDialogController",
                    controllerAs: "vm",
                    resolve: {
                        csvData: function() {
                            return csvData.slice(0, 5);
                        }
                    }
                })
                .result.then(function() {}, function() {});
        }

        function createCSVFile(rows) {
            var csvContent = "";
            rows.forEach(function(rowArray) {
                var row = rowArray.join(",");
                csvContent += row + "\r\n";
            });
            vm.fileDTO.file  = window.btoa(csvContent);
        }

        function clearSeparator(){
            vm.separator=null;
        }
        function changeSeparator(separator){
            vm.separator=separator;
        }
        function isFileSizeInRange(size) {
            if (size > 0) {
                var fileSizeInMb = Math.floor(size / 1000000);
                if (fileSizeInMb <= parseInt($rootScope.appProperies.maxDataFileSize)) 
                    return true;
                }else{
                    return false;
                }
        }

        function loadAll () {
            FileUploaderStatus.query({
                page: pagingParams.page - 1,
                size: vm.itemsPerPage,
                sort: sort()
            }, onSuccess, onError);
            function sort() {
                var result = [vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc')];
                if (vm.predicate !== 'id') {
                    result.push('id');
                }
                return result;
            }
            function onSuccess(data, headers) {
                vm.links = ParseLinks.parse(headers('link'));
                vm.totalItems = headers('X-Total-Count');
                vm.queryCount = vm.totalItems;
                vm.fileUploaderStatuses = data;
                vm.page = pagingParams.page;
            }
            function onError(error) {
                AlertService.error(error.data.message);
            }
        }

        function loadPage(page) {
            vm.page = page;
            vm.transition();
        }

        function transition() {
            $state.transitionTo($state.$current, {
                page: vm.page,
                sort: vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc'),
                search: vm.currentSearch
            });
        }

        function getApplicationSettings(){
            appPropertiesService.getProperties().then(onPropertiesServiceSuccess, onPropertiesServiceError);
        }

        function onPropertiesServiceSuccess(result) {
            $rootScope.appProperies=result.data;
        }

        function onPropertiesServiceError(error) {
        }
    }
})();
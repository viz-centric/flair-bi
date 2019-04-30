import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .controller('SchedulerDialogController', SchedulerDialogController);

SchedulerDialogController.$inject = ['$uibModalInstance','$scope','TIMEZONES','$rootScope','visualMetaData','filterParametersService','schedulerService','User','datasource','viewName','scheduler_channels'];

function SchedulerDialogController($uibModalInstance,$scope,TIMEZONES,$rootScope,visualMetaData,filterParametersService,schedulerService,User,datasource,viewName,scheduler_channels) {
    $scope.cronExpression = '10 4 11 * *';
    $scope.cronOptions = {
        hideAdvancedTab: true
    };
    $scope.isCronDisabled = false;

    var vm = this;
    vm.cronConfig = {quartz: false};
    vm.clear = clear;
    vm.schedule = schedule;
    vm.timezoneGroups = TIMEZONES;
    vm.channels=scheduler_channels;
    vm.datePickerOpenStatus = {};
    vm.openCalendar = openCalendar;
    vm.loadUsers=loadUsers;
    vm.schedulerData={};
    vm.added = added;
    vm.removed = removed;
    vm.endDateFormat='yyyy-MM-dd';
    vm.scheduleObj={
        "cron_exp":"",
        "report": {
            "connection_name": "",
            "report_name": "",
            "source_id":"",
            "subject":"",
            "title_name":""
        },
        "report_line_item": {
            "query_name": "",
            "fields": [],
            "group_by": [],
            "order_by": [],
            "where": "",
            "limit": 5,
            "table": "",
            "visualization": "",
            "dimension":[],
            "measure":[]
        },
        "assign_report": {
            "channel": "",
            "condition": "test",
            "email_list":[]
        },
        "schedule": {
            "timezone": "",
            "start_date": "",
            "end_date": ""
        }
    };
    activate();

    ////////////////

    function activate() {
        vm.visualMetaData = visualMetaData;
        vm.datasource= datasource;
        vm.viewName=viewName;
        vm.datePickerOpenStatus.startDate = false;
        vm.datePickerOpenStatus.endDate = false;
        vm.users=User.query();
        //console.log("vm.visualMetaData="+vm.visualMetaData);
        //console.log("vm.datasource=="+vm.datasource);
        buildScheduleObject(vm.visualMetaData,vm.datasource);
        var cronstrue = window.cronstrue;
    }

    function buildScheduleObject(visualMetaData,datasource){
        //report's data
        //vm.scheduleObj.report.connection_id=datasource.connectionName;
        vm.scheduleObj.report.connection_name=datasource.name;
        vm.scheduleObj.report.subject=visualMetaData.metadataVisual.name;
        vm.scheduleObj.report.report_name=getReportName(visualMetaData);
        vm.scheduleObj.report.source_id=datasource.connectionName;
        vm.scheduleObj.report.title_name=visualMetaData.titleProperties.titleText;

        var queryDTO=buildQueryDTO(visualMetaData);
        vm.scheduleObj.report_line_item.query_name=buildQueryName(visualMetaData.id,datasource.connectionName);
        vm.scheduleObj.report_line_item.fields=queryDTO.fields;
        vm.scheduleObj.report_line_item.group_by=queryDTO.groupBy;
        vm.scheduleObj.report_line_item.order_by=queryDTO.orders;
        vm.scheduleObj.report_line_item.limit=queryDTO.limit
        vm.scheduleObj.report_line_item.table=visualMetaData.metadataVisual.name;
        vm.scheduleObj.report_line_item.table=datasource.name;
        vm.scheduleObj.report_line_item.where=JSON.stringify(visualMetaData.conditionExpression);
        vm.scheduleObj.report_line_item.visualization=visualMetaData.metadataVisual.name;
        setDimentionsAndMeasures(visualMetaData.fields);

    }

    function getReportName(visualMetaData){
        var reportName= visualMetaData.metadataVisual.name.split(' ').join('-')+'-'+visualMetaData.id;
        return reportName;
    }

    function loadUsers(q){
        var retVal = vm.users.map(function (item) {
            return item.firstName+" "+item.email;
        });
        return retVal;
    }

    $scope.$watch('cronExpression', function() {
        //console.log('hey, cronExpression has changed='+$scope.cronExpression);
        vm.cronstrue=cronstrue.toString($scope.cronExpression);
    });

    function clear() {
        $uibModalInstance.dismiss('cancel');
    }

    function buildQueryName(vId,connectionId){
        return vId+":"+connectionId;
    }

    function buildQueryDTO(visualMetaData){
        //var condiEx=filterParametersService.getConditionExpression();
        //var pars=filterParametersService.get();
        return visualMetaData.getQueryParameters(filterParametersService.get(), filterParametersService.getConditionExpression());
    }

    function schedule() {
        vm.isSaving = true;
        setScheduledData();
        schedulerService.scheduleReport(vm.scheduleObj).then(function (success) {
            vm.isSaving = false;
            vm.clear();
            var info = {
                text: success.data.message,
                title: "Saved"
            }
            $rootScope.showSuccessToast(info);
        }).catch(function (error) {
            console.log("error==="+error);
            vm.isSaving = false;
            var info = {
                text: error.data.message,
                title: "Error"
            }
            $rootScope.showErrorSingleToast(info);
        });
    }

    function setScheduledData(){
        vm.scheduleObj.schedule.start_date=angular.element("#startDate").val();
        vm.scheduleObj.schedule.end_date=angular.element("#endDate").val();
        vm.scheduleObj.schedule.cronExpression=$scope.cronExpression;
        vm.scheduleObj.assign_report.channel=vm.scheduleObj.assign_report.channel.toLowerCase();
        vm.scheduleObj.cron_exp=$scope.cronExpression;
    }

    function openCalendar (date) {
        vm.datePickerOpenStatus[date] = true;
    }

    function added(tag) {
        var emailObj={"user_name":tag['text'].split(" ")[0],"user_email":tag['text'].split(" ")[1]};
        vm.scheduleObj.assign_report.email_list.push(emailObj);
    }

    function removed(tag){
        var index = -1;
        vm.scheduleObj.assign_report.email_list.some(function(obj, i) {
            return obj.user_email === tag['text'].split(" ")[1] ? index = i : false;
        });
        if (index > -1) {
            vm.scheduleObj.assign_report.email_list.splice(index, 1);
        }
    }

    function setDimentionsAndMeasures(fields){
        fields.filter(function(item) {
            if(item.feature.featureType === "DIMENSION"){
                vm.scheduleObj.report_line_item.dimension.push(item.feature.definition);
            }else if(item.feature.featureType === "MEASURE"){
                vm.scheduleObj.report_line_item.measure.push(item.feature.definition);
            }
        });
    }
}

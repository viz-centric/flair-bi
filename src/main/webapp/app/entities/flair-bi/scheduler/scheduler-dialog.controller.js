(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('SchedulerDialogController', SchedulerDialogController);

        SchedulerDialogController.$inject = ['$uibModalInstance','$scope','TIMEZONES','$rootScope','visualMetaData','filterParametersService','schedulerService','User','datasource','viewName','scheduler_channels','dashboardName','shareLink'];

    function SchedulerDialogController($uibModalInstance,$scope,TIMEZONES,$rootScope,visualMetaData,filterParametersService,schedulerService,User,datasource,viewName,scheduler_channels,dashboardName,shareLink) {
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
        vm.deleteReport=deleteReport;
        vm.scheduleObj={
            "datasourceid":0,
            "report": {
                "connection_name": "",
                "report_name": "",
                "source_id":"",
                "subject":"",
                "title_name":"",
                "mail_body":null,
                "dashboard_name":"",
                "view_name":"",
                "share_link":""
            },
            "report_line_item": {
                "visualizationid":"",
                "visualization": "",
                "dimension":[],
                "measure":[]
            },
            "queryDTO":{
            },
            "assign_report": {
                "channel": "",
                "email_list":[]
            },
            "schedule": {
                "cron_exp":"",
                "timezone": "",
                "start_date": null,
                "end_date": null
            },
            "putcall":false
          };
        activate();

        ////////////////

        function activate() {
            vm.visualMetaData = visualMetaData;
            getScheduleReport(visualMetaData.id);
            vm.datasource= datasource;
            vm.datePickerOpenStatus.startDate = false;
            vm.datePickerOpenStatus.endDate = false;
            buildScheduleObject(vm.visualMetaData,vm.datasource,dashboardName,viewName,shareLink);
            //vm.users=User.query();this will be used in future
            var cronstrue = window.cronstrue;
        }

        function getScheduleReport(visualizationid){
            schedulerService.getScheduleReport(visualizationid).then(function (success) {
                if(success.status==200){
                    vm.scheduleObj.assign_report.channel=success.data.assign_report.channel;
                    $scope.cronExpression=success.data.schedule.cron_exp;
                    angular.element("#startDate").val(success.data.schedule.start_date);
                    angular.element("#endDate").val(success.data.schedule.end_date);
                    vm.scheduleObj.report.mail_body=success.data.report.mail_body;
                    vm.scheduleObj.putcall=true;
                }
            }).catch(function (error) {                
                var info = {
                    text: error.data.message,
                    title: "Error"
                }
                $rootScope.showErrorSingleToast(info);
            }); 
        }

        function buildScheduleObject(visualMetaData,datasource,dashboardName,viewName,shareLink){
        //report's data
        vm.scheduleObj.report.dashboard_name=dashboardName;
        vm.scheduleObj.report.view_name=viewName;
        vm.scheduleObj.report.share_link=shareLink;
        vm.scheduleObj.datasourceid=datasource.id;
        vm.scheduleObj.report.report_name=getReportName(visualMetaData);
        vm.scheduleObj.report_line_item.visualizationid=visualMetaData.id;
        vm.scheduleObj.queryDTO=buildQueryDTO(visualMetaData);
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
            vm.scheduleObj.assign_report.channel=vm.scheduleObj.assign_report.channel.toLowerCase();
            vm.scheduleObj.schedule.cron_exp=$scope.cronExpression;
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

        function deleteReport(){
            schedulerService.cancelScheduleReport(vm.visualMetaData.id).then(function (success) {
                var info = {
                    text: success.data.message,
                    title: "Cancelled"
                }
                $rootScope.showSuccessToast(info);
                vm.clear();
            }).catch(function (error) {                
                var info = {
                    text: error.data.message,
                    title: "Error"
                }
                $rootScope.showErrorSingleToast(info);
            });
        }
}
})();




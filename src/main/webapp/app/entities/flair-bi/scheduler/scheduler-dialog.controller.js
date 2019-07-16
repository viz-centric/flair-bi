(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('SchedulerDialogController', SchedulerDialogController);

        SchedulerDialogController.$inject = ['$uibModalInstance','$scope','TIMEZONES','$rootScope','visualMetaData','filterParametersService','schedulerService','User','datasource','view','scheduler_channels','dashboard','ShareLinkService','Dashboards','Views','Visualmetadata','VisualWrap','scheduledObj','$state','Features','COMPARISIONS'];

    function SchedulerDialogController($uibModalInstance,$scope,TIMEZONES,$rootScope,visualMetaData,filterParametersService,schedulerService,User,datasource,view,scheduler_channels,dashboard,ShareLinkService,Dashboards,Views,Visualmetadata,VisualWrap,scheduledObj,$state,Features,COMPARISIONS) {
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
        vm.COMPARISIONS=COMPARISIONS;
        vm.datePickerOpenStatus = {};
        vm.openCalendar = openCalendar;
        vm.loadUsers=loadUsers;
        vm.schedulerData={};
        vm.added = added;
        vm.removed = removed;
        vm.endDateFormat='yyyy-MM-dd';
        vm.deleteReport=deleteReport;
        vm.changeDashboard=changeDashboard;
        vm.changeView=changeView;
        vm.changeVisualization=changeVisualization;
        vm.emailReporterEdit=false;
        vm.toggleThresholdAlert=toggleThresholdAlert;
        vm.condition={};
        vm.features=[];
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
                "share_link":null,
                "build_url":""
            },
            "report_line_item": {
                "visualizationid":null,
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
                "start_date": new Date(),
                "end_date": new Date()
            },
            "putcall":false,
            "emailReporter":false,
            "thresholdAlert":false
          };
        activate();

        ////////////////

        function activate() {
            vm.datePickerOpenStatus.startDate = false;
            vm.datePickerOpenStatus.endDate = false;
            var cronstrue = window.cronstrue;
            if(visualMetaData){
                vm.visualMetaData = visualMetaData;
                vm.dashboard=dashboard;
                vm.view=view;
                getScheduleReport(visualMetaData.id);
                getThresholdMeasureList(visualMetaData.fields);
                vm.datasource= datasource;
                buildScheduleObject(vm.visualMetaData,vm.datasource,vm.dashboard,vm.view);     
            }else{
                vm.scheduleObj.emailReporter=true;
                vm.users=User.query();
                if(scheduledObj){
                    vm.emailReporterEdit=true;
                    getVisualmetadata(scheduledObj);
                    updateScheduledObj(scheduledObj);
                }else{
                    loadDashboards(); 
                }

            }
        }

        function getVisualmetadata(scheduledObj){
            Visualmetadata.get({
                id: scheduledObj.report_line_item.visualizationid
            },function(result){
                vm.visualMetaData = new VisualWrap(result);
                getThresholdMeasureList(vm.visualMetaData.fields);
                buildScheduledObject(scheduledObj,vm.visualMetaData);
            });
        }

        function getScheduleReport(visualizationid){
            schedulerService.getScheduleReport(visualizationid).then(function (success) {
                if(success.status==200){
                    updateScheduledObj(success.data);
                }
            }).catch(function (error) {
                var info = {
                    text: error.data.message,
                    title: "Error"
                }
                $rootScope.showErrorSingleToast(info);
            }); 
        }

        function updateScheduledObj(data){
            vm.scheduleObj.assign_report.channel=data.assign_report.channel;
            $scope.cronExpression=data.schedule.cron_exp;
            vm.scheduleObj.schedule.start_date= new Date(data.schedule.start_date);
            vm.scheduleObj.schedule.end_date= new Date(data.schedule.end_date);
            vm.scheduleObj.report.mail_body=data.report.mail_body;
            vm.scheduleObj.putcall=true;
            setHavingDTO(JSON.parse(data.query));
            if(vm.scheduleObj.emailReporter){
                vm.scheduleObj.assign_report.email_list=data.assign_report.email_list;
                addEmailList(data.assign_report.email_list);
            }
        }

        function setHavingDTO(query){
            if(query.having){
                vm.scheduleObj.thresholdAlert=true;
                vm.condition.featureName=query.having[0].featureName.split('(')[1].split(')')[0];
                vm.condition.value=query.having[0].value;
                vm.condition.compare=vm.COMPARISIONS.filter(function(item) {
                    return item.opt===query.having[0].comparatorType;
                })[0];
            }
        }

        function getDatasourceId(share_link){
            var params = share_link.split('=');
            return params[params.length-1];
        }

        function addEmailList(emails){
            vm.selectedUsers = emails.map(function (item) {
                var newItem = {};
                newItem['text'] = item.user_name+" "+item.user_email;
                return newItem;
            });
        }

        function buildScheduledObject(scheduledObj,visualMetaData){
            vm.scheduleObj.report.dashboard_name=scheduledObj.report.dashboard_name;
            vm.scheduleObj.report.view_name=scheduledObj.report.view_name;
            vm.scheduleObj.report.build_url=scheduledObj.report.build_url;
            vm.scheduleObj.report.share_link=scheduledObj.report.share_link;
            vm.scheduleObj.datasourceid=getDatasourceId(scheduledObj.report.share_link);
            vm.scheduleObj.report.report_name=getReportName(visualMetaData);
            vm.scheduleObj.report_line_item.visualizationid=visualMetaData.id;
            vm.scheduleObj.queryDTO=buildQueryDTO(visualMetaData);
            setDimentionsAndMeasures(visualMetaData.fields);
        }


        function buildScheduleObject(visualMetaData,datasource,dashboard,view){
            vm.scheduleObj.report.dashboard_name=dashboard.dashboardName;
            vm.scheduleObj.report.view_name=view.viewName;
            vm.scheduleObj.report.build_url=builUrl(dashboard,view);
            vm.scheduleObj.report.share_link=getShareLink(visualMetaData,datasource);
            vm.scheduleObj.datasourceid=datasource.id;
            vm.scheduleObj.report.report_name=getReportName(visualMetaData);
            vm.scheduleObj.report_line_item.visualizationid=visualMetaData.id;
            vm.scheduleObj.queryDTO=buildQueryDTO(visualMetaData);
            setDimentionsAndMeasures(visualMetaData.fields);
        
        }

        function getShareLink(visualMetaData,datasource) {
            return ShareLinkService.createLink(
                visualMetaData.getSharePath(datasource)
            );
        }

        function builUrl(dashboard,view){
            return ShareLinkService.createLink("/dashboards/"+dashboard.id+"/views/"+view.id+"/build");
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
            vm.cronstrue=cronstrue.toString($scope.cronExpression);
        });

        function clear() {
            $uibModalInstance.close();
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
                var info = {
                    text: success.data.message,
                    title: "Saved"
                }
                $rootScope.showSuccessToast(info);
                $uibModalInstance.close(vm.scheduleObj);
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
            vm.scheduleObj.assign_report.channel=vm.scheduleObj.assign_report.channel.toLowerCase();
            vm.scheduleObj.schedule.cron_exp=$scope.cronExpression;
            if(vm.scheduleObj.thresholdAlert)
                vm.scheduleObj.queryDTO.having=getHavingDTO();
        }

        function openCalendar (date) {
            vm.datePickerOpenStatus[date] = true;
        }

        function added(tag) {
            console.log("-vm.selectedUser"+vm.selectedUsers);
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

        function deleteReport(id){
            schedulerService.cancelScheduleReport(id).then(function (success) {
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

        function loadDashboards() {
            Dashboards.query(function(result) {
                vm.dashboards = result;
            });
        }

        function changeDashboard(dashboard){
            vm.dashboard=dashboard;
            loadViews(dashboard.id);
        }

        function loadViews(id) {
            Views.query(
                {
                    viewDashboard:id
                },
                function(result) {
                    vm.views = result;
                }
            );
        }

        function changeView(view){
            vm.view=view;
            loadVisualizations(view.id);
        }

        function loadVisualizations(id){
            Visualmetadata.query({
                views:id
            },function(result){
                vm.visualizations=result;
            });
        }

        function changeVisualization(visualMetaData){
            vm.visualMetaData = new VisualWrap(visualMetaData);
            vm.datasource=vm.dashboard.dashboardDatasource;
            getScheduleReport(visualMetaData.id);
            getThresholdMeasureList(visualMetaData.fields);
            buildScheduleObject(vm.visualMetaData,vm.datasource,vm.dashboard,vm.view);
        }

        function getHavingDTO(){
            var having=[];
            var havingFuntion=getMeasureField();
            var havingDTO= {featureName:havingFuntion,value:vm.condition.value,comparatorType:vm.condition.compare.opt};
            having.push(havingDTO);
            return having;
        }

        function getMeasureField(){
            var aggFunctionField={};
            vm.visualMetaData.fields.filter(function(item) {
                if(item.feature.featureType === "MEASURE" && item.feature.definition ===vm.condition.featureName){
                    aggFunctionField=vm.visualMetaData.constructHavingField(item);
                }
            });
            return aggFunctionField;
        }

        function toggleThresholdAlert(){
            vm.scheduleObj.thresholdAlert=!vm.scheduleObj.thresholdAlert;
            vm.condition={};
        }

        function getThresholdMeasureList(fields){
            fields.filter(function(item) {
                if(item.feature.featureType === "MEASURE"){
                    vm.features.push(item.feature.definition);
                }
            });
            return vm.features;
        }
}
})();




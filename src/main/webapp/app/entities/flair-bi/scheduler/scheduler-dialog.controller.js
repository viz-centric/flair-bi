(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('SchedulerDialogController', SchedulerDialogController);

        SchedulerDialogController.$inject = ['$uibModalInstance','$scope','TIMEZONES','$rootScope','visualMetaData','filterParametersService','schedulerService','User','datasource','view','scheduler_channels','dashboard','ShareLinkService','Dashboards','Views','Visualmetadata','VisualWrap','scheduledObj','$state','Features','COMPARISIONS','thresholdAlert','ReportManagementUtilsService'];

    function SchedulerDialogController($uibModalInstance,$scope,TIMEZONES,$rootScope,visualMetaData,filterParametersService,schedulerService,User,datasource,view,scheduler_channels,dashboard,ShareLinkService,Dashboards,Views,Visualmetadata,VisualWrap,scheduledObj,$state,Features,COMPARISIONS,thresholdAlert,ReportManagementUtilsService) {
        $scope.cronExpression = '10 4 11 * *';
        $scope.cronOptions = {
            hideAdvancedTab: true
        };
        $scope.isCronDisabled = false;

        var TIME_UNIT = [{value: 'hours', title: 'Hours'}, {value: 'days', title: 'Days'}];
        var TIME_DATA_TYPES = ['timestamp', 'date', 'datetime'];
        var vm = this;
        vm.cronConfig = {quartz: false};
        vm.clear = clear;
        vm.schedule = schedule;
        vm.timezoneGroups = TIMEZONES;
        vm.channels=scheduler_channels;
        vm.COMPARISIONS=COMPARISIONS;
        vm.TIME_UNIT = TIME_UNIT;
        vm.datePickerOpenStatus = {};
        vm.openCalendar = openCalendar;
        vm.loadUsers=loadUsers;
        vm.schedulerData={};
        vm.added = added;
        vm.removed = removed;
        vm.WebhookList=[];
        vm.addWebhook = addWebhook;
        vm.removeWebhook=removeWebhook;
        vm.loadWebhooks=loadWebhooks;
        
        vm.endDateFormat='yyyy-MM-dd';
        vm.deleteReport=deleteReport;
        vm.changeDashboard=changeDashboard;
        vm.changeView=changeView;
        vm.changeVisualization=changeVisualization;
        vm.executeNow=executeNow;
        vm.emailReporterEdit=false;
        vm.thresholdAlert=thresholdAlert;
        vm.modalTitle=thresholdAlert?'Schedule Threshold Alert Report':'Schedule Report'
        vm.condition={};
        vm.timeConditions={};
        vm.features=[];
        vm.timeCompatibleDimensions=[];
        vm.vizIdPrefix='threshold_alert_:';
        vm.setChannel=setChannel;
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
                "view_id":null,
                "share_link":null,
                "build_url":"",
                "thresholdAlert":thresholdAlert
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
                "channel": [],
                "communication_list":{"email":[],"teams":[]}
            },
            "schedule": {
                "cron_exp":"",
                "timezone": "",
                "start_date": new Date(),
                "end_date": new Date()
            },
            "constraints":"{}",
            "putcall":false,
            "emailReporter":false
          };
        activate();

        ////////////////

        function activate() {
            vm.datePickerOpenStatus.startDate = false;
            vm.datePickerOpenStatus.endDate = false;
            vm.scheduleObj.schedule.end_date.setDate(vm.scheduleObj.schedule.start_date.getDate()+1);
            getWebhookList();
            resetSelectedChannels();
            if(visualMetaData){
                vm.visualMetaData = visualMetaData;
                vm.dashboard=dashboard;
                vm.view=view;
                initFeatures(view.id)
                  .then(function () {
                      vm.datasource= datasource;
                      getScheduleReport(visualMetaData.id);
                      getThresholdMeasureList(visualMetaData.fields);
                      if($rootScope.isThresholdAlert){
                          vm.scheduleObj.report.thresholdAlert=true;
                          vm.condition.value=$rootScope.ThresholdViz.measureValue;
                          vm.condition.featureName=$rootScope.ThresholdViz.measure;
                      }
                      buildScheduleObject(vm.visualMetaData,vm.datasource,vm.dashboard,vm.view);
                  });
            }else{
                vm.scheduleObj.emailReporter=true;
                vm.users=User.query();
                if(scheduledObj){
                    vm.emailReporterEdit=true;
                    getVisualmetadata(scheduledObj)
                      .then(function (value) {
                          return initFeatures(scheduledObj.report.view_id);
                      })
                      .then(function () {
                          return buildScheduledObject(scheduledObj, vm.visualMetaData);
                      })
                      .then(function () {
                          return updateScheduledObj(scheduledObj);
                      });
                }else{
                    loadDashboards();
                }

            }
        }

        function initFeatures(visualId) {
            return Features.query({view: visualId})
              .$promise
              .then(function (features) {
                  initTimeDimensions(features);
              })
              .catch(function(error) {
                  $rootScope.showErrorSingleToast({
                      text: error.data.message,
                      title: "Error"
                  });
              });
        }

        function initTimeDimensions(features) {
            vm.timeCompatibleDimensions = features
              .filter(function (feature) {
                  return feature.featureType === "DIMENSION";
              })
              .filter(function (feature) {
                  return isTimeType(feature);
              });
        }

        function isTimeType(feature) {
            var type = feature && feature.type;
            return TIME_DATA_TYPES.indexOf(type.toLowerCase()) > -1;
        }

        function getVisualmetadata(scheduledObj){
            return Visualmetadata.get({
                id: removePrefix(scheduledObj.report_line_item.visualizationid)
            },function(result){
                vm.visualMetaData = new VisualWrap(result);
                getThresholdMeasureList(vm.visualMetaData.fields);
            }).$promise;
        }

        function getScheduleReport(visualizationid) {
            schedulerService
                .getScheduleReport(addPrefix(visualizationid))
                .then(function (success) {
                    var report = success.data.report;
                    if (report) {
                        updateScheduledObj(report);
                    }
                })
                .catch(function (error) {
                    $rootScope.showErrorSingleToast({
                        text: error.data.message,
                        title: "Error"
                    });
            }   );
        }

        function setTimeConditions(timeConditions) {
            if (timeConditions) {
                vm.timeConditions.feature = vm.timeCompatibleDimensions.find(function (item) {
                    return item.definition === timeConditions.featureName;
                });
                vm.timeConditions.value = timeConditions.value;
                vm.timeConditions.unit = vm.TIME_UNIT.find(function (unit) {
                    return unit.value === timeConditions.unit;
                });
            }
        }

        function updateScheduledObj(data){
            vm.scheduleObj.assign_report.channel=data.assign_report.channel;
            $scope.cronExpression=data.schedule.cron_exp;
            vm.scheduleObj.schedule.start_date= new Date(data.schedule.start_date);
            vm.scheduleObj.schedule.end_date= new Date(data.schedule.end_date);
            vm.scheduleObj.report.mail_body=data.report.mail_body;
            vm.scheduleObj.putcall=true;
            vm.scheduleObj.report.thresholdAlert=data.report.thresholdAlert;
            vm.scheduleObj.constraints=data.constraints;
            vm.scheduleObj.assign_report.communication_list.teams=data.assign_report.communication_list.teams;
            addWebhhokList(data.assign_report.communication_list.teams);
            selectChannels(data.assign_report.channel)
            if (vm.scheduleObj.report.thresholdAlert) {
                setHavingDTO(JSON.parse(data.query));
            }
            if (vm.scheduleObj.constraints) {
                setTimeConditions(JSON.parse(vm.scheduleObj.constraints).time);
            }
            if(vm.scheduleObj.emailReporter){
                vm.scheduleObj.assign_report.communication_list.email=data.assign_report.communication_list.email;
                addEmailList(data.assign_report.communication_list.email);
            }
        }

        function setHavingDTO(query){
            if(query.having){
                vm.condition.featureName=query.having[0].feature.name;
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

        function addWebhhokList(webhook){
            vm.selectedWebhook = webhook.map(function (item) {
                var newItem = {};
                var webhook=vm.WebhookList.filter(function(val){
                    if (val.id==item){
                        return val
                    }
                })
                newItem['text'] = webhook[0].webhookName;
                return newItem;
            });
        }

        function assignTimeConditionsToScheduledObj() {
            if (!vm.timeConditions.feature) {
                return;
            }
            var constraints = {
               time: {
                   featureName: vm.timeConditions.feature.definition,
                   value: vm.timeConditions.value,
                   unit: vm.timeConditions.unit.value
               }
            };

            vm.scheduleObj.constraints = JSON.stringify(constraints);
        }

        function buildScheduledObject(scheduledObj,visualMetaData){
            vm.scheduleObj.report.dashboard_name=scheduledObj.report.dashboard_name;
            vm.scheduleObj.report.view_name=scheduledObj.report.view_name;
            vm.scheduleObj.report.view_id=scheduledObj.report.view_id;
            vm.scheduleObj.report.build_url=scheduledObj.report.build_url;
            vm.scheduleObj.report.share_link=scheduledObj.report.share_link;
            vm.scheduleObj.datasourceid=getDatasourceId(scheduledObj.report.share_link);
            vm.scheduleObj.report.report_name=getReportName(visualMetaData);
            vm.scheduleObj.report_line_item.visualizationid=visualMetaData.id;
            vm.scheduleObj.queryDTO=buildQueryDTO(visualMetaData);
            assignTimeConditionsToScheduledObj();
            setDimentionsAndMeasures(visualMetaData.fields);
        }


        function buildScheduleObject(visualMetaData,datasource,dashboard,view){
            vm.scheduleObj.report.dashboard_name=dashboard.dashboardName;
            vm.scheduleObj.report.view_name=view.viewName;
            vm.scheduleObj.report.view_id=view.id;
            vm.scheduleObj.report.build_url=builUrl(dashboard,view);
            vm.scheduleObj.report.share_link=getShareLink(visualMetaData,datasource);
            vm.scheduleObj.datasourceid=datasource.id;
            vm.scheduleObj.report.report_name=getReportName(visualMetaData);
            vm.scheduleObj.report_line_item.visualizationid=visualMetaData.id;
            vm.scheduleObj.queryDTO=buildQueryDTO(visualMetaData);
            assignTimeConditionsToScheduledObj();
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

        function loadWebhooks(){
            var retVal = vm.WebhookList.map(function (item) {
                return item.webhookName;
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

        function getAdditionalConditionalExpressions() {
            var additionalFeatures = [];
            if (vm.timeConditions.feature) {
                var featureData = {};
                var featureDefinition = vm.timeConditions.feature.definition;
                featureData[featureDefinition] = [
                  vm.timeConditions.value + ' ' + vm.timeConditions.unit.value
                ];
                featureData[featureDefinition]._meta = {
                    operator: '-',
                    initialValue: '__FLAIR_NOW()',
                    valueType: 'intervalValueType'
                };
                additionalFeatures.push(featureData);
            }
            return additionalFeatures;
        }

        function buildQueryDTO(visualMetaData){
            return visualMetaData.getQueryParameters(
              filterParametersService.get(),
              filterParametersService.getConditionExpression(getAdditionalConditionalExpressions())
            );
        }

        function schedule() {
            if (!vm.visualMetaData) {
                getVisualmetadata(scheduledObj)
                  .then(function () {
                      continueSchedule();
                  });
            } else {
                continueSchedule();
            }
        }

        function continueSchedule() {
            vm.scheduleObj.queryDTO = buildQueryDTO(vm.visualMetaData);
            if(validateAndSetHaving()){
                vm.isSaving = true;
                setCronExpression();
                schedulerService.scheduleReport(vm.scheduleObj).then(function (success) {
                    vm.isSaving = false;
                    if (success.status==200) {
                      $uibModalInstance.close(vm.scheduleObj);
                    } else {
                      $rootScope.showErrorSingleToast({
                        text: success.data.message,
                        title: "Error"
                      });
                    }
                }).catch(function (error) {
                    vm.isSaving = false;
                    $rootScope.showErrorSingleToast({
                        text: error.data.message,
                        title: "Error"
                    });
                });
            }else{
                var info = {
                    text: "Please select aggregate function from settings",
                    title: "Error"
                }
                $rootScope.showErrorSingleToast(info);
            }
        }

        function setCronExpression(){
            vm.scheduleObj.schedule.cron_exp=$scope.cronExpression;
        }

        function validateAndSetHaving(){
            var flag=true;
            assignTimeConditionsToScheduledObj();
            if(vm.scheduleObj.report.thresholdAlert){
                vm.scheduleObj.queryDTO.having=getHavingDTO();
                vm.scheduleObj.queryDTO.having[0].feature?flag=true:flag=false;
            }
            return flag;
        }

        function openCalendar (date) {
            vm.datePickerOpenStatus[date] = true;
        }

        function added(tag) {
            console.log("-vm.selectedUser"+vm.selectedUsers);
            var emailObj={"user_name":tag['text'].split(" ")[0],"user_email":tag['text'].split(" ")[1]};
            vm.scheduleObj.assign_report.communication_list.email.push(emailObj);
        }
        function addWebhook(tag) {
            console.log("-vm.selectedUser"+vm.selectedWebhook);
            var webhook=vm.WebhookList.filter(function(val){
                if (val.webhookName==tag.text){
                    return val
                }
            })
            vm.scheduleObj.assign_report.communication_list.teams.push(webhook[0].id);
        }
        function removeWebhook(tag){
            
            var webhook=vm.WebhookList.filter(function(val){
                if (val.webhookName==tag.text){
                    return val
                }
            })

            var index= vm.scheduleObj.assign_report.communication_list.teams.indexOf(webhook[0].id)

            if (index > -1) {
                vm.scheduleObj.assign_report.communication_list.teams.splice(index, 1);
            }
        }

        function removed(tag){
            var index = -1;
            vm.scheduleObj.assign_report.communication_list.email.some(function(obj, i) {
            return obj.user_email == tag['text'].split(" ")[1] ? index = i : false;
            });
            if (index > -1) {
                vm.scheduleObj.assign_report.communication_list.email.splice(index, 1);
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
            schedulerService.cancelScheduleReport(addPrefix(id)).then(function (success) {
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
            initFeatures(vm.view.id)
              .then(function () {
                  getScheduleReport(visualMetaData.id);
                  getThresholdMeasureList(visualMetaData.fields);
                  buildScheduleObject(vm.visualMetaData, vm.datasource, vm.dashboard, vm.view);
              });
        }

        function getHavingDTO(){
            var having = [];
            var havingField = getMeasureField();
            var havingDTO = {
                feature: havingField,
                value: vm.condition.value,
                comparatorType: vm.condition.compare.opt
            };
            having.push(havingDTO);
            return having;
        }

        function getMeasureField() {
            return vm.visualMetaData.fields
                .filter(function (item) {
                    return item.feature.featureType === "MEASURE" && item.feature.definition === vm.condition.featureName;
                })
                .map(function (item) {
                    return vm.visualMetaData.constructHavingField(item);
                })[0];
        }


        function getThresholdMeasureList(fields){
            fields.filter(function(item) {
                if(item.feature.featureType === "MEASURE"){
                    vm.features.push(item.feature.definition);
                }
            });
            return vm.features;
        }

        function addPrefix(vizId){
           return vm.scheduleObj.report.thresholdAlert?vm.vizIdPrefix+vizId:vizId;
        }

        function removePrefix(vizId){
            return vm.scheduleObj.report.thresholdAlert?vizId.split(":")[1]:vizId;
        }

        function executeNow(id){
            ReportManagementUtilsService.executeNow(addPrefix(id));
        }


        function setChannel(channel,selected){
            vm.channels[channel]=!selected;
            var index = vm.scheduleObj.assign_report.channel.indexOf(channel);
            if (index > -1) {
                vm.scheduleObj.assign_report.channel.splice(index, 1);
            }else{
                vm.scheduleObj.assign_report.channel.push(channel)
            }
        }

        function selectChannels(selectedChannels){
            selectedChannels.filter(function(item) {
                vm.channels[item]=true;
            });
        }

        function resetSelectedChannels(){
            angular.forEach(vm.channels, function(value, key) {
              vm.channels[key]=false;
            });
        }

        function getWebhookList() {
            schedulerService.getTeamConfig(0)
                .then(function (success) {
                    vm.WebhookList = success.data;

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




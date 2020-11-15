(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('SchedulerDialogController', SchedulerDialogController);

    SchedulerDialogController.$inject = ['$uibModalInstance', '$scope', 'TIMEZONES', '$rootScope', 'visualMetaData', 'filterParametersService', 'schedulerService', 'datasource', 'view', 'SCHEDULER_CHANNELS', 'dashboard', 'ShareLinkService', 'Dashboards', 'Views', 'Visualmetadata', 'VisualWrap', 'scheduledObj', 'Features', 'COMPARISIONS', 'thresholdAlert', 'ReportManagementUtilsService', 'ChannelService', 'REPORTMANAGEMENTCONSTANTS', 'CommunicationDispatcherService', '$uibModal', 'AccountDispatch', 'COMPARABLE_DATA_TYPES', 'AGGREGATION_TYPES', 'QueryValidationService', '$q', '$translate', 'VisualDispatchService', '$state'];

    function SchedulerDialogController($uibModalInstance, $scope, TIMEZONES, $rootScope, visualMetaData, filterParametersService, schedulerService, datasource, view, SCHEDULER_CHANNELS, dashboard, ShareLinkService, Dashboards, Views, Visualmetadata, VisualWrap, scheduledObj, Features, COMPARISIONS, thresholdAlert, ReportManagementUtilsService, ChannelService, REPORTMANAGEMENTCONSTANTS, CommunicationDispatcherService, $uibModal, AccountDispatch, COMPARABLE_DATA_TYPES, AGGREGATION_TYPES, QueryValidationService, $q, $translate, VisualDispatchService, $state) {

        var vm = this;
        var reportManagement = 'report-management';
        var TIME_UNIT = [{ value: 'hours', title: 'Hours' }, { value: 'days', title: 'Days' }];
        vm.cronExpression = '10 4 11 * *';
        vm.cronOptions = {
            hideAdvancedTab: true
        };
        vm.isCronDisabled = false;
        var emptyList = [];
        vm.cronConfig = { quartz: false };
        vm.clear = clear;
        vm.schedule = schedule;
        vm.timezoneGroups = TIMEZONES;
        vm.channels = SCHEDULER_CHANNELS;
        vm.COMPARISIONS = COMPARISIONS;
        vm.AGGREGATION_TYPES = AGGREGATION_TYPES;
        vm.TIME_UNIT = TIME_UNIT;
        vm.datePickerOpenStatus = {};
        vm.openCalendar = openCalendar;
        vm.loadUsers = loadUsers;
        vm.schedulerData = {};
        vm.added = added;
        vm.removed = removed;
        vm.WebhookList = [];
        vm.addWebhook = addWebhook;
        vm.removeWebhook = removeWebhook;
        vm.loadWebhooks = loadWebhooks;
        vm.getLabelClass = getLabelClass;
        vm.dateformat = 'yyyy-MM-dd';
        vm.endDateFormat = 'yyyy-MM-dd';
        vm.deleteReport = deleteReport;
        vm.changeDashboard = changeDashboard;
        vm.changeView = changeView;
        vm.changeVisualization = changeVisualization;
        vm.executeNow = executeNow;
        vm.emailReporterEdit = false;
        vm.thresholdAlert = thresholdAlert;
        vm.modalTitle = thresholdAlert ? 'Schedule Threshold Alert Report' : 'Schedule Report'
        vm.condition = {
            thresholdMode: 'absolute',
            dynamicThreshold: {}
        };
        vm.timeConditions = {};
        vm.features = [];
        vm.timeCompatibleDimensions = [];
        vm.vizIdPrefix = 'threshold_alert_:';
        vm.setChannel = setChannel;
        vm.openCommunicationListModal = openCommunicationListModal;
        vm.maxListSize = 10;
        vm.selectedUsers = [];
        vm.selectedWebhook = [];
        vm.validate = validate;
        vm.displayTextboxForValues = displayTextboxForValues;
        vm.addToFilter = addToFilter;
        vm.isCommaSeparatedInput = false;
        vm.commaSeparatedToolTip = VisualDispatchService.setcommaSeparatedToolTip(vm.isCommaSeparatedInput);
        vm.scheduleObj = {
            "datasourceid": 0,
            "report": {
                "userid": "",
                "connection_name": "",
                "report_name": "",
                "source_id": "",
                "subject": "",
                "title_name": "",
                "mail_body": null,
                "dashboard_name": "",
                "view_name": "",
                "view_id": null,
                "share_link": null,
                "build_url": "",
                "thresholdAlert": thresholdAlert
            },
            "report_line_item": {
                "visualizationid": null,
                "visualization": "",
                "dimension": [],
                "measure": []
            },
            "queryDTO": {
            },
            "assign_report": {
                "channel": [],
                "communication_list": { "email": [], "teams": [] }
            },
            "schedule": {
                "cron_exp": "",
                "timezone": "",
                "start_date": new Date(),
                "end_date": new Date()
            },
            "constraints": "{}",
            "putcall": false,
            "emailReporter": false
        };
        activate();

        ////////////////

        function activate() {
            vm.isAdmin = AccountDispatch.isAdmin();
            vm.account = AccountDispatch.getAccount();

            registerSetCommunicationList();
            vm.datePickerOpenStatus.startDate = false;
            vm.datePickerOpenStatus.endDate = false;
            vm.scheduleObj.schedule.end_date.setDate(vm.scheduleObj.schedule.start_date.getDate() + 1);

            getWebhookList();
            isConfigExist();

            getWebhookNames();

            resetSelectedChannels();
            if (visualMetaData) {
                vm.visualMetaData = visualMetaData;
                vm.dashboard = dashboard;
                vm.view = view;
                initFeatures(view.id)
                    .then(function () {
                        vm.datasource = datasource;
                        getScheduleReport(visualMetaData.id);
                        getThresholdMeasureList(visualMetaData.fields);
                        if ($rootScope.isThresholdAlert) {
                            vm.scheduleObj.report.thresholdAlert = true;
                            vm.condition.operation.value = $rootScope.ThresholdViz.measureValue;
                            vm.condition.featureName = $rootScope.ThresholdViz.measure;
                        }
                        buildScheduleObject(vm.visualMetaData, vm.datasource, vm.dashboard, vm.view);
                    });
            } else {
                vm.scheduleObj.emailReporter = true;
                if (scheduledObj) {
                    vm.emailReporterEdit = true;
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
                } else {
                    loadDashboards();
                }

            }
        }

        function initFeatures(visualId) {
            return Features.query({ view: visualId })
                .$promise
                .then(function (features) {
                    initTimeDimensions(features);
                })
                .catch(function (error) {
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
            return COMPARABLE_DATA_TYPES.indexOf(type.toLowerCase()) > -1;
        }

        function getVisualmetadata(scheduledObj) {
            return Visualmetadata.get({
                id: removePrefix(scheduledObj.report_line_item.visualizationid)
            }, function (result) {
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
                });
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

        function updateScheduledObj(data) {
            vm.scheduleObj.assign_report.channel = data.assign_report.channel;
            vm.cronExpression = data.schedule.cron_exp;
            vm.scheduleObj.schedule.start_date = new Date(data.schedule.start_date);
            vm.scheduleObj.schedule.end_date = new Date(data.schedule.end_date);
            vm.scheduleObj.report.mail_body = data.report.mail_body;
            vm.scheduleObj.report.userid = data.report.userid;
            vm.scheduleObj.report.title_name = data.report.title_name;

            vm.canEdit = AccountDispatch.hasAuthority(
                "WRITE_" + data.report.view_id + "_VIEW"
            );

            vm.canDelete = AccountDispatch.hasAuthority(
                "DELETE_" + data.report.view_id + "_VIEW"
            );

            vm.canUpdate = AccountDispatch.hasAuthority(
                "UPDATE_" + data.report.view_id + "_VIEW"
            );
            vm.canRead = AccountDispatch.hasAuthority(
                "READ_" + data.report.view_id + "_VIEW"
            );

            if (vm.canEdit && vm.canUpdate && vm.canRead) {
                vm.scheduleObj.putcall = true;
            }

            vm.scheduleObj.report.thresholdAlert = data.report.thresholdAlert;
            vm.scheduleObj.constraints = data.constraints;
            vm.scheduleObj.assign_report.communication_list.teams = data.assign_report.communication_list.teams;
            addWebhhokList(data.assign_report.communication_list.teams);
            selectChannels(data.assign_report.channel)
            if (vm.scheduleObj.report.thresholdAlert) {
                setHavingDTO(JSON.parse(data.query));
            }
            if (vm.scheduleObj.constraints) {
                setTimeConditions(JSON.parse(vm.scheduleObj.constraints).time);
            }
            vm.scheduleObj.assign_report.communication_list.email = data.assign_report.communication_list.email;
            addEmailList(data.assign_report.communication_list.email);
        }

        function setHavingDTO(query) {
            if (query.having) {
                vm.condition.featureName = query.having[0].feature.name;
                vm.condition.compare = vm.COMPARISIONS.filter(function (item) {
                    return item.opt === query.having[0].comparatorType;
                })[0];

                const operation = JSON.parse(query.having[0].operation || '{}');
                if (operation['@type'] === 'arithmetic') {
                    const innerQuery = operation.operations[0].value;
                    console.log('innerQuery', innerQuery);
                    const scalar = operation.operations[1].value;
                    const conditionExpression = innerQuery.conditionExpressions[0].conditionExpression.firstExpression;
                    const field = innerQuery.fields[0];
                    vm.condition.thresholdMode = 'dynamic';
                    vm.condition.dynamicThreshold = {
                        field: field.name,
                        aggregation: vm.AGGREGATION_TYPES.find(function (item) {
                            return item.opt === field.aggregation;
                        }),
                        dimension: vm.timeCompatibleDimensions.find(function (item) {
                            return item.definition === conditionExpression.featureName;
                        }),
                        unit: vm.TIME_UNIT.find(function (unit) {
                            return unit.value === conditionExpression.valueType.interval.split(' ')[1];
                        }),
                        value: conditionExpression.valueType.interval.split(' ')[0],
                    };
                    vm.condition.value = 100 - Math.round(scalar * 100);
                } else {
                    vm.condition.value = operation.value;
                }
            }
        }

        function getConditionExpression(query) {
            if (query.having) {
                vm.condition.featureName = query.having[0].feature.name;
                vm.condition.compare = vm.COMPARISIONS.filter(function (item) {
                    return item.opt === query.having[0].comparatorType;
                })[0];

                const operation = JSON.parse(query.having[0].operation || '{}');
                if (operation['@type'] === 'arithmetic') {
                    const innerQuery = operation.operations[0].value;
                    console.log('innerQuery', innerQuery);
                    const scalar = operation.operations[1].value;
                    const conditionExpression = innerQuery.conditionExpressions[0].conditionExpression.firstExpression;
                    const field = innerQuery.fields[0];
                    vm.condition.thresholdMode = 'dynamic';
                    vm.condition.dynamicThreshold = {
                        field: field.name,
                        aggregation: vm.AGGREGATION_TYPES.find(function (item) {
                            return item.opt === field.aggregation;
                        }),
                        dimension: vm.timeCompatibleDimensions.find(function (item) {
                            return item.definition === conditionExpression.featureName;
                        }),
                        unit: vm.TIME_UNIT.find(function (unit) {
                            return unit.value === conditionExpression.valueType.interval.split(' ')[1];
                        }),
                        value: conditionExpression.valueType.interval.split(' ')[0],
                    };
                    vm.condition.value = 100 - Math.round(scalar * 100);
                } else {
                    vm.condition.value = operation.value;
                }
            }
        }

        function getDatasourceId(share_link) {
            return getQueryString('datasourceId', share_link);
        }

        function getDashboardId(share_link) {
            return getQueryString('dashboarID', share_link);
        }

        function getQueryString(field, url) {
            var href = url ? url : window.location.href;
            var reg = new RegExp('[?&]' + field + '=([^&#]*)', 'i');
            var string = reg.exec(href);
            return string ? string[1] : null;
        };

        function addEmailList(emailsR) {
            var emails = emailsR.slice(0, vm.maxListSize);
            vm.selectedUsers = emails.map(function (item) {
                var newItem = {};
                newItem['text'] = item.user_name + " " + item.user_email;
                return newItem;
            });
        }

        function addWebhhokList(webhooksR) {
            var webhooks = webhooksR.slice(0, vm.maxListSize);
            vm.selectedWebhook = webhooks.map(function (item) {
                var newItem = {};
                var webhook = vm.WebhookList.filter(function (val) {
                    if (val.id == item) {
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

        function buildScheduledObject(scheduledObj, visualMetaData) {
            vm.scheduleObj.report.dashboard_name = scheduledObj.report.dashboard_name;
            vm.scheduleObj.report.view_name = scheduledObj.report.view_name;
            vm.scheduleObj.report.view_id = scheduledObj.report.view_id;
            vm.scheduleObj.report.build_url = scheduledObj.report.build_url;
            vm.scheduleObj.report.share_link = scheduledObj.report.share_link;
            vm.scheduleObj.datasourceid = getDatasourceId(scheduledObj.report.share_link);
            vm.scheduleObj.report.report_name = getReportName(visualMetaData);
            vm.scheduleObj.report.title_name = getReportTitle(visualMetaData);
            vm.scheduleObj.report_line_item.visualizationid = visualMetaData.id;
            vm.scheduleObj.queryDTO = buildQueryDTO(visualMetaData);
            assignTimeConditionsToScheduledObj();
            setDimentionsAndMeasures(visualMetaData.fields);
        }


        function buildScheduleObject(visualMetaData, datasource, dashboard, view) {
            vm.scheduleObj.report.dashboard_name = dashboard.dashboardName;
            vm.scheduleObj.report.view_name = view.viewName;
            vm.scheduleObj.report.view_id = view.id;
            vm.scheduleObj.report.build_url = builUrl(dashboard, view);
            vm.scheduleObj.report.share_link = getShareLink(visualMetaData, datasource, view.id);
            vm.scheduleObj.datasourceid = datasource.id;
            vm.scheduleObj.report.report_name = getReportName(visualMetaData);
            vm.scheduleObj.report.title_name = getReportTitle(visualMetaData);
            vm.scheduleObj.report_line_item.visualizationid = visualMetaData.id;
            vm.scheduleObj.queryDTO = buildQueryDTO(visualMetaData);
            assignTimeConditionsToScheduledObj();
            setDimentionsAndMeasures(visualMetaData.fields);

        }

        function getShareLink(visualMetaData, datasource, viewId) {
            return ShareLinkService.createLink(
                visualMetaData.getSharePath(vm.scheduleObj.report.dashboard_name, vm.scheduleObj.report.view_name, vm.view.viewDashboard.id, datasource, viewId)
            );
        }

        function builUrl(dashboard, view) {
            return ShareLinkService.createLink("/dashboards/" + dashboard.id + "/views/" + view.id + "/build");
        }

        function getReportName(visualMetaData) {
            var reportName = visualMetaData.metadataVisual.name.split(' ').join('-') + '-' + visualMetaData.id;
            return reportName;
        }

        function getReportTitle(visualMetaData) {
            return visualMetaData.titleProperties.titleText;
        }

        function loadUsers(q) {
            return schedulerService.searchUsers(q, 10);
        }

        function loadWebhooks() {
            if (vm.selectedWebhook.length < vm.maxListSize) {
                var retVal = vm.WebhookList.map(function (item) {
                    return item.webhookName;
                });
                return retVal;
            }
            else {
                return emptyList;
            }
        }

        function clear() {
            $uibModalInstance.close();
        }

        function buildQueryName(vId, connectionId) {
            return vId + ":" + connectionId;
        }

        function getAdditionalConditionalExpressions() {
            var additionalFeatures = [];
            if (vm.timeConditions.feature) {
                var featureData = {};
                var featureDefinition = vm.timeConditions.feature.definition;
                featureData[featureDefinition] = [
                    vm.timeConditions.value + ' ' + vm.timeConditions.unit.value
                ];
                const initialValue = vm.timeConditions.unit.value === 'days' ?
                    "__FLAIR_NOW('day', __FLAIR_NOW())" :
                    '__FLAIR_NOW()';
                featureData[featureDefinition]._meta = {
                    operator: '-',
                    initialValue: initialValue,
                    endValue: '__FLAIR_NOW()',
                    valueType: 'intervalValueType'
                };
                additionalFeatures.push(featureData);
            }
            return additionalFeatures;
        }

        function getDynamicAlertConditionalExpressions() {
            var featureData = {};
            var featureDefinition = vm.condition.dynamicThreshold.dimension.definition;
            featureData[featureDefinition] = [
                vm.condition.dynamicThreshold.value + ' ' + vm.condition.dynamicThreshold.unit.value
            ];
            const initialValue = vm.condition.dynamicThreshold.unit.value === 'days' ?
                "__FLAIR_NOW('day', __FLAIR_NOW())" :
                '__FLAIR_NOW()';
            featureData[featureDefinition]._meta = {
                operator: '-',
                initialValue: initialValue,
                endValue: '__FLAIR_NOW()',
                valueType: 'intervalValueType'
            };

            const featureData2 = {};
            const dimension = vm.visualMetaData.getFieldDimensions()[0];
            const featureDef = dimension.feature.name;
            featureData2[featureDefinition] = ['A.' + featureDef, 'B.' + featureDef];
            featureData2[featureDefinition]._meta = {
                valueType: 'compare'
            };

            return [featureData, featureData2];
        }

        function buildQueryDTO(visualMetaData) {
            return visualMetaData.getQueryParameters(
                filterParametersService,
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
            vm.scheduleObj.dashboardId = getDashboardId(vm.scheduleObj.report.share_link);
            if (validateAndSetHaving()) {
                vm.isSaving = true;
                setCronExpression();
                schedulerService.scheduleReport(vm.scheduleObj).then(function (success) {
                    vm.isSaving = false;
                    if (success.status == 200 && (success.data.message == "report is updated" || success.data.message == "Report is scheduled successfully")) {
                        $uibModalInstance.close(vm.scheduleObj);
                        if ($state.$current.name === 'report-management') {
                            $state.go("report-management", null, {
                                reload: "report-management"
                            });
                        }
                        $rootScope.showSuccessToast({
                            text: "Report updated",
                            title: "Success"
                        });
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
            } else {
                var info = {
                    text: "Scheduling threshold alerting on Visualisation with NONE aggregate type is prohibited",
                    title: "Error"
                }
                $rootScope.showErrorSingleToast(info);
            }
        }

        function setCronExpression() {
            vm.scheduleObj.schedule.cron_exp = vm.cronExpression;
        }

        function validateAndSetHaving() {
            var flag = true;
            assignTimeConditionsToScheduledObj();
            if (vm.scheduleObj.report.thresholdAlert) {
                vm.scheduleObj.queryDTO.having = getHavingDTO();
                vm.scheduleObj.queryDTO.having[0].feature ? flag = true : flag = false;
            }
            return flag;
        }

        function openCalendar(date) {
            vm.datePickerOpenStatus[date] = true;
        }

        function added(tag) {
            var emailObj = { "user_name": tag['text'].split(" ")[0], "user_email": tag['text'].split(" ")[1] };
            vm.scheduleObj.assign_report.communication_list.email.push(emailObj);
        }
        function addWebhook(tag) {
            var webhook = vm.WebhookList.filter(function (val) {
                if (val.webhookName == tag.text) {
                    return val
                }
            })
            vm.scheduleObj.assign_report.communication_list.teams.push(webhook[0].id);
        }
        function removeWebhook(tag) {
            var webhook = vm.WebhookList.filter(function (val) {
                if (val.webhookName == tag.text) {
                    return val
                }
            })

            var index = vm.scheduleObj.assign_report.communication_list.teams.indexOf(webhook[0].id)

            if (index > -1) {
                vm.scheduleObj.assign_report.communication_list.teams.splice(index, 1);
            }
        }

        function removed(tag) {
            var index = -1;
            vm.scheduleObj.assign_report.communication_list.email.some(function (obj, i) {
                return obj.user_email == tag['text'].split(" ")[1] ? index = i : false;
            });
            if (index > -1) {
                vm.scheduleObj.assign_report.communication_list.email.splice(index, 1);
            }
        }

        function setDimentionsAndMeasures(fields) {
            fields.filter(function (item) {
                if (item.feature.featureType === "DIMENSION") {
                    vm.scheduleObj.report_line_item.dimension.push(item.feature.name);
                } else if (item.feature.featureType === "MEASURE") {
                    vm.scheduleObj.report_line_item.measure.push(item.feature.name);
                }
            });
        }

        function deleteReport(id) {
            var canDelete = true;
            if (!vm.isAdmin) {
                if (vm.scheduleObj.report.userid !== vm.account.login) {
                    canDelete = false;
                }
            }
            if (canDelete) {
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
            else {
                var info = {
                    text: "You don't have access to cancel this job",
                    title: "Error"
                }
                $rootScope.showErrorSingleToast(info);
            }

        }

        function loadDashboards() {
            Dashboards.query(function (result) {
                vm.dashboards = result;
            });
        }

        function changeDashboard(dashboard) {
            vm.dashboard = dashboard;
            loadViews(dashboard.id);
        }

        function loadViews(id) {
            Views.query(
                {
                    viewDashboard: id
                },
                function (result) {
                    vm.views = result;
                }
            );
        }

        function changeView(view) {
            vm.view = view;
            loadVisualizations(view.id);
        }

        function loadVisualizations(id) {
            Visualmetadata.query({
                views: id
            }, function (result) {
                vm.visualizations = result;
            });
        }

        function changeVisualization(visualMetaData) {
            vm.visualMetaData = new VisualWrap(visualMetaData);
            vm.datasource = vm.dashboard.dashboardDatasource;
            initFeatures(vm.view.id)
                .then(function () {
                    getScheduleReport(visualMetaData.id);
                    getThresholdMeasureList(visualMetaData.fields);
                    buildScheduleObject(vm.visualMetaData, vm.datasource, vm.dashboard, vm.view);
                });
        }

        function getHavingDTO() {
            var havingField = getMeasureField();
            var havingDTO = {
                feature: havingField,
                operation: {
                    '@type': 'scalar',
                    value: vm.condition.value
                },
                comparatorType: vm.condition.compare.opt
            };
            if (vm.condition.thresholdMode === 'dynamic') {
                const dynamicAlertConditionalExpressions = getDynamicAlertConditionalExpressions();
                const conditionExpressionForParams = filterParametersService.getConditionExpressionForParams(dynamicAlertConditionalExpressions);
                const query = vm.visualMetaData.getQueryParametersWithFields(
                    [{
                        name: vm.condition.dynamicThreshold.field,
                        aggregation: vm.condition.dynamicThreshold.aggregation.opt,
                        alias: vm.condition.dynamicThreshold.field
                    }],
                    filterParametersService.get(),
                    conditionExpressionForParams
                );
                havingDTO.operation = {
                    '@type': 'arithmetic',
                    value: 'MULTIPLY',
                    operations: [
                        {
                            '@type': 'query',
                            value: query,
                        },
                        {
                            '@type': 'scalar',
                            value: (100 - vm.condition.value) / 100,
                        }
                    ]
                };
            }
            return [havingDTO];
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

        function getThresholdMeasureList(fields) {
            fields.filter(function (item) {
                if (item.feature.featureType === "MEASURE") {
                    vm.features.push(item.feature.definition);
                }
            });
            return vm.features;
        }

        function addPrefix(vizId) {
            return vm.scheduleObj.report.thresholdAlert ? vm.vizIdPrefix + vizId : vizId;
        }

        function removePrefix(vizId) {
            return vm.scheduleObj.report.thresholdAlert ? vizId.split(":")[1] : vizId;
        }

        function executeNow(id) {
            ReportManagementUtilsService.executeNow(addPrefix(id));
        }


        function setChannel(channel, selected, active) {
            if (active !== REPORTMANAGEMENTCONSTANTS.disabledTicketCreation) {
                vm.channels[channel] = !selected;
                var index = vm.scheduleObj.assign_report.channel.indexOf(channel);
                if (index > -1) {
                    vm.scheduleObj.assign_report.channel.splice(index, 1);
                } else {
                    vm.scheduleObj.assign_report.channel.push(channel)
                }
            }
        }

        function selectChannels(selectedChannels) {
            selectedChannels.filter(function (item) {
                vm.channels[item] = true;
            });
        }

        function resetSelectedChannels() {
            angular.forEach(vm.channels, function (value, key) {
                vm.channels[key] = false;
            });
        }

        function getWebhookList() {
            ChannelService.getTeamConfig(0)
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
        function getWebhookNames() {
            ChannelService.getTeamNames(0)
                .then(function (success) {
                    vm.webhooksNames = success.data;
                }).catch(function (error) {
                    var info = {
                        text: error.data.message,
                        title: "Error"
                    }
                    $rootScope.showErrorSingleToast(info);
                });
        }
        function isConfigExist() {
            ChannelService.isConfigExist(0)
                .then(function (success) {
                    vm.isConfigExist = success.data;
                }).catch(function (error) {
                    var info = {
                        text: error.data.message,
                        title: "Error"
                    }
                    $rootScope.showErrorSingleToast(info);
                });
        }
        function getLabelClass(channel) {
            // if (channel === "Email" && vm.SMPTSetting.id === 0) {
            //     return REPORTMANAGEMENTCONSTANTS.disabledTicketCreation;
            // }
            // if (channel === "Teams" && vm.WebhookList.length === 0) {
            //     return REPORTMANAGEMENTCONSTANTS.disabledTicketCreation;
            // }
        }

        function openCommunicationListModal() {
            $uibModal.open({
                animation: true,
                templateUrl: 'app/entities/flair-bi/scheduler/communication-list/communication-list.html',
                size: 'lg',
                controller: 'CommunicationListController',
                controllerAs: 'vm',
                resolve: {
                    vizIdPrefix: function () {
                        return vm.vizIdPrefix;
                    },
                    report: function () {
                        return vm.scheduleObj;
                    },
                    webhookList: function () {
                        return vm.WebhookList;
                    }
                }
            }).result.then(function () { }, function () { });


        }

        function registerSetCommunicationList() {
            var setCommunicationList = $scope.$on(
                "flairbiApp:Scheduler:Set-Communication-List",
                function () {
                    var communicationList = CommunicationDispatcherService.getCommunicationList();
                    vm.scheduleObj.assign_report.communication_list.email = communicationList.emails;
                    vm.scheduleObj.assign_report.communication_list.teams = communicationList.webhooks;
                    vm.selectedUsers = [];
                    vm.selectedWebhook = [];
                    addWebhhokList(communicationList.webhooks);
                    addEmailList(communicationList.emails);
                    CommunicationDispatcherService.resetCommunicationList();
                }
            );
            $scope.$on("$destroy", setCommunicationList);
        }

        function getUrlParameter(name) {
            name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
            var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
            var results = regex.exec(location.search);
            return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
        };

        function validate() {
            vm.scheduleObj.queryDTO = buildQueryDTO(vm.visualMetaData);
            validateAndSetHaving();
            vm.isValidated = false;
            vm.query = null;
            vm.queryValidationError = null;

            var deferred = $q.defer();

            Visualmetadata.validate({}, {
                datasourceId: vm.scheduleObj.datasourceid,
                queryDTO: vm.scheduleObj.queryDTO,
                visualMetadataId: vm.scheduleObj.report_line_item.visualizationid,
                conditionExpression: vm.conditionExpression
            }).$promise
                .then(function (data) {
                    vm.isValidated = data.validationResultType === 'SUCCESS';
                    vm.query = data.rawQuery;
                    var validationError = null;
                    if (!vm.isValidated) {
                        validationError = QueryValidationService.getQueryValidationError(data.error);
                    }
                    if (validationError) {
                        vm.queryValidationError = $translate.instant(validationError.msgKey, validationError.params);
                    }
                    if (vm.isValidated) {
                        deferred.resolve();
                    } else {
                        deferred.reject();
                    }
                })
                .catch(function (error) {
                    vm.queryValidationError = $translate.instant('error.query.failed');
                    deferred.reject(error);
                });

            return deferred.promise;
        }
        function displayTextboxForValues() {
            vm.isCommaSeparatedInput = !vm.isCommaSeparatedInput;
            if (vm.selectedUsers && vm.selectedUsers.length > 0) {
                vm.commaSeparatedValues = vm.selectedUsers.map(function (elem) {
                    return elem.text.split(" ")[1];
                }).join(",");
            }
            vm.commaSeparatedToolTip = VisualDispatchService.setcommaSeparatedToolTip(vm.isCommaSeparatedInput);
        }

        function addToFilter() {
            if (vm.commaSeparatedValues && vm.commaSeparatedValues.length > 0) {
                vm.isCommaSeparatedInput = false;
                vm.selectedUsers = [];
                vm.scheduleObj.assign_report.communication_list.email = [];
                var getList = vm.commaSeparatedValues.split(',');
                getList = getList.filter((item, i, ar) => ar.indexOf(item) === i);
                getList.forEach(element => {
                    schedulerService.getUserNameByEmail(element).then(function (emailObj) {
                        added({ text: emailObj });
                        vm.selectedUsers.push({ text: emailObj });
                    });
                });
                vm.commaSeparatedToolTip = VisualDispatchService.setcommaSeparatedToolTip(vm.isCommaSeparatedUserInput);
            }
        }
    }
})();

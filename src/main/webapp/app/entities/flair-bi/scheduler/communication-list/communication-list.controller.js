(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('CommunicationListController', CommunicationListController);

    CommunicationListController.$inject = ['$scope','$stateParams','schedulerService','$rootScope','CommunicationDispatcherService','ChannelService','User'];

    function CommunicationListController($scope,$stateParams,schedulerService,$rootScope,CommunicationDispatcherService,ChannelService,User) {
        var vm = this;
        vm.added = added;
        vm.loadWebhooks=loadWebhooks;
        vm.loadUsers=loadUsers;
        vm.saveCommunicationList=saveCommunicationList;
        vm.vizIdPrefix = 'threshold_alert_:';
        activate();

        ////////////////

        function activate() {

            getScheduleReport($stateParams.id);
            vm.users = User.query();
            getWebhookList();
        }

        function getScheduleReport(id) {
            schedulerService.getScheduleReport(id)
                .then(function (success) {
                    vm.report = success.data.report;
                    addEmailList(vm.report.assign_report.communication_list.email);
                })
                .catch(function (error) {
                    $rootScope.showErrorSingleToast({
                        text: error.data.message,
                        title: "Error"
                    });
                });
        }

        function getWebhookList() {
            ChannelService.getTeamConfig(0)
                .then(function (success) {
                    vm.WebhookList = success.data;
                    addWebhookList(vm.report.assign_report.communication_list.teams);
                }).catch(function (error) {
                    var info = {
                        text: error.data.message,
                        title: "Error"
                    }
                    $rootScope.showErrorSingleToast(info);
                });
        }

        function addWebhookList(webhooks) {
            vm.webhooks = webhooks.map(function (item) {
                var newItem = {};
                var webhook = vm.WebhookList.filter(function (val) {
                    if (val.id == item) {
                        return val
                    }
                })
                newItem['text'] = webhook[0].webhookName;
                return newItem;
            });

            // vm.selectedWebhook = webhook.map(function (item) {
            //     var newItem = {};
            //     var webhook = vm.WebhookList.filter(function (val) {
            //         if (val.id == item) {
            //             return val
            //         }
            //     })
            //     newItem['text'] = webhook[0].webhookName;
            //     return newItem;
            // });
        }

        function addEmailList(emails) {
            vm.emails = emails.map(function (item) {
                var newItem = {};
                newItem['text'] = item.user_name + " " + item.user_email;
                return newItem;
            });
        }

        function added(tag) {
            console.log("-vm.selectedUser" + vm.selectedUsers);
            var emailObj = { "user_name": tag['text'].split(" ")[0], "user_email": tag['text'].split(" ")[1] };
            vm.report.assign_report.communication_list.email.push(emailObj);
        }

        function addWebhook(tag) {
            console.log("-vm.selectedUser" + vm.selectedWebhook);
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
            });
            var index = vm.scheduleObj.assign_report.communication_list.teams.indexOf(webhook[0].id);
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

        function loadWebhooks() {
            var retVal = vm.WebhookList.map(function (item) {
                return item.webhookName;
            });
            return retVal;
        }

        function loadUsers(q) {
            var retVal = vm.users.map(function (item) {
                return item.firstName + " " + item.email;
            });
            return retVal;
        }

        function saveCommunicationList(){
            var obj={};
            var vizId=addPrefix(vm.report.report_line_item.visualizationid);
            obj[vizId]={emails:vm.emails,webhooks:vm.webhooks};
            CommunicationDispatcherService.saveCommunicationList(obj);
        }

        function addPrefix(vizId) {
            return vm.report.report.thresholdAlert ? vm.vizIdPrefix + vizId : vizId;
        }

    }
})();

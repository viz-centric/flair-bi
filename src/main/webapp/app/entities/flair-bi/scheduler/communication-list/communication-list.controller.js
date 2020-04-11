(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .controller('CommunicationListController', CommunicationListController);

    CommunicationListController.$inject = ['$scope','$stateParams','$rootScope','CommunicationDispatcherService','webhookList','vizIdPrefix','report','$uibModalInstance','schedulerService'];

    function CommunicationListController($scope,$stateParams,$rootScope,CommunicationDispatcherService,webhookList,vizIdPrefix,report,$uibModalInstance,schedulerService) {
        var vm = this;
        vm.added = added;
        vm.removed=removed;
        vm.addWebhook=addWebhook;
        vm.removeWebhook=removeWebhook;
        vm.loadWebhooks=loadWebhooks;
        vm.loadUsers=loadUsers;
        vm.saveCommunicationList=saveCommunicationList;
        vm.vizIdPrefix = vizIdPrefix;
        vm.report=report;
        vm.webhookList=webhookList;
        vm.clear = clear;
        activate();

        ////////////////

        function activate() {
            vm.users = users;
            addEmailList(vm.report.assign_report.communication_list.email);
            addWebhookList(vm.report.assign_report.communication_list.teams);
        }

        function addWebhookList(webhooks) {
            vm.webhooks = webhooks.map(function (item) {
                var newItem = {};
                var webhook = vm.webhookList.filter(function (val) {
                    if (val.id == item) {
                        return val
                    }
                })
                newItem['text'] = webhook[0].webhookName;
                return newItem;
            });
        }

        function addEmailList(emails) {
            vm.emails = emails.map(function (item) {
                var newItem = {};
                newItem['text'] = item.user_name + " " + item.user_email;
                return newItem;
            });
        }

        function added(tag) {
            var emailObj = { "user_name": tag['text'].split(" ")[0], "user_email": tag['text'].split(" ")[1] };
            vm.report.assign_report.communication_list.email.push(emailObj);
        }

        function addWebhook(tag) {
            var webhook = vm.webhookList.filter(function (val) {
                if (val.webhookName == tag.text) {
                    return val
                }
            })
            vm.report.assign_report.communication_list.teams.push(webhook[0].id);
        }

        function removeWebhook(tag) {
            var webhook = vm.webhookList.filter(function (val) {
                if (val.webhookName == tag.text) {
                    return val
                }
            });
            var index = vm.report.assign_report.communication_list.teams.indexOf(webhook[0].id);
            if (index > -1) {
                vm.report.assign_report.communication_list.teams.splice(index, 1);
            }
        }

        function removed(tag) {
            var index = -1;
            vm.report.assign_report.communication_list.email.some(function (obj, i) {
                return obj.user_email == tag['text'].split(" ")[1] ? index = i : false;
            });
            if (index > -1) {
                vm.report.assign_report.communication_list.email.splice(index, 1);
            }
        }

        function loadWebhooks() {
            var retVal = vm.webhookList.map(function (item) {
                return item.webhookName;
            });
            return retVal;
        }

        function loadUsers(q) {
            return schedulerService.searchUsers(q,50);
        }

        function saveCommunicationList(){
            CommunicationDispatcherService.saveCommunicationList({emails:vm.report.assign_report.communication_list.email,webhooks:vm.report.assign_report.communication_list.teams});
            $rootScope.$broadcast("flairbiApp:Scheduler:Set-Communication-List");
            clear();
        }

        function clear() {
            $uibModalInstance.close();
        }

    }
})();

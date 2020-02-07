(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('adminListService', adminListService);

    adminListService.$inject = ['$http'];

    function adminListService($http) {

        var service = {
            getList: getList,
            getHomeList: getHomeList
        };
        var menuItems = [
            {
                image: "#admin-user-management",
                label: "User Management",
                href: "user-management",
                order: 0
            },
            {
                image: "#admin-permissions",
                label: "Permissions Management",
                href: "permission-management",
                order: 1
            },
            {
                image: "#admin-services",
                label: "Data Connection",
                href: "connection",
                order: 2
            },
            {
                image: "#admin-release-icon",
                label: "Releases",
                href: "release-management",
                order: 3
            },
            {
                image: "#admin-health",
                label: "Health Overview",
                href: "jhi-health",
                order: 4
            },
            {
                image: "#admin-configuration",
                label: "Configuration",
                href: "jhi-configuration",
                order: 5
            },
            {
                image: "#admin-audit",
                label: "Audits",
                href: "audits",
                order: 6
            },
            {
                image: "#admin-logs",
                label: "Logs",
                href: "logs",
                order: 7
            },
            {
                image: "#admin-metrics",
                label: "Metrics Overview",
                href: "jhi-metrics",
                order: 8
            },
            {
                image: "#visualization-colors",
                label: "Visualization Colors",
                href: "visualization-colors",
                order: 9
            },
            {
                image: "#new-email-report",
                label: "Report Management",
                href: "report-management",
                order: 11
            }

        ];

        var menuHomeItems = [
            {
                image: "#admin-release-icon",
                label: "Releases",
                href: "release-management",
                order: 3
            },
            {
                image: "#admin-health",
                label: "Health Overview",
                href: "jhi-health",
                order: 4
            },
            {
                image: "#admin-configuration",
                label: "Configuration",
                href: "jhi-configuration",
                order: 5
            },
            {
                image: "#admin-audit",
                label: "Audits",
                href: "audits",
                order: 6
            },
            {
                image: "#admin-logs",
                label: "Log Configuration",
                href: "logs",
                order: 7
            },
            {
                image: "#admin-metrics",
                label: "Metrics Overview",
                href: "jhi-metrics",
                order: 8
            },
            {
                image: "#visualization-colors",
                label: "Visualization Colors",
                href: "visualization-colors",
                order: 9
            },
            {
                image: "#admin-services",
                label: "Data Connection",
                href: "connection",
                order: 11
            },
            {
                image: "#new-email-report",
                label: "Report Management",
                href: "report-management",
                order: 12
            }
            
        ];

        return service;

        ////////////////
        function getList() {
            return menuItems;
        }
        function getHomeList() {
            return menuHomeItems;
        }



    }
})();

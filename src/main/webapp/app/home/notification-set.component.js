(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .component('notificationSetComponent', {
            templateUrl: 'app/home/notification-set.component.html',
            controller: notificationSetController,
            controllerAs: 'vm'
        });

    notificationSetController.$inject = ['$scope', '$state', 'alertsService', 'stompClientService', 'AuthServerProvider', 'schedulerService'];

    function notificationSetController($scope, $state, alertsService, stompClientService, AuthServerProvider, schedulerService) {
        var vm = this;
        vm.pageSize = 5;
        vm.setPage = setPage;
        vm.nextPage = nextPage;
        vm.prevPage = prevPage;
        vm.range = range;
        vm.noOfPages = 1;
        vm.currentPage = 0;
        vm.count = 0;
        vm.reports;

        active();

        function active() {
            // vm.alerts=vm.releaseAlert.alerts;
            // vm.count=vm.releaseAlert.count;
            connectWebSocket();
            getScheduledReportsCount();
            vm.reports=[
                {
                    "report": {
                        "userid": "flairadmin",
                        "connection_name": "Ecommerce",
                        "source_id": "1715917d-fff8-44a1-af02-ee2cd41a3609",
                        "mail_body": "This is a test email to check api functionality",
                        "subject": "Report : Pie Chart : Tue May 14 08:55:04 IST 2019",
                        "report_name": "Pie-Chart-f896fbc01af901edec520880b30018f5--47b5f320-bebe-4da2-884e-6c304e4bc11e",
                        "title_name": "Pie Chart"
                    },
                    "report_line_item": {
                        "visualizationid": "6b6439ed7bc10719a8cab6427b0009af--62038af8-4834-457c-8786-724a4982aea0",
                        "dimension": [
                            "order_item_id"
                        ],
                        "measure": [
                            "product_price"
                        ],
                        "visualization": "Pie Chart"
                    },
                    "assign_report": {
                        "channel": "email",
                        "slack_API_Token": null,
                        "channel_id": null,
                        "stride_API_Token": null,
                        "stride_cloud_id": null,
                        "stride_conversation_id": null,
                        "condition": "test",
                        "email_list": [
                            {
                                "user_email": "flairadmin@localhost",
                                "user_name": "Administrator Administrator"
                            }
                        ]
                    },
                    "schedule": {
                        "cron_exp": "*/1 * * * *",
                        "timezone": "",
                        "start_date": "2019-05-12T18:30:00.000Z",
                        "end_date": "2019-05-25T18:30:00.000Z"
                    },
                    "query": "{\"queryId\":\"f896fbc01af901edec520880b30018f5--47b5f320-bebe-4da2-884e-6c304e4bc11e\",\"userId\":\"flairadmin\",\"sourceId\":\"1715917d-fff8-44a1-af02-ee2cd41a3609\",\"source\":\"Ecommerce\",\"fields\":[\"order_item_id\",\"COUNT(product_price) as product_price\"],\"groupBy\":[\"order_item_id\"],\"limit\":\"20\",\"conditionExpressions\":[{\"sourceType\":\"FILTER\",\"expressionType\":\"CONTAINS\",\"conditionExpression\":\"{\\\"values\\\":[\\\"1\\\",\\\"2\\\",\\\"3\\\",\\\"4\\\",\\\"5\\\",\\\"6\\\",\\\"7\\\"],\\\"featureName\\\":\\\"order_item_id\\\",\\\"uuid\\\":\\\"a7d48606-6665-49bf-bc51-be217f4250ef\\\"}\",\"andOrExpressionType\":{}}]}"
                },
                {
                    "report": {
                        "userid": "flairadmin",
                        "connection_name": "Sales",
                        "source_id": "1715917d-fff8-44a1-af02-ee2cd41a3609",
                        "mail_body": "This is a test email to check api functionality",
                        "subject": "Report : Clustered Vertical Bar Chart : Sat May 18 13:33:30 IST 2019",
                        "report_name": "Clustered-Vertical-Bar-Chart-e98586e122bff1756c53ade348000f4f--30e832c5-0ade-41ee-ab80-4065a3af283e",
                        "title_name": "Clustered Vertical Bar Chart"
                    },
                    "report_line_item": {
                        "visualizationid": "e98586e122bff1756c53ade348000f4f--30e832c5-0ade-41ee-ab80-4065a3af283e",
                        "dimension": [
                            "Transaction_date"
                        ],
                        "measure": [
                            "Price"
                        ],
                        "visualization": "Clustered Vertical Bar Chart"
                    },
                    "assign_report": {
                        "channel": "email",
                        "slack_API_Token": null,
                        "channel_id": null,
                        "stride_API_Token": null,
                        "stride_cloud_id": null,
                        "stride_conversation_id": null,
                        "condition": "test",
                        "email_list": [
                            {
                                "user_email": "flairadmin@localhost",
                                "user_name": "Administrator Administrator"
                            }
                        ]
                    },
                    "schedule": {
                        "cron_exp": "*/1 * * * *",
                        "timezone": "",
                        "start_date": "2019-05-13T18:30:00.000Z",
                        "end_date": "2019-05-22T18:30:00.000Z"
                    },
                    "query": "{\"queryId\":\"e98586e122bff1756c53ade348000f4f--30e832c5-0ade-41ee-ab80-4065a3af283e\",\"userId\":\"flairadmin\",\"sourceId\":\"1715917d-fff8-44a1-af02-ee2cd41a3609\",\"source\":\"Sales\",\"fields\":[\"Transaction_date\",\"COUNT(Price) as Price\"],\"groupBy\":[\"Transaction_date\"],\"limit\":\"20\"}"
                }
            ];//getScheduleReports(10,0)

            var data = [{
                city: 'Kathmandu',
                area: 120,
                population: 200
            }, {
                city: 'Delhi',
                area: 90,
                population: 360
            }, {
                city: 'Detroit',
                area: 310,
                population: 47
            }, {
                city: 'London',
                area: 140,
                population: 440
            }
            ];

            var config = {
                dimension: ['city'],
                measure: ['area', 'population'],
                showLegend: false, // true|false
                legendPosition: 'bottom', // top|bottom|right|left
                "showXaxis": false,
                "showXaxisLabel": false,
                "showYaxis": false,
                "showXaxisLabel": false,
                "showYaxisLabel": false,
                "xAxisColor": "#ff0000",
                "yAxisColor": "#00ff00",
                "showGrid": true,
                "stacked": false,
                "displayName": "Dimension 1",
                "showValues": [true, true],
                "displayNameForMeasure": ["Measure 1", "Measure 2"],
                "fontStyle": ["italic", "bold"],
                "fontWeight": ["bold", "900"],
                "numberFormat": ["Actual", "Actual"],
                "textColor": ["#e06a6a", "#00ff00"],
                "displayColor": ["", ""],
                "borderColor": ["", ""],
                "fontSize": ["9", "9"]
            };

            var ClusteredVertical = d3.select("#ClusteredVertical");

            var clusteredverticalbar = flairVisualizations.clusteredverticalbar()
                .config(config)
                .tooltip(true)
                .print(false);

            ClusteredVertical.datum(data)
                .call(clusteredverticalbar);


            var ClusteredHorizontal = d3.select("#ClusteredHorizontal");

            var div = d3.select(ClusteredHorizontal.node().parentNode)
            var tooltip = div.append('div')
                .attr('class', 'custom_tooltip');

            var clusteredhorizontalbar = flairVisualizations.clusteredhorizontalbar()
                .config(config)
                .tooltip(true)
                .print(true);

            ClusteredHorizontal.datum(data)
                .call(clusteredhorizontalbar);



            var StackedVertical = d3.select("#StackedVertical");

            var div = d3.select(StackedVertical.node().parentNode)
            var tooltip = div.append('div')
                .attr('class', 'custom_tooltip');

            var stackedverticalbar = flairVisualizations.stackedverticalbar()
                .config(config)
                .tooltip(true)
                .print(true);

            StackedVertical.datum(data)
                .call(stackedverticalbar);


            var StackedHorizontal = d3.select("#StackedHorizontal");

            var div = d3.select(StackedHorizontal.node().parentNode)
            var tooltip = div.append('div')
                .attr('class', 'custom_tooltip');

            var stackedhorizontalbar = flairVisualizations.stackedhorizontalbar()
                .config(config)
                .tooltip(true)
                .print(false)
                .notification(true);

            StackedHorizontal.datum(data)
                .call(stackedhorizontalbar);
        }


        function getScheduleReports(pageSize, page) {
            schedulerService.getScheduleReports(pageSize, page);
        }

        function onGetReleaseAlertsError(error) {

        }

        function range(start, end) {
            var ret = [];
            if (!end) {
                end = start;
                start = 0;
            }
            for (var i = start; i < end; i++) {
                ret.push(i);
            }
            return ret;
        };

        function prevPage() {
            if (vm.currentPage > 0) {
                vm.currentPage--;
                getScheduleReports(vm.pageSize, vm.currentPage);
            }
        };

        function nextPage() {
            if (vm.currentPage < vm.noOfPages - 1) {
                vm.currentPage++;
                getScheduleReports(vm.pageSize, vm.currentPage);
            }
        };

        function setPage(n) {
            vm.currentPage = n;
            getScheduleReports(vm.pageSize, vm.currentPage);
        };
        function connectWebSocket() {
            console.log('notificationSetController connect web socket');
            stompClientService.connect(
                { token: AuthServerProvider.getToken() },
                function (frame) {
                    console.log('notificationSetController connected web socket');
                    stompClientService.subscribe("/user/exchange/scheduledReports", onExchangeMetadata);
                    stompClientService.subscribe("/user/exchange/metaDataError", onExchangeMetadataError);
                }
            );

            $scope.$on("$destroy", function (event) {
                console.log('flair-bi controller destorying web socket');
                stompClientService.disconnect();
            });
        }

        function onExchangeMetadataError(data) {
            console.log('notificationSetController on metadata error', data);
        }

        function onExchangeMetadata(data) {
            console.log('notificationSetController on metadata', data);
            var metaData = JSON.parse(data.body);
        }

        function getScheduledReportsCount() {
            schedulerService.getScheduledReportsCount().then(function (result) {
                vm.count = result.data;
                vm.noOfPages = Math.ceil(vm.count / vm.pageSize);
            }, onGetScheduledReportsCountError);
        }

        function onGetScheduledReportsCountError(error) {

        }
    }
})();

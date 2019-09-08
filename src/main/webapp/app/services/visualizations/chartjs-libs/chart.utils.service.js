(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('ChartUtils', ChartUtils);

    ChartUtils.$inject = ['VisualizationUtils'];

    function ChartUtils(VisualizationUtils) {
        // Font color for values inside the bar
        var insideFontColor = '255,255,255';
        // Font color for values above the bar
        var outsideFontColor = '0,0,0';
        // How close to the top edge bar can be before the value is put inside it
        var topThreshold = 20;

        var valuesConverter = {
            sanitizeValueOnPoint: function (data, type) {
                switch (type) {
                    case "K":
                        return valuesConverter.convertToThousands(data);
                    case "M":
                        return valuesConverter.convertToMillions(data);
                    case "B":
                        return valuesConverter.convertToBillions(data);
                    case "Percent":
                        return valuesConverter.convertToPercentage(data);
                    default:
                        return data;
                }
            },
            convertToThousands: function (value) {
                return (value / 1000).toFixed(2) + " K";
            },
            convertToMillions: function (value) {
                return (value / 1000000).toFixed(2) + " M";
            },
            convertToBillions: function (value) {
                return (value / 1000000000).toFixed(2) + " B";
            },
            convertToPercentage: function (value) {
                return (value / 100).toFixed(2) + " %";
            }
        }

        var utils = {
            setDefaultColorOnNull: function (color) {
                if (color) {
                    return 'rgba(0,0,0,0.3)';
                }
                return color;
            },

            getDisplayColorsByExpression: function (colorExpression) {
                var backgroundColors = [];
                var evalExpr = '';
                try {
                    evalExpr = (colorExpression.replace(/!value/g, item)).replace('"', "'");
                    backgroundColors.push(eval(evalExpr)); // This can cause Cross Site Scripting user can enter code, please test it out

                } catch (e) {
                    var sm = [];
                    sm.text = [];
                    sm.title = record.titleProperties.titleText + ' : ' + record.id;
                    sm.text.push('Field : ' + measure.name);
                    sm.text.push('Property : Display Colour Expression');
                    sm.text.push('Error : ' + e.message);
                    sm.text.push('Info : Check console log!');
                    $rootScope.showErrorToast(sm);
                }
                return backgroundColors;
            },

            getBackgroundColors: function (formattedData, item, index, record) {
                var backgroundColors = new Array;
                if (formattedData.measures[index].vProperties.displayColorExpression) {
                    backgroundColors = utils.getDisplayColorsByExpression(item, record);
                } else {
                    backgroundColors = utils.setDefaultColorOnNull(item.vProperties.displayColor);
                }
                return backgroundColors;
            },

            getPieChartBackgroundColors: function (record) {
                var backgroundColors = new Array;
                backgroundColors.push('#ff7473', '#9055A2', '#47b8e0', '#34314c', '#F68657', '#ef5285', '#60c5ba', '#feee7d', '#a5d296', '#AF4034');
                return backgroundColors;
            },

            getBarChartDatasets: function (record) {
                var data = record.data;
                var chartDataSets = new Array;
                var isHorizontalBar = VisualizationUtils.getPropertyValue(record.properties, 'Bar Type') == 'Horizontal' ? true : false;
                var measureFields = utils.getMeasureFields(record);
                measureFields.forEach(function (item, index) {
                    var dataset = {};
                    dataset.label = VisualizationUtils.getPropertyValue(item.properties, 'Display name');
                    dataset.data = utils.getDimensionOrMeasuresDataAsArray(data, item.feature.name.toLowerCase());
                    dataset.defaultColor = VisualizationUtils.getPropertyValue(item.properties, 'Display colour');
                    dataset.backgroundColor = data.map(function(d) { return VisualizationUtils.getPropertyValue(item.properties, 'Display colour'); });
                    dataset.valueOnPoints = VisualizationUtils.getPropertyValue(item.properties, 'Value on Points');
                    dataset.fontStyle = VisualizationUtils.getPropertyValue(item.properties, 'Font style');
                    dataset.fontWeight = VisualizationUtils.getPropertyValue(item.properties, 'Font weight');
                    dataset.textColor = VisualizationUtils.getPropertyValue(item.properties, 'Text colour');
                    dataset.numberFormat = VisualizationUtils.getPropertyValue(item.properties, 'Number format');
                    dataset.borderColor = VisualizationUtils.getPropertyValue(item.properties, 'Border colour');
                    dataset.borderWidth = 1;
                    chartDataSets.push(dataset);
                })

                return chartDataSets;
            },

            getLineChartDatasets: function (record) {
                var data = record.data;
                var chartDataSets = new Array;
                var measureFields = utils.getMeasureFields(record);
                var dimensionField = utils.getDimensionField(record);
                measureFields.forEach(function (item, index) {
                    var dataset = {};
                    dataset.label = VisualizationUtils.getPropertyValue(item.properties, 'Display name');
                    dataset.dimensionData = utils.getDimensionOrMeasuresDataAsArray(data, dimensionField.feature.name.toLowerCase());
                    dataset.data = utils.getDimensionOrMeasuresDataAsArray(data, item.feature.name.toLowerCase());
                    dataset.fill = VisualizationUtils.getPropertyValue(item.properties, 'Line Type').toLowerCase() == 'area' ? true : false;
                    dataset.backgroundColor = VisualizationUtils.getPropertyValue(item.properties, 'Display colour');
                    dataset.valueOnPoints = VisualizationUtils.getPropertyValue(item.properties, 'Value on Points');
                    dataset.fontStyle = VisualizationUtils.getPropertyValue(item.properties, 'Font style');
                    dataset.fontWeight = VisualizationUtils.getPropertyValue(item.properties, 'Font weight');
                    dataset.textColor = VisualizationUtils.getPropertyValue(item.properties, 'Text colour');
                    dataset.numberFormat = VisualizationUtils.getPropertyValue(item.properties, 'Number format');
                    dataset.borderColor = VisualizationUtils.getPropertyValue(item.properties, 'Border colour');
                    dataset.borderWidth = 2;
                    dataset.defaultPointStyle = VisualizationUtils.getPropertyValue(item.properties, 'Line Chart Point type').toLowerCase();
                    dataset.pointStyle = data.map(function(d) { return VisualizationUtils.getPropertyValue(item.properties, 'Line Chart Point type').toLowerCase(); });
                    chartDataSets.push(dataset);
                })

                return chartDataSets;
            },

            getPieChartDatasets: function (record) {
                var data = record.data;
                var chartDataSets = new Array;
                var measureFields = utils.getMeasureFields(record);
                var dimensionField = utils.getDimensionField(record);

                measureFields.forEach(function (item, index) {
                    var dataset = {};
                    dataset.label = VisualizationUtils.getPropertyValue(item.properties, 'Display name');
                    dataset.dimensionData = utils.getDimensionOrMeasuresDataAsArray(data, dimensionField.feature.name.toLowerCase());
                    dataset.data = utils.getDimensionOrMeasuresDataAsArray(data, item.feature.name.toLowerCase());
                    dataset.defaultBackgroundColor = utils.getPieChartBackgroundColors(record);
                    dataset.backgroundColor = utils.getPieChartBackgroundColors(record);
                    chartDataSets.push(dataset);
                })
                return chartDataSets;
            },

            getComboChartDatasets: function (record) {
                var data = record.data;
                var chartDataSets = new Array;
                var measureFields = utils.getMeasureFields(record);
                var dimensionField = utils.getDimensionField(record);

                measureFields.forEach(function (item, index) {
                    var dataset = {};
                    dataset.label = VisualizationUtils.getPropertyValue(item.properties, 'Display name');
                    dataset.dimensionData = utils.getDimensionOrMeasuresDataAsArray(data, dimensionField.feature.name.toLowerCase());
                    dataset.data = utils.getDimensionOrMeasuresDataAsArray(data, item.feature.name.toLowerCase());
                    dataset.defaultColor = VisualizationUtils.getPropertyValue(item.properties, 'Display colour');
                    dataset.backgroundColor = data.map(function(d) { return VisualizationUtils.getPropertyValue(item.properties, 'Display colour'); });
                    dataset.valueOnPoints = VisualizationUtils.getPropertyValue(item.properties, 'Value on Points');
                    dataset.fontStyle = VisualizationUtils.getPropertyValue(item.properties, 'Font style');
                    dataset.fontWeight = VisualizationUtils.getPropertyValue(item.properties, 'Font weight');
                    dataset.textColor = VisualizationUtils.getPropertyValue(item.properties, 'Text colour');
                    dataset.numberFormat = VisualizationUtils.getPropertyValue(item.properties, 'Number format');
                    dataset.type = VisualizationUtils.getPropertyValue(item.properties, 'Combo chart type').toLowerCase();
                    if(dataset.type == 'line')
                        dataset.fill = VisualizationUtils.getPropertyValue(item.properties, 'Line Type').toLowerCase() == 'area' ? true : false;
                    dataset.borderColor = VisualizationUtils.getPropertyValue(item.properties, 'Border colour');
                    dataset.borderWidth = 1;
                    dataset.defaultPointStyle = VisualizationUtils.getPropertyValue(item.properties, 'Line Chart Point type').toLowerCase();
                    dataset.pointStyle = data.map(function(d) { return VisualizationUtils.getPropertyValue(item.properties, 'Line Chart Point type').toLowerCase(); });
                    chartDataSets.push(dataset);
                })

                return chartDataSets;
            },

            getDimensionField: function (record) {
                return record.fields.filter(function (field) {
                    return field.feature != null && field.fieldType.featureType === 'DIMENSION';
                })[0];
            },

            getMeasureFields: function (record) {
                return record.fields.filter(function (field) {
                    return field.feature != null && field.fieldType.featureType === 'MEASURE';
                });
            },

            getDimensionOrMeasuresDataAsArray: function (data, name) {
                var arrayData = new Array;
                data.forEach(function (item, index) {
                    arrayData.push(item[name]);
                })
                return arrayData;
            },

            getYAxisLabelsAsCSV: function (record) {
                var measureList = utils.getMeasureFields(record).map(function (field) {
                    return VisualizationUtils.getPropertyValue(field.properties, 'Display name');
                });
                return measureList.join(", ");
            },

            drawValue: function (context, step, record) {
                switch (record.metadataVisual.name) {
                    case "Bar Chart":
                        utils.constructBarChartValueOnPoints(context, step, record);
                        break;
                    case "Line Chart":
                        utils.constructLineChartValueOnPoints(context, step, record);
                        break;
                    case "Combo Chart":
                        utils.constructComboChartValueOnPoints(context, step, record);
                        break;
                    default:
                        console.log("Something went wrong");
                }
            },

            constructBarChartValueOnPoints: function (context, step, record) {
                var isHorizontalBar = VisualizationUtils.getPropertyValue(record.properties, 'Bar Type') == 'Horizontal' ? true : false;
                var stackedBar = VisualizationUtils.getPropertyValue(record.properties, 'Stacked');
                var ctx = context.chart.ctx;
                if (!stackedBar) {
                    context.data.datasets.forEach(function (dataset, index) {
                        if (context.legend.legendItems[index].hidden != true) {
                            for (var i = 0; i < dataset.data.length; i++) {
                                if (dataset.valueOnPoints) {
                                    var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model;
                                    var textY = (model.y > topThreshold) ? model.y - 3 : model.y + 20;
                                    ctx.font = dataset.fontStyle + ' ' + dataset.fontWeight + ' ' + ctx.font;
                                    ctx.fillStyle = dataset.textColor;
                                    var x = model.x;
                                    var y = textY;
                                    if (isHorizontalBar) {
                                        utils.injectValueOnPointsText(ctx, 'left', 'center', valuesConverter.sanitizeValueOnPoint(dataset.data[i], dataset.numberFormat), x + 5, y - 5);
                                    } else {
                                        utils.injectValueOnPointsText(ctx, 'center', 'bottom', valuesConverter.sanitizeValueOnPoint(dataset.data[i], dataset.numberFormat), x, y);
                                    }
                                }
                            }
                        }
                    });
                } else {
                    /* Code need to be cleaned up if bar type is stacked then all the options for value on points to be displayed in chart properties instead
                    of field properties*/
                    var aggregatedData = new Array;
                    var datasets = context.data.datasets;
                    datasets.forEach(function (dataset, index) {
                        if (dataset.valueOnPoints) {
                            aggregatedData.push(dataset.data);
                        }
                    });
                    var sum = function sum(r, a) {
                        return r.map(function (b, i) {
                            return a[i] + b;
                        });
                    };
                    if (aggregatedData.length > 0) {
                        var result = aggregatedData.reduce(sum);
                        for (var i = 0; i < result.length; i++) {
                            var model = datasets[0]._meta[Object.keys(datasets[0]._meta)[0]].data[i]._model;
                            var textY = (model.y > topThreshold) ? model.y - 3 : model.y + 20;
                            ctx.font = datasets[0].fontStyle + ' ' + datasets[0].fontWeight + ' ' + ctx.font;
                            ctx.fillStyle = datasets[0].textColor;
                            var x = model.x;
                            var y = textY;
                            if (isHorizontalBar) {
                                utils.injectValueOnPointsText(ctx, 'left', 'center', valuesConverter.sanitizeValueOnPoint(result[i], datasets[0].numberFormat), x + 5, y - 5);
                            } else {
                                utils.injectValueOnPointsText(ctx, 'center', 'bottom', valuesConverter.sanitizeValueOnPoint(result[i], dataset[0].numberFormat), x, y);
                            }
                        }
                    }
                }
            },

            constructLineChartValueOnPoints: function (context, step, record) {
                utils.constructValueOnPoints(context, step, record);
            },

            constructComboChartValueOnPoints: function (context, step, record) {
                utils.constructValueOnPoints(context, step, record);
            },

            constructValueOnPoints: function (context, step, record) {
                var ctx = context.chart.ctx;
                context.data.datasets.forEach(function (dataset, index) {
                    if (context.legend.legendItems[index].hidden != true) {
                        for (var i = 0; i < dataset.data.length; i++) {
                            if (dataset.valueOnPoints) {
                                var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model;
                                var textY = (model.y > topThreshold) ? model.y - 3 : model.y + 20;
                                ctx.font = dataset.fontStyle + ' ' + dataset.fontWeight + ' ' + ctx.font;
                                ctx.fillStyle = dataset.textColor;
                                var x = model.x;
                                var y = textY;
                                utils.injectValueOnPointsText(ctx, 'center', 'bottom', valuesConverter.sanitizeValueOnPoint(dataset.data[i], dataset.numberFormat), x, y);
                            }
                        }
                    }
                });
            },

            injectValueOnPointsText: function (ctx, textAlign, baseLine, data, x, y) {
                ctx.textAlign = textAlign
                ctx.textBaseline = baseLine
                ctx.fillText(data, x, y);
            },

            initializeChartjsCanvas: function(element, record){
                element.find('.chartjs-canvas-wrapper').remove();
                element.append('<div class="chartjs-canvas-wrapper"><canvas id="canvas' + record.id + '" style="padding:15px;"></canvas></div>');
            }

        };

        return utils;
    }

})();

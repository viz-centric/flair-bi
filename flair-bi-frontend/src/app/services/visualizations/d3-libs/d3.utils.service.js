import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .factory('D3Utils', D3Utils);

D3Utils.$inject = ['VisualizationUtils', 'VisualizationColors'];

function D3Utils(VisualizationUtils, VisualizationColors) {
    var colorset = [];
    VisualizationColors.query(function (result) {
        for (var index = 0; index < result.length; index++) {
            colorset.push(result[index].code)
        }
    });
    var privateMethods = {
        _verifyPrecision: function (precision) {
            if (precision < 0 || precision > 20) {
                throw new RangeError("Formatter precision must be between 0 and 20");
            }
            if (precision !== Math.floor(precision)) {
                throw new RangeError("Formatter precision must be an integer");
            }
        }
    };

    var helper = {

        title: function (str) {
            var r = '';
            r = str.charAt(0).toUpperCase() + str.substring(1);
            return r;
        },

        convertToNumber: function (str) {
            return parseFloat(str.replace(/,/g, ''));
        },

        constrainTooltip: function (container, tooltip, LeftPosition) {
            var left = container.offsetLeft,
                width = container.offsetWidth,
                height = container.offsetHeight,
                top = 0;

            var tipLeft = tooltip.offsetLeft,
                tipWidth = tooltip.offsetWidth,
                tipHeight = tooltip.offsetHeight,
                tipTop = tooltip.offsetTop;

            if (tipLeft < left) {
                tooltip.style.left = left + "px";
            }
            if (tipLeft + tipWidth > left + width) {
                tooltip.style.left = LeftPosition + 'px';
            }
            if (tipTop < top) {
                tooltip.style.top = top + "px";
            }
            if (tipTop + tipHeight > top + height) {
                tooltip.style.top = (top + height - tipHeight) + 'px';
            }
        },

        positionDownArrow: function (container, arrowDom, sortType) {
            var left = container.offsetLeft,
                width = container.offsetWidth,
                height = container.offsetHeight,
                top = 0;

            var offsetLeft,
                offsetTop = 40;

            switch (sortType.toLowerCase()) {
                case "ascending":
                    offsetLeft = 78;
                    break;

                case "descending":
                    offsetLeft = 54;
                    break;
            }

            arrowDom.style.left = (left + width - offsetLeft) + 'px';
            arrowDom.style.top = (top + height - offsetTop) + 'px';
        },

        positionSortSelection: function (container, sortSelectDom) {
            var left = container.offsetLeft,
                width = container.offsetWidth,
                height = container.offsetHeight,
                top = 0;

            var tipWidth = sortSelectDom.offsetWidth,
                tipHeight = sortSelectDom.offsetHeight;

            var offsetLeft = 11,
                offsetTop = 40;

            sortSelectDom.style.left = (left + width - tipWidth - offsetLeft) + 'px';
            sortSelectDom.style.top = (top + height - tipHeight - offsetTop) + 'px';
        },

        getSum: function (data, key) {
            var sum = 0;

            data.forEach(function (d) {
                sum += d[key];
            });

            return sum;
        },

        getNames: function (arr) {
            return arr.map(function (item) {
                return item.feature.name;
            });
        },

        getExpressionConfig: function (expression, args) {
            var config = [],
                temp,
                obj;

            if (!expression) {
                return [];
            }

            expression = expression.split('|');

            expression.forEach(function (item) {
                obj = {};
                temp = item.split(',').map(function (c) { return c.trim(); });
                obj[temp[0].toLowerCase()] = parseInt(temp[1]);
                args.forEach(function (arg, i) {
                    obj[arg] = temp[i + 2];
                });
                config.push(obj);
            });

            return config;
        },

        getTruncatedLabel: function (element, label, containerLength, offset) {
            if (typeof (label) === 'undefined') {
                return "";
            }

            if (label === null) {
                label = "null";
            }

            label = label.toString();

            if (offset === void 0) {
                offset = 0;
            }

            offset += 3;

            var truncLabel = label,
                arr = label.split('');

            if (containerLength < element.getComputedTextLength()) {
                var charLength = parseInt(containerLength * element.getNumberOfChars() / element.getComputedTextLength()) - offset;
                charLength = (charLength < 0) ? 0 : charLength;
                truncLabel = arr.splice(0, charLength).join('') + '...';
            }

            return truncLabel;
        },

        getTruncatedTick: function (label, containerLength, scale) {
            if (typeof (label) === 'undefined') {
                return "";
            }

            if (label === null) {
                label = "null";
            }

            label = label.toString();

            var truncLabel = label,
                arr = label.split('');

            if (scale != undefined && scale.invert(label.length) >= containerLength) {
                var charLength = Math.floor(scale(containerLength)) - 3;
                charLength = (charLength < 0) ? 0 : charLength;
                truncLabel = arr.splice(0, charLength).join('') + '...';
            }

            return truncLabel;
        },

        getTickRotate: function (label, containerLength, scale) {
            var isRotate = false;
            if (typeof (label) === 'undefined') {
                return isRotate;
            }

            if (scale != undefined && scale.invert(label.length) >= containerLength) {
                isRotate = true;
            }
            return isRotate;
        },

        getNumberFormatter: function (si) {
            var result;

            var siMapper = {
                "K": "1e3",
                "M": "1e6",
                "B": "1e9",
            };

            switch (si) {
                case "Actual":
                    result = d3.format('');
                    break;
                case "Percent":
                    result = d3.format('.0%');
                    break;
                default:
                    result = d3.formatPrefix('.2s', siMapper[si]);
                    break;
            }

            return result;
        },

        getFormattedValue: function (value, numberFormat) {
            value = numberFormat(value);

            if (value.indexOf("G") != -1) {
                value = value.slice(0, -1) + " B";
            } else if (value.indexOf("M") != -1) {
                value = value.slice(0, -1) + " M";
            } else if (value.indexOf("k") != -1) {
                value = value.slice(0, -1) + " K";
            } else if (value.indexOf("%") != -1) {
                value = value.slice(0, -1) + " %";
            }

            return value;
        },

        roundNumber: function (num, scale) {
            if (typeof (scale) == 'undefined') {
                throw "Scale is not specified";
            }

            var exp1 = "e+" + scale,
                exp2 = "e-" + scale;

            return +(Math.round(num + exp1) + exp2);
        },

        shortScale: function (precision) {
            if (precision === void 0) { precision = 3; }
            privateMethods._verifyPrecision(precision);
            var suffixes = "KMBTQ";
            var fixedFormatter = d3.format("." + precision + "f");
            var exponentFormatter = d3.format("." + precision + "e");

            var max = Math.pow(10, (3 * (suffixes.length + 1)));
            var min = Math.pow(10, -precision);
            return function (num) {
                var absNum = Math.abs(num);
                if ((absNum < min || absNum >= max) && absNum !== 0) {
                    return exponentFormatter(num);
                }
                var idx = -1;
                while (absNum >= Math.pow(1000, idx + 2) && idx < (suffixes.length - 1)) {
                    idx++;
                }
                var output = "";
                if (idx === -1) {
                    output = fixedFormatter(num);
                    output = parseFloat(output).toString();
                }
                else {
                    output = fixedFormatter(num / Math.pow(1000, idx + 1));
                    output = parseFloat(output) + suffixes[idx];
                }

                if ((num > 0 && output.substr(0, 4) === "1000") || (num < 0 && output.substr(0, 5) === "-1000")) {
                    if (idx < suffixes.length - 1) {
                        idx++;
                        output = fixedFormatter(num / Math.pow(1000, idx + 1));
                        output = parseFloat(output) + suffixes[idx];
                    }
                    else {
                        output = exponentFormatter(num);
                    }
                }
                return output;
            };
        },

        sortData: function (data, keys, sortOrder) {
            if (typeof (keys) == 'string') {
                // If keys is string then convert it to array
                keys = [keys];
            }

            // keys must be array type with some entry
            if (typeof (keys.length) == 'undefined') {
                throw "Unsupported data type";
            } else if (keys.length == 0) {
                throw "Empty value exception";
            }

            if (typeof (sortedData) == 'undefined') {
                sortedData = "ascending";
            }

            var sortedData = jQuery.extend(true, [], data); // deep copy

            var _sorter = function (x, y, index) {
                if (typeof (keys[index]) == 'undefined') {
                    return 0;
                }

                return x[keys[index]] > y[keys[index]] ? 1 : x[keys[index]] < y[keys[index]] ? -1 : _sorter(x, y, index + 1);
            }

            if (sortOrder == 'ascending') {
                sortedData.sort(function (x, y) {
                    return _sorter(y, x, 0);
                });
            } else if (sortOrder == 'descending') {
                sortedData.sort(function (x, y) {
                    return _sorter(x, y, 0);
                });
            }

            return sortedData;
        },

        prepareFilterButtons: function (div, $rootScope, filterParametersService) {
            var confirm = div.append('div')
                .attr('class', 'confirm');

            confirm.append('button')
                .attr('class', 'btn btn-filters btn-primary')
                .html('<i class="fa fa-check"></i>')
                .on('click', function () {
                    $rootScope.updateWidget = {};
                    $rootScope.filterSelection.id = null;
                    $rootScope.$broadcast('flairbiApp:filter-input-refresh');
                    $rootScope.$broadcast('flairbiApp:filter');
                    $rootScope.$broadcast('flairbiApp:filter-add');
                    d3.select(this.parentNode)
                        .style('visibility', 'hidden');
                });

            confirm.append('button')
                .attr('class', 'btn btn-filters btn-default')
                .html('<i class="fa fa-times"></i>')
                .on('click', function () {
                    filterParametersService.clear();
                    $rootScope.$broadcast('flairbiApp:filter-input-refresh');
                    $rootScope.$broadcast('flairbiApp:filter');
                    d3.select(this.parentNode)
                        .style('visibility', 'hidden');
                });
        },

        getDefaultColorset: function () {
            return colorset;
        },

        contentTooltip: function (visibility, scope, element, displayName, dimension, measures, measuresFormate) {
            var tooltip = d3.select(scope.container).select('.tooltip_custom');

            if (visibility == 'visible') {
                element.style('cursor', 'pointer');

                tooltip.html((function () {
                    return '<table><tr><td>' + displayName + ':</td><td class="tooltipData"> ' + dimension + '</td></tr>'
                        + '<tr><td>' + measures + ':</td><td class="tooltipData"> ' + measuresFormate + '<td></tr></table>';
                })());
            } else {
                element.style('cursor', 'default');
            }

            var offset = $(scope.container).offset();
            var x = d3.event.pageX - offset.left,
                y = d3.event.pageY - offset.top;

            tooltip.style('top', y + 'px').style('left', x + 'px');
            tooltip.style('visibility', visibility);
            this.constrainTooltip(scope.container, tooltip.node(), d3.event.pageY);
        },

        legendPosition: function (me, i, legendBreakCount, legendBreak) {
            var count = i,
                widthSum = 0,
                legendBreak = legendBreak,
                legendBreakCount = legendBreakCount;
            while (count-- != 0) {
                widthSum += d3.select(me.container).select('#legend' + count).node().getBBox().width + 3 * me.offsetY;
            }
            if ((widthSum + 100) > me.container.offsetWidth) {

                widthSum = 0;
                if (legendBreak == 0) {
                    legendBreak = i;
                    legendBreakCount = legendBreakCount + 1;
                }
                if (i == (legendBreak * (legendBreakCount + 1))) {
                    legendBreakCount = legendBreakCount + 1;
                }
                var newcount = i - (legendBreak * legendBreakCount);
                while (newcount-- != 0) {
                    widthSum += d3.select(me.container).select('#legend' + newcount).node().getBBox().width + 3 * me.offsetY;
                }
                return widthSum + ', ' + legendBreakCount * 20 + ',' + legendBreakCount + ',' + legendBreak;
            }
            return widthSum + ', ' + (me.helper.getLegendPosition() == 'top' ? 0 : containerHeight) + ',' + legendBreakCount + ',' + legendBreak;
        }
    }

    return helper;
}
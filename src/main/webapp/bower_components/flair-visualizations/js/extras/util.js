function util() {

    var _verifyPrecision = function(precision) {
        if(precision < 0 || precision > 20) {
            throw new RangeError('Formatter precision must be between 0 and 20');
        }
        if(precision !== Math.floor(precision)) {
            throw new RangeError('Formatter precision must be an integer');
        }
    }

    var _boundTooltip = function(container, tooltip) {
        var left = container.offsetLeft,
            width = container.offsetWidth,
            height = container.offsetHeight,
            top = 0;

        var tipLeft = tooltip.offsetLeft,
            tipWidth = tooltip.offsetWidth,
            tipHeight = tooltip.offsetHeight,
            tipTop = tooltip.offsetTop;

        if(tipLeft < left) {
            tooltip.style.left = left + "px";
        }

        if(tipLeft + tipWidth > left + width) {
            tooltip.style.left = (left + width - tipWidth) + 'px';
        }

        if(tipTop < top) {
            tooltip.style.top = top + "px";
        }

        if(tipTop + tipHeight > top + height) {
            tooltip.style.top = (top + height - tipHeight) + 'px';
        }
    }

    var publicMethods = {

        ASCENDING: 1,
        DESCENDING: -1,

        showTooltip: function(tooltip) {
            if(tooltip) tooltip.style('visibility', 'visible');
        },

        updateTooltip: function(data, container) {
            var pt = d3.mouse(container.node()),
                x = pt[0] + 15,
                y = pt[1] + 20;

            this.style('top', y + 'px')
                .style('left', x + 'px')
                .html(data);

            _boundTooltip(container.node(), this.node());
        },

        hideTooltip: function(tooltip) {
            if(tooltip) tooltip.style('visibility', 'hidden');
        },

        /**
         * Sorts the data based upon the order and keys
         *
         * @param {array} data Array of objects that needs to be sorted
         * @param {array} keys Array of string (key) that will be used for sorting
         * @param {string} order 'Ascending' or 'Descending' order of sort
         * @return {null}
         */
        sorter: function(data, keys, order) {
            var _sorter = function(x, y, index) {
                if(typeof(keys[index]) == 'undefined') {
                    return 0;
                }

                return +x[keys[index]] > +y[keys[index]] ? -1
                    : +x[keys[index]] < +y[keys[index]] ? 1
                    : _sorter(x, y, index + 1);
            }

            /* sort ascending */
            if(order === 1) {
                data.sort(function(x, y) {
                    return _sorter(y, x, 0);
                });
            }
            /* sort descending */
            else if(order === -1) {
                data.sort(function(x, y) {
                    return _sorter(x, y, 0);
                });
            }
        },

        /**
         * Sorts the data based upon the order and keys
         *
         * @param {array} data Array of objects that needs to be sorted
         * @param {array} keys Array of string (key) that will be used for sorting
         * @param {string} order 'Ascending' or 'Descending' order of sort
         * @return {null}
         */
        getTruncatedLabel: function(element, label, containerLength, offset) {
            if(typeof(label) === 'undefined') {
                return "";
            }

            if(label === null) {
                label = "null";
            }

            label = label.toString();

            if(offset === void 0) {
                offset = 0;
            }

            offset += 3;

            var truncLabel = label,
                arr = label.split('');

            if(containerLength < element.getComputedTextLength()) {
                var charLength = parseInt(containerLength * element.getNumberOfChars()/element.getComputedTextLength()) - offset;
                charLength = (charLength < 0) ? 0 : charLength;
                truncLabel = arr.splice(0, charLength).join('') + '...';    
            }

            return truncLabel;
        },

        /**
         * Provides D3's number formatting function
         *
         * @param {string} si Type of Number format to be used
         * @return {function}
         */
        getNumberFormatterFn: function(si) {
            if(si === void 0) {
                si = "actual";
            }
            si = si.toLowerCase();

            var result;

            var siMapper = {
                'k': '1e3',
                'm': '1e6',
                'b': '1e9',
            };

            switch(si) {
                case "actual":
                    result = d3.format('');
                    break;
                case "percent":
                    result = d3.format('.0%');
                    break;
                default:
                    result = d3.formatPrefix(',.2s', siMapper[si] || '1e6');
                    break;
            }

            return result;
        },

        /**
         * Rounds a number to a given number of digits
         *
         * @param {array} data Array of objects that needs to be sorted
         * @param {array} keys Array of string (key) that will be used for sorting
         * @param {string} order 'Ascending' or 'Descending' order of sort
         * @return {null}
         */
        roundNumber: function(num, scale) {
            if(typeof(scale) == 'undefined') {
                throw new Error('Scale is not specified');
            }

            var exp1 = "e+" + scale,
                exp2 = "e-" + scale;

            return +(Math.round(num + exp1) + exp2);
        },

        /**
         * Provides config format of a string expression 
         *
         * @param {string} expression The expression which is to be transformed to the config
         * @param {array} args Array of string for which will be the properties for the config
         * @return {array(object)}
         */
        getExpressionConfig: function(expression, args) {
            var config = [],
                temp,
                obj;

            if(!expression || !args.length) {
                return [];
            }

            try {
                expression = expression.split('|');

                expression.forEach(function(item) {
                    obj = {};
                    temp = item.split(',').map(function(c) { return c.trim(); });
                    obj[temp[0].toLowerCase()] = parseInt(temp[1]) || null;
                    args.forEach(function(arg, i) {
                        obj[arg] = temp[i + 2];
                    });
                    config.push(obj);
                });
            } catch(e) {
                console.error(e);
                throw new Error('Invalid expression format');
            }

            return config;
        },

        /**
         * Retrives property value inside the expression based upon the given criteria
         *
         * @param {array(object)} expression The expression which is to be evaluated
         * @param {number} value The value whose placement is to be identified 
         * @param {string} key The property that is being evaluated
         * @return {string|number}
         */
        expressionEvaluator: function(expression, value, key) {
            var result = expression.filter(function(t) {
                    return t.hasOwnProperty('default');
                });

            if(result.length) {
                result = result[0][key];
            }

            for(var i=0; i<expression.length; i++) {
                var property = expression[i];
                if(property.hasOwnProperty('upto')) {
                    if(value <= property.upto) {
                        result = property[key];
                        break;
                    }
                } else if(property.hasOwnProperty('above')) {
                    if(value > property.above) {
                        result = property[key];
                        break;
                    }
                }
            }

            return result;
        },

        /**
         * Base accessor function
         *
         * @param {string|array(string)|null} value "this" value for the measure(s)
         * @param {string|null} measure Measure for which the value is to be set or retrieved
         * @param {array(string)} measures All the available measures
         * @return {string|array(string)|function}
         */
        baseAccessor: function(value, measure, measures) {
            var me = this;

            if(!arguments.length) {
                /**
                 * Getter method call with no arguments
                 * E.g. <chart>.<accessor_function>() ==> [<item1>, <item2>]
                 */
                return me;
            }

            if(value != void 0 && measure == void 0) {
                /**
                 * Setter method call with only value argument
                 * E.g. <chart>.<accessor_function>([<item1>, <item2>]) ==> <chart_function>
                 */
                if(value instanceof Array) {
                    me.splice(0, me.length);
                } else {
                    value = measures.map(function(i) { return value; });
                }

                me.push.apply(me, value);
                return chart;
            }

            var index = measures.indexOf(measure);

            if(index === -1) {
                throw new Error('Invalid measure provided');
            }

            if(value == void 0) {
                /**
                 * Getter method call with only measure argument
                 * E.g. <chart>.<accessor_function>(<measure>) ==> <item>
                 */
                return me[index];
            } else {
                /**
                 * Setter method call with both value and measure arguments
                 * E.g. <chart>.<accessor_function>(<item>, <measure>) ==> <chart_function>
                 */
                me[index] = value;
            }

            return chart;
        },

        shortScale: function(precision) {
            if (precision === void 0) { precision = 3; }
            _verifyPrecision(precision);
            
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
        }
    }

    return publicMethods;

}

module.exports = util;
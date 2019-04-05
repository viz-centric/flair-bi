(function() {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('csvParserService', csvParserService);

    csvParserService.$inject = ['$http', 'Upload'];

    function csvParserService($http, Upload) {
        var csvData = [];
        var service = {
            csvToArray: csvToArray,
            getCSVData: getCSVData,
            setCSVData: setCSVData
        };

        return service;

        ////////////////
        // arrays. The default delimiter is the comma, but this
        // can be overriden in the second argument.
        function csvToArray(strData, strDelimiter) {
            // Check to see if the delimiter is defined. If not,
            // then default to comma.
            strDelimiter = (strDelimiter || ",");

            // Create a regular expression to parse the CSV values.
            var objPattern = new RegExp(
                (
                    // Delimiters.
                    "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                    // Quoted fields.
                    "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                    // Standard fields.
                    "([^\"\\" + strDelimiter + "\\r\\n]*))"
                ),
                "gi"
            );


            // Create an array to hold our data. Give the array
            // a default empty first row.
            var arrData = [
                []
            ];

            //create a empty row for dataTypes
            arrData.push([]);

            // Create an array to hold our individual pattern
            // matching groups.
            var arrMatches = null;


            // Keep looping over the regular expression matches
            // until we can no longer find a match.
            while (arrMatches = objPattern.exec(strData)) {

                // Get the delimiter that was found.
                var strMatchedDelimiter = arrMatches[1];

                // Check to see if the given delimiter has a length
                // (is not the start of string) and if it matches
                // field delimiter. If id does not, then we know
                // that this delimiter is a row delimiter.
                if (
                    strMatchedDelimiter.length &&
                    strMatchedDelimiter !== strDelimiter
                ) {

                    // Since we have reached a new row of data,
                    // add an empty row to our data array.
                    arrData.push([]);

                }

                var strMatchedValue;

                // Now that we have our delimiter out of the way,
                // let's check to see which kind of value we
                // captured (quoted or unquoted).
                if (arrMatches[2]) {

                    // We found a quoted value. When we capture
                    // this value, unescape any double quotes.
                    strMatchedValue = arrMatches[2].replace(
                        new RegExp("\"\"", "g"),
                        "\""
                    );

                } else {

                    // We found a non-quoted value.
                    strMatchedValue = arrMatches[3];

                }


                // Now that we have our value string, let's add
                // it to the data array.
                arrData[arrData.length - 1].push(strMatchedValue);
            }

            // Return the parsed data.
            //return( arrData );
            return addDataTypes(arrData);
        }

        function addDataTypes(arrData) {
            var arrayLen = arrData.length >= 6 ? 6 : arrData.length;
            for (var j = 0; j < arrData[1].length; j++) {
                var dataTypes = { 'String': 0, 'Integer': 0, 'Boolean': 0, 'Float': 0 };
                for (var i = 2; i < arrayLen; i++) {
                    var temp = arrData[i][j];
                    if (isNumber(arrData[i][j])) {
                        dataTypes['Integer']++;
                    } else if (isFloat(arrData[i][j])) {
                        dataTypes['Float']++;
                    } else if (isBoolean(arrData[i][j])) {
                        dataTypes['Boolean']++;
                    } else if (typeof arrData[i][j] === 'string' || arrData[i][j] instanceof String) {
                        dataTypes['String']++;
                    } else {

                    }
                }
                arrData[0].push(findMaxOccurrenceDatatype(dataTypes));
            }
            return arrData;
        }

        function isNumber(val) {
            //var tem=!isNaN(val) && typeof Number(val) === 'number';
            return !isNaN(val) && typeof Number(val) === 'number';
        }

        function isFloat(val) {
            return !isNaN(val) && typeof parseFloat(val) === 'float';
        }

        function isBoolean(val) {
            return !isNaN(val) && typeof Boolean(val) === 'boolean';
        }

        function findMaxOccurrenceDatatype(dataTypes) {
            var max = 0;
            var maxOccurrenceDatatype = '';
            angular.forEach(dataTypes, function(value, key) {
                if (value > max) {
                    max = value;
                    maxOccurrenceDatatype = key;
                }
            });
            return maxOccurrenceDatatype;
        }

        function getCSVData() {
            return csvData;
        }

        function setCSVData(data) {
            csvData = data;
        }

    }
})();
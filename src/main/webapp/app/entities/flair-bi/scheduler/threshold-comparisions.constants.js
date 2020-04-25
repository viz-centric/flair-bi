(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .constant('COMPARISIONS', [{opt:'EQ',value:'Equal'},{opt:'NEQ',value:'Not Equal'},
        	{opt:'GT',value:'Greater Than'},{opt:'LT',value:'Less Than'},{opt:'GTE',value:'Greater Than or Equal To'},{opt:'LTE',value:'Less Than or Equal To'}]
        );
})();

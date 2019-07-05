(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .constant('COMPARISIONS', [{opt:'==',value:'Equal'},{opt:'!=',value:'Not Equal'},
        	{opt:'>',value:'Greater Than'},{opt:'<',value:'Less Than'},{opt:'>=',value:'Greater Than or Equal To'},{opt:'<=',value:'Less Than or Equal To'}]
        );
})();

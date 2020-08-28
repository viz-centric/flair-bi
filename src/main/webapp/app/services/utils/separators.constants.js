(function () {
    'use strict';

    angular
	.module('flairbiApp')
	.constant('SEPARATORS', 
		[
			{
				"displayName": "Data Separator Comma[,]",
				"value": ","
			},
			{
				"displayName": "Data Separator Space[]",
				"value": " "
			},
			{
				"displayName": "Data Separator Pipe[|]",
				"value": "|"
			},
			{
				"displayName": "Data Separator Colon[:]",
				"value": ":"
			}
		]
	);
})();

import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .constant('fileSystemList', [
        'AWS S3',
        'Database'
    ]
    );

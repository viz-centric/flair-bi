import * as angular from 'angular';
'use strict';

angular
    .module('flairbiApp')
    .constant('scheduler_channels', ['Email', 'Slack', 'Stride']
    );

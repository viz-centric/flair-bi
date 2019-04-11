import * as angular from 'angular';

import {moduleName as appModule} from './app/app.module';

import './content/scss/main/main.scss';
import './vendor';

const templates = require.context('./app', true, /\.js$/);
templates.keys().forEach(function (key) {
    if (key === './app/app.module.js') { }
    else {
        templates(key);
    }
});


/**
 * Bootstrap the application using the imported moduleName
 */
const bootstrapModuleName = angular.module('application.bootstrap', [
    appModule
]).name;

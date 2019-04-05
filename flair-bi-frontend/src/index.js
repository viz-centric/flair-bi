import * as angular from 'angular';

import { moduleName as appModule } from './app/app.module';



import './content/scss/main/main.scss';
import './vendor';


/**
 * Bootstrap the application using the imported moduleName
 */
const bootstrapModuleName = angular.module('application.bootstrap', [
    appModule
]).name;
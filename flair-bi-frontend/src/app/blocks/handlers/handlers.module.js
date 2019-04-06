import angular from 'angular';

import { factoryName as translationHandlerName, translationHandler as translationHandlerFactory } from './translation.handler';
import { factoryName as stateHandlerName, stateHandler as stateHandlerFactory } from './state.handler';

export const moduleName =
    angular.module('application.handlers', [])


        /**
         * Factories
         */
        .factory(translationHandlerName, translationHandlerFactory)
        .factory(stateHandlerName, stateHandlerFactory)

        .name;

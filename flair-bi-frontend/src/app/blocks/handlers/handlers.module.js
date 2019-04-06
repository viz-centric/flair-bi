import angular from 'angular';

import { moduleName as AuthModule } from './../../services/auth/auth.module';
import { moduleName as ApplicationConstantsModule } from "./../../app.constants";

import { factoryName as translationHandlerName, translationHandler as translationHandlerFactory } from './translation.handler';
import { factoryName as stateHandlerName, stateHandler as stateHandlerFactory } from './state.handler';

export const moduleName =
    angular.module('application.handlers',
        [
            AuthModule,
            ApplicationConstantsModule
        ])


        /**
         * Factories
         */
        .factory(translationHandlerName, translationHandlerFactory)
        .factory(stateHandlerName, stateHandlerFactory)

        .name;

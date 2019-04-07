import angular from 'angular';

import { name as LoginStyleDirectiveName, loginStyle } from "./login-style.directive";
import { name as LoginControllerName, LoginController } from "./login.controller";
import { stateConfig as LoginStateConfig } from "./login.state";

export const moduleName =
    angular.module('application.feature.login',
        [
            'ui.router'
        ])

        .directive(LoginStyleDirectiveName, loginStyle)

        .controller(LoginControllerName, LoginController)

        .config(LoginStateConfig)
        .name;





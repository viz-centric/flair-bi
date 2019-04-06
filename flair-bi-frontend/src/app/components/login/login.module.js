import angular from 'angular';

import { name as LoginControllerName, LoginController } from "./login.controller";
import { name as LoginServiceName, LoginService } from "./login.service";

export const moduleName =
    angular.module('application.login',
        [])

        .controller(LoginControllerName, LoginController)

        .factory(LoginServiceName, LoginService)

        .name;

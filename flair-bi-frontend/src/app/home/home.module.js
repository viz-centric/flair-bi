import angular from 'angular';

import { name as alertsServiceName, alertsService } from "./alerts.service";
import { name as homeTopnavbarControllerName, HomeTopNavBarController } from "./home-topnavbar.controller";
import { name as homeControllerName, HomeController } from "./home.controller";
import { stateConfig as homeStateConfig } from "./home.state";
import { name as notificationSetComponentName, component as notificationSetComponent } from "./notification-set.component";
import { name as tileDetailsComponentName, component as tileDetailsComponent } from "./tile-details.component";

export const moduleName =
    angular.module('application.feature.home', [])

        .factory(alertsServiceName, alertsService)

        .controller(homeTopnavbarControllerName, HomeTopNavBarController)
        .controller(homeControllerName, HomeController)

        .config(homeStateConfig)

        .component(notificationSetComponentName, notificationSetComponent)
        .component(tileDetailsComponentName, tileDetailsComponent)

        .name;
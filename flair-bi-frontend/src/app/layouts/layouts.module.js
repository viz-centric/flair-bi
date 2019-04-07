import angular from "angular";

import { stateConfig as errorStateConfig } from "./error/error.state";
import { name as ExplorationNavControllerName, ExplorationNavController } from "./explorationNav/explorationNav.controller";
import { name as FilterControllerName, FilterController } from "./filter/filter.controller";
import { name as FooterControllerName, FooterController } from "./footer/footer.controller";
import { name as activeMenuDirectiveName, activeMenu } from "./navbar/active-menu.directive";
import { name as NavbarControllerName, NavbarController } from "./navbar/navbar.controller";
import { name as minimalizaSiderbarName, minimalizaSidebar } from "./topnavbar/minimaliza-siderbar.directive";
import { name as TopnavbarControllerName, TopNavBarController } from "./topnavbar/topnavbar.controller";


export const moduleName =
    angular.module('application.layouts', [])
        .config(errorStateConfig)

        .controller(ExplorationNavControllerName, ExplorationNavController)
        .controller(FilterControllerName, FilterController)
        .controller(FooterControllerName, FooterController)
        .controller(NavbarControllerName, NavbarController)
        .controller(TopnavbarControllerName, TopNavBarController)

        .directive(activeMenuDirectiveName, activeMenu)
        .directive(minimalizaSiderbarName, minimalizaSidebar)

        .name;

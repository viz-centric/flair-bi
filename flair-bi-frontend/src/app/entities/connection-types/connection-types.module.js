import angular from 'angular';

import { name as connectionPropertyComponentName, component as connectionPropertyComponent } from "./connection-property.component";
import { name as connectionTypeComponentName, component as connectionTypeComponent } from "./connection-type.component";
import { name as connectionTypesName, ConnectionTypes } from "./connection-types.service";


export const moduleName =
    angular.module('application.entities.connection-types', [])

        .component(connectionPropertyComponentName, connectionPropertyComponent)
        .component(connectionTypeComponentName, connectionTypeComponent)

        .factory(connectionTypesName, ConnectionTypes)


        .name;

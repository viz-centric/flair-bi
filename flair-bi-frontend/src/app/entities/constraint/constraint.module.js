import angular from 'angular';

import { name as constraintServiceName, Constraints } from "./constraint.service";

export const moduleName =
    angular.module('application.entities.constraint', [])

        .factory(constraintServiceName, Constraints)

        .name;
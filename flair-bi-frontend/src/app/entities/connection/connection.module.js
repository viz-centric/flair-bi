import angular from 'angular';

import { name as connectionDeleteDialogControllerName, ConnectionDeleteDialogController } from "./connection-delete-dialog.controller";
import { name as connectionDetailControllerName, ConnectionDetailController } from "./connection-detail.controller";
import { name as connectionDialogControllerName, ConnectionDialogController } from "./connection-dialog.controller";
import { name as connectionServiceName, ConnectionTypes } from "./connection.service";
import { stateConfig as connectionStateConfig } from "./connection.state";
import { name as connectionsContentHeaderControllerName, ConnectionsContentHeaderController } from "./connections-content-header.controller";
import { name as connectionsControllerName, ConnectionsController } from "./connections.controller";

export const moduleName =
    angular.module('application.entities.connection', [])

        .controller(connectionDeleteDialogControllerName, ConnectionDeleteDialogController)
        .controller(connectionDetailControllerName, ConnectionDetailController)
        .controller(connectionDialogControllerName, ConnectionDialogController)
        .controller(connectionsContentHeaderControllerName, ConnectionsContentHeaderController)
        .controller(connectionsControllerName, ConnectionsController)

        .factory(connectionServiceName, ConnectionTypes)

        .config(connectionStateConfig)

        .name;
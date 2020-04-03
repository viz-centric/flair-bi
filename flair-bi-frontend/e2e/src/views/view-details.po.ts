import { BasePage } from '../base.po';
import { ElementFinder, $ } from 'protractor';
import { CreateEditViewDialog } from './create-edit-view.dialog';

export class ViewDetailsPage extends BasePage {

    private _dashboardId: string;

    private _viewId: string;

    private _viewContainer: ElementFinder = $('table.property-information-table');

    private _editBtn: ElementFinder = $('button[ui-sref="dashboards-overview.view-detail.edit({id:vm.views.viewDashboard.id,viewId:vm.views.id})"]')

    constructor(dashboardId: string, viewId: string) {
        super();
        this._dashboardId = dashboardId;
        this._viewId = viewId;
    }

    getPath(): string {
        return `dashboards/${this._dashboardId}/views/${this._viewId}/details`;
    }
    isLoaded(): Promise<boolean> {
        return this._viewContainer.isPresent() as Promise<boolean>;
    }

    edit(): CreateEditViewDialog {
        this._editBtn.click();
        return new CreateEditViewDialog();
    }

}
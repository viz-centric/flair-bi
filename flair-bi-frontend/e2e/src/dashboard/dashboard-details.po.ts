import { BasePage } from '../base.po';
import { ElementFinder, $ } from 'protractor';

export class DashboardDetailsPage extends BasePage {

    private _id: string;

    private _content: ElementFinder = $(".fbibox-content");

    private _backBtn: ElementFinder = $("a[ui-sref='dashboards']");
    private _editBtn: ElementFinder = $("*[ui-sref='dashboards-detail.edit({id:vm.dashboards.id})']");

    constructor(id: string) {
        super();
        this._id = id;
    }

    getPath(): string {
        return `dashboards/${this._id}/details`;
    }
    isLoaded(): Promise<boolean> {
        return this._content.isPresent() as Promise<boolean>;
    }


    edit(): void {
        this._editBtn.click();
    }

    back(): void {
        this._backBtn.click();
    }

}
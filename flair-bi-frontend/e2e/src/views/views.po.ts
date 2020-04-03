import { BasePage } from '../base.po';
import { ElementArrayFinder, element, by, ElementFinder, $, browser, ExpectedConditions } from 'protractor';
import { CreateEditViewDialog } from './create-edit-view.dialog';
import { ViewDetailsPage } from './view-details.po';
import { DeleteDialog } from '../common/delete-dialog.po';

export class ViewsPage extends BasePage {

    private _id: string;

    private _views: ElementArrayFinder = element.all(by.repeater('view in vm.views'));

    private _createViewBtn: ElementFinder = $('button[ui-sref="dashboards-overview.view-new({dashboard: vm.selectedDashboard})"]');

    private _view = (name: string): ElementFinder => this._views.filter((el) => {
        return el.element(by.cssContainingText('h4.item', name)).isPresent();
    }).first();

    private _options = (name: string): ElementFinder => this._view(name).element(by.css('div.card-menu a.dropdown-toggle'));

    constructor(id: string) {
        super();
        this._id = id;
    }

    getPath(): string {
        return "dashboards/" + this._id;
    }
    isLoaded(): Promise<boolean> {
        return this._views.isPresent() as Promise<boolean>;
    }

    createView(): CreateEditViewDialog {
        this._createViewBtn.click();
        return new CreateEditViewDialog();
    }

    hasView(name: string): Promise<boolean> {
        return this._view(name)
            .isPresent() as Promise<boolean>;
    }

    async settings(name: string): Promise<ViewDetailsPage> {
        let anchor: ElementFinder = this._view(name)
            .element(by.css('div[uib-tooltip="Setting"] a'));

        let href: string = await anchor.getAttribute('href');

        await this._options(name).click();
        await anchor.click();

        return new ViewDetailsPage(this._id,
            href
                .replace(this.getPageUrl() + '/views/', "")
                .replace('/details', ''));
    }

    async delete(name: string): Promise<DeleteDialog> {
        let dropdownMenu: ElementFinder = this._view(name)
            .element(by.css('div.dropdown-menu'));
        await this._options(name).click();
        await browser.wait(ExpectedConditions.presenceOf(dropdownMenu), 10000, 'Element taking too long to appear in the DOM');
        await dropdownMenu.element(by.css('div[uib-tooltip="Delete"] a[ui-sref]')).click();

        return new DeleteDialog();
    }

}
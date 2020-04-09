import { BasePage } from '../base.po';
import { $, ElementFinder, element, by, ExpectedConditions, browser } from 'protractor'
import { DashboardData } from './dashboard-data';
import { DashboardsPage } from './dashboards.po';
import { DashboardDetailsPage } from './dashboard-details.po';

export class DashboardDialog extends BasePage {

    private _path: string;

    private _dashboardName: ElementFinder = $('#field_dashboardName');
    private _dashboardCategory: ElementFinder = $('#field_category');
    private _dashboardDescription: ElementFinder = $('#field_description');
    private _datasourceSearchFieldContainer: ElementFinder = $('div.ui-select-container');
    private _datasourceSearch: ElementFinder = $('input[type="search"]');
    private datasourceDropdown = (datasourceName: String) => {
        return element(by
            .xpath(`//ul[contains(@class, \'ui-select-choices\')]//*[contains(text(),\'${datasourceName}\')]/parent::*[contains(@class,\'ui-select-choices-row\')]`));
    }

    private _saveBtn: ElementFinder = $('button[type="submit"]');
    private _cancelBtn: ElementFinder = $('button[data-dismiss]');



    constructor() {
        super();
        this._path = "dashboards/new";
    }

    getPath(): string {
        return this._path;
    }
    isLoaded(): Promise<boolean> {
        return $('*[ui-view="content"]').isPresent() as Promise<boolean>;
    }

    enterName(name: string): DashboardDialog {
        this._dashboardName.clear();
        this._dashboardName.sendKeys(name);
        return this;
    }

    enterCategory(category: string): DashboardDialog {
        this._dashboardCategory.clear();
        this._dashboardCategory.sendKeys(category);
        return this;
    }

    enterDescription(description: string): DashboardDialog {
        this._dashboardDescription.clear();
        this._dashboardDescription.sendKeys(description);
        return this;
    }

    searchDatasource(term: string): DashboardDialog {
        this._datasourceSearchFieldContainer.click();
        this._datasourceSearch.clear();
        this._datasourceSearch.sendKeys(term);
        return this;
    }

    selectDatasource(name: string): DashboardDialog {
        let elem = this.datasourceDropdown(name);
        browser.wait(ExpectedConditions.presenceOf(elem), 10000, 'Element taking too long to appear in the DOM')
            .then(() => elem.click());
        return this;
    }

    save(): DashboardsPage {
        this._saveBtn.click();
        return new DashboardsPage(new DashboardDetailsPage(''));
    }

    cancel(): DashboardsPage {
        this._cancelBtn.click();
        return new DashboardsPage(new DashboardDetailsPage(''));
    }

    enterData(data: DashboardData): DashboardDialog {
        return this.enterName(data.name)
            .enterCategory(data.category)
            .enterDescription(data.description)
            .searchDatasource(data.datasource.substr(0, 4))
            .selectDatasource(data.datasource);
    }

}
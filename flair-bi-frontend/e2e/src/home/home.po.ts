import { browser, by, element, ElementFinder, $ } from 'protractor';
import { BasePage } from '../base.po';

export class HomePage extends BasePage {


    private profileDropdown: ElementFinder = element(by.id('dropdownMainMenu'))
    private logoutButton: ElementFinder = element(by.id('logout'))
    private accountButton: ElementFinder = element(by.xpath('//a[@ui-sref=\'account\']'))

    private dashboardsTile: ElementFinder = element(by.id('information-card-1'));
    private viewsTile: ElementFinder = element(by.id('information-card-2'));
    private datasourcesTile: ElementFinder = element(by.id('information-card-3'));
    private flairInsightTile: ElementFinder = element(by.id('information-card-4'));
    private bookmarksTile: ElementFinder = element(by.id('information-card-5'));

    private newDatasource: ElementFinder = $('*[ui-sref="connection.new"]')
    private newDashboard: ElementFinder = $('*[ui-sref="dashboards.new"]');
    private viewDashboardsBtn: ElementFinder = $('*[ui-sref="dashboards"]');

    private connectionBtn: ElementFinder = $('*[ui-sref="connection"]');

    navigateTo(): Promise<unknown> {
        return browser.get(browser.baseUrl) as Promise<unknown>;
    }

    logout(): void {
        this.profileDropdown.click();
        this.logoutButton.click();
    }

    createNewDatasource(): void {
        this.newDatasource.click();
    }

    createNewDashboard(): void {
        this.newDashboard.click();
    }

    viewDashboards(): void {
        this.viewDashboardsBtn.click();
    }

    goToAccount(): void {
        this.profileDropdown.click();
        this.accountButton.click();
    }

    dataConnection(): void {
        this.connectionBtn.click();
    }

    getPath(): string {
        return "";
    }
    isLoaded(): Promise<boolean> {
        return this.profileDropdown.isPresent() as Promise<boolean>;
    }

    clickDashboardsTile(): void {
        this.dashboardsTile.click();
    }

    clickViewsTile(): void {
        this.viewsTile.click();
    }

    clickDatasourcesTile(): void {
        this.datasourcesTile.click();
    }

    clickFlairInsightTile(): void {
        this.flairInsightTile.click();
    }

    clickBookmarksTile(): void {
        this.bookmarksTile.click();
    }


}

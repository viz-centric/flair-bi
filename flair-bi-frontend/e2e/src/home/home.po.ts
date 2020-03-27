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

    private newDatasource: ElementFinder = $('a.new-data-sou')
    private newDashboard: ElementFinder = $('a.new-dash');

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

    goToAccount(): void {
        this.profileDropdown.click();
        this.accountButton.click();
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

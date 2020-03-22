import { browser, by, element } from 'protractor';
import { BasePage } from '../base.po';

export class HomePage extends BasePage {


    private profileDropdown = () => element(by.id('dropdownMainMenu'))
    private logoutButton = () => element(by.id('logout'))
    private accountButton = () => element(by.xpath('//a[@ui-sref=\'account\']'))

    private dashboardsTile = () => element(by.id('information-card-1'));
    private viewsTile = () => element(by.id('information-card-2'));
    private datasourcesTile = () => element(by.id('information-card-3'));
    private flairInsightTile = () => element(by.id('information-card-4'));
    private bookmarksTile = () => element(by.id('information-card-5'));

    private newDatasource = () => element(by.xpath('//a[@ui-sref=\'connection.new\']'))

    navigateTo(): Promise<unknown> {
        return browser.get(browser.baseUrl) as Promise<unknown>;
    }

    logout(): void {
        this.profileDropdown().click();
        this.logoutButton().click();
    }

    createNewDatasource(): void {
        this.newDatasource().click();
    }

    goToAccount(): void {
        this.profileDropdown().click();
        this.accountButton().click();
    }

    getPath(): string {
        return "";
    }
    isLoaded(): Promise<boolean> {
        return this.profileDropdown().isPresent() as Promise<boolean>;
    }

    clickDashboardsTile(): void {
        this.dashboardsTile().click();
    }

    clickViewsTile(): void {
        this.viewsTile().click();
    }

    clickDatasourcesTile(): void {
        this.datasourcesTile().click();
    }

    clickFlairInsightTile(): void {
        this.flairInsightTile().click();
    }

    clickBookmarksTile(): void {
        this.bookmarksTile().click();
    }


}

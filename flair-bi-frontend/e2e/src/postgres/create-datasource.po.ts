import { BasePage } from '../base.po';
import { element, by, ElementFinder, $, ExpectedConditions, browser } from 'protractor';
import { PostgresData } from '../postgres-data';

export class CreateDatasourcePage extends BasePage {

    private nextButton: ElementFinder = $('.step.current [wz-next]');

    private connectionName: ElementFinder = $('input[name="connectionName"]');

    private serverAddress: ElementFinder = $('input[name="serverIp-text-input"]');

    private serverPort: ElementFinder = $('input[name="serverPort-number-input"]');

    private databaseName: ElementFinder = $('input[name="databaseName-text-input"]');

    private connectionParams: ElementFinder = $('input[name="connectionParams-text-input"');

    private username: ElementFinder = $('input[name="username"]');

    private password: ElementFinder = $('input[name="password"]');

    private testConnectionBtn: ElementFinder = $('.test-connection-button');

    private datasourceSearchContainer: ElementFinder = $('form[name="dataSourceForm"] .ui-select-container');
    private datasourceSearch: ElementFinder = $('form[name="dataSourceForm"] .ui-select-search');

    private showDataBtn: ElementFinder = element(by.xpath('//button[contains(text(), \'Show Data\')]'));

    private createDatasourceBtn: ElementFinder = $('.step.current .wizard-navigate-buttons [type="submit"]');

    private datasourceDropdown = (datasourceName: String) => {
        return element(by
            .xpath(`//ul[contains(@class, \'ui-select-choices\')]//*[text()=\'${datasourceName}\']/parent::*[contains(@class,\'ui-select-choices-row\')]`));
    }

    private finishBtn: ElementFinder = $('.step.current [wz-finish]');

    getPath(): string {
        return "administration/connection/new";
    }
    isLoaded(): Promise<boolean> {
        return element(by.xpath('//div[@class=\'window-holder\']')).isPresent() as Promise<boolean>;
    }

    selectConnectionType(type: string): CreateDatasourcePage {
        $(`.connection-type-svg#${type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}`)
            .click();

        return this;
    }

    next(): CreateDatasourcePage {
        this.nextButton.click();
        return this;
    }

    enterData(connectionType: PostgresData): CreateDatasourcePage {
        this.connectionName.sendKeys(connectionType.connectionName);
        this.serverAddress.sendKeys(connectionType.serverAddress);
        this.serverPort.sendKeys(connectionType.port);
        this.databaseName.sendKeys(connectionType.databaseName);
        this.connectionParams.sendKeys(connectionType.connectionParams);
        this.username.sendKeys(connectionType.username);
        this.password.sendKeys(connectionType.password);
        return this;
    }

    testConnection(): CreateDatasourcePage {
        this.testConnectionBtn.click();
        return this;
    }

    searchDatasource(term: string): CreateDatasourcePage {
        this.datasourceSearchContainer.click();
        this.datasourceSearch.sendKeys(term);
        return this;
    }

    selectDatasource(name: string): CreateDatasourcePage {
        let elem = this.datasourceDropdown(name);
        browser.wait(ExpectedConditions.presenceOf(elem), 10000, 'Element taking too long to appear in the DOM')
            .then(() => elem.click());
        return this;
    }

    showData(): CreateDatasourcePage {
        this.showDataBtn.click();
        return this;
    }

    createDatasource(): CreateDatasourcePage {
        this.createDatasourceBtn.click();
        return this;
    }

    finish(): CreateDatasourcePage {
        this.finishBtn.click();
        return this;
    }





}
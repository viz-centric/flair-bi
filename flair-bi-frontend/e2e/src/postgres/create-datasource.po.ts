import { BasePage } from '../base.po';
import { element, by, ElementFinder, $ } from 'protractor';

export class CreateDatasourcePage extends BasePage {

    private nextButton: ElementFinder = $('.wizard-navigate-buttons > *[value=\'Next\']');

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



}
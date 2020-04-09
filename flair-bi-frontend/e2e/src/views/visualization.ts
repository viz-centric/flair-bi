import { ElementFinder, $, by, browser, element, ElementArrayFinder, ExpectedConditions } from 'protractor';
import { VisualizationSettingsDropdown } from './visualization-settings.dropdown';

export class Visualization {

    private _element: ElementFinder;

    private _frontPanel: ElementFinder;

    private _backPanel: ElementFinder;


    constructor(element: ElementFinder) {
        this._element = element;
        this._frontPanel = this._element.element(by.css('*[container-id]'));
        this._backPanel = this._element.element(by.css('div.grid-back'));
    }

    flip(): Visualization {
        let el = this._frontPanel.element(by.css('.viz-header-content a[ng-click="vm.flipCard(v)"]'));
        browser.actions()
            .mouseMove(el);
        el.click();
        return this;
    }

    refresh(): Visualization {
        let el = this._frontPanel.element(by.css('.viz-header-content *[ng-click="vm.refreshWidget(v)"]'));
        browser.actions()
            .mouseMove(el);
        el.click();
        return this;
    }

    tools(): VisualizationSettingsDropdown {
        let el = this._frontPanel.element(by.css('.viz-header-content .viz-settings'));
        browser.actions()
            .mouseMove(el);
        el.click();
        return new VisualizationSettingsDropdown(this._frontPanel.element(by.css('.viz-header-content')));
    }

    toggleLive(): Visualization {
        let el = this._frontPanel.element(by.css('.viz-header-content .live'));
        browser.actions()
            .mouseMove(el);
        el.click();
        return this;
    }

    getDimensionDropPlaceholder(): ElementFinder {
        return this._backPanel.element(by.css('li.dimension-item:last-child > input'));
    }

    getMeasureDropPlaceHolder(): ElementFinder {
        return this._backPanel.element(by.css('li.measure-item:last-child'));
    }

    public isDataRendered(): Promise<boolean> {
        let svg: ElementFinder = this._element.element(by.css('.widget-content svg:first-child'));
        return svg.isPresent() as Promise<boolean>;
    }

    public getColumnNumber(): Promise<number> {
        return this._element.all(by.css('.widget-content svg:first-child g.cluster')).count() as Promise<number>;
    }


}
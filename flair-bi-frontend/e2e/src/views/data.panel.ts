import { ElementFinder, $, ElementArrayFinder, $$, by, element } from 'protractor';

export class DataPanel {

    private _content: ElementFinder = $('div[ng-show="vm.sideBarTab == \'data\'"]');

    private _dimensions: ElementArrayFinder = element.all(by.repeater('dimension in vm.features'));

    private _measures: ElementArrayFinder = element.all(by.repeater('measure in vm.features'));

    dimension(): DataPanel {
        this._content.element(by.css('ul > li:first-child')).click();
        return this;
    }

    measures(): DataPanel {
        this._content.element(by.css('ul > li:nth-child(2)')).click();
        return this;
    }

    hierarchies(): DataPanel {
        this._content.element(by.css('ul > li:last-child')).click();
        return this;
    }

    getDimension(name: string): ElementFinder {
        return this._dimensions
            .filter((el) => {
                return el.element(by.cssContainingText('span.feature-name', name)).isPresent();
            })
            .first();
    }

    getMeasure(name: string): ElementFinder {
        return this._measures
            .filter((el) => {
                return el.element(by.cssContainingText('span.feature-name', name)).isPresent();
            })
            .first();

    }

}
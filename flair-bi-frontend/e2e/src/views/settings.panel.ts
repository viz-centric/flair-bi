import { VizMeasure } from './measure';
import { VizDimension } from './dimension';
import { ElementFinder, $, ElementArrayFinder, $$, element, by } from 'protractor';

export class SettingsPanel {

    private _panel: ElementFinder = $('.right-sidebar-container .properties-sidebar');

    private _vizPropTab: ElementFinder = this._panel.element(by.css('ul.nav-tabs > li:first-child'));

    private _dataPropTab: ElementFinder = this._panel.element(by.css('ul.nav-tabs > li:nth-child(2)'));

    private _fields: ElementArrayFinder = $$('*[ng-repeat*="field in vm.visual.fields"]');

    private _selectedField: ElementFinder = $('*[ng-model="vm.selectedField.feature"] span.ui-select-toggle');

    private _displayName: ElementFinder = $('#propertyType_display-name');

    private _features = (name: string): ElementFinder => $$('*[ng-repeat*="feature in $select.items"]')
        .filter(async (el) => {
            const text = await el.getText();
            return text.indexOf(name) > -1;
        }).first()

    private _aggregationTypeSelect: ElementFinder = $('#propertyType_aggregation-type');

    private _dimensions: ElementArrayFinder = this._fields.filter(async (el) => {
        const fieldType = await el.getAttribute('data-field-type');
        return fieldType === 'DIMENSION';
    });

    private _measures: ElementArrayFinder = this._fields.filter(async (el) => {
        const fieldType = await el.getAttribute('data-field-type');
        return fieldType === 'MEASURE';
    });

    private _dimIndex: number = 0;
    private _measIndex: number = 0;

    assignDimension(dim: VizDimension): SettingsPanel {
        this._dimensions.get(this._dimIndex++).click();
        this._selectedField.click();
        this._features(dim.dimension).click();

        this._displayName.clear();
        this._displayName.sendKeys(dim.displayName);

        let sort: ElementFinder = $('#propertyType_sort');
        sort.click();
        sort.element(by.css(`option[label="${dim.sort}"]`)).click();
        return this;
    }

    assignMeasure(meas: VizMeasure): SettingsPanel {
        this._measures.get(this._measIndex++).click();
        this._selectedField.click();
        this._features(meas.measure).click();

        this._displayName.clear();
        this._displayName.sendKeys(meas.displayName);

        this._aggregationTypeSelect.click();
        this._aggregationTypeSelect.element(by.css(`option[label="${meas.aggregationType}"]`)).click();

        return this;
    }


    vizProperties(): SettingsPanel {
        this._vizPropTab.element(by.css('a')).click();
        return this;
    }

    dataProperties(): SettingsPanel {
        this._dataPropTab.element(by.css('a')).click();
        return this;
    }

    save(): SettingsPanel {
        this._panel.element(by.css('button[ng-click="vm.save()"]')).click();
        return this;
    }
}





import { ElementFinder, by } from 'protractor';
import { SettingsPanel } from './settings.panel';

export class VisualizationSettingsDropdown {

    private _parent: ElementFinder;

    private _dropdown: ElementFinder;

    constructor(parent: ElementFinder) {
        this._parent = parent;
        this._dropdown = this._parent.element(by.css('.dropdown-menu'));
    }

    settings(): SettingsPanel {
        this._dropdown.element(by.css('a[ng-click="vm.settings(v)"]')).click();
        return new SettingsPanel();
    }

}
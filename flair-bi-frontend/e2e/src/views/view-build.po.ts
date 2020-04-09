import { BasePage } from '../base.po';
import { element, by, $, $$, ElementFinder, ElementArrayFinder } from 'protractor';
import { VisualizationsPanel } from './visualizations.panel';
import { DataPanel } from './data.panel';

export class ViewBuildPage extends BasePage {

    private _dashboardId: string;

    private _viewId: string;

    private _contentHeader: ElementFinder = $('div.flairbi-content-header');

    private _contentHeaderBtns: ElementArrayFinder = $$('div.flairbi-content-header top-nav-button-component')

    private _rightBarSettings: ElementArrayFinder = $$('#leftside-thinbar button')

    private _contentHeaderBtn = (name: string): ElementFinder =>
        this._contentHeaderBtns.filter((el) => {
            return el.element(by.css(`*[uib-tooltip="${name}"]`)).isPresent();
        }).first().element(by.css('div'));

    private _rightBarSetting = (name: string): ElementFinder =>
        this._rightBarSettings.filter(async (el) => {
            const attr = await el.getAttribute('uib-tooltip');
            return attr === name;
        })
            .first();

    constructor(dashboardId: string, viewId: string) {
        super();
        this._dashboardId = dashboardId;
        this._viewId = viewId;
    }

    getPath(): string {
        return `dashboards/${this._dashboardId}/views/${this._viewId}/build`;
    }
    isLoaded(): Promise<boolean> {
        return element(by.id('grid-container')).isPresent() as Promise<boolean>;
    }

    toggleEdit(): ViewBuildPage {
        this._contentHeaderBtn('Edit').click();
        return this;
    }

    save(): ViewBuildPage {
        this._contentHeaderBtn('Save').click();
        return this;
    }

    reset(): ViewBuildPage {
        this._contentHeaderBtn('Reset').click();
        return this;
    }

    data(): DataPanel {
        this._rightBarSetting('Data').click();
        return new DataPanel();
    }

    visualizations(): VisualizationsPanel {
        this._rightBarSetting('Visualizations').click();
        return new VisualizationsPanel();
    }



}
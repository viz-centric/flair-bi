import { ElementArrayFinder, element, by, ElementFinder, browser, ExpectedConditions } from 'protractor';
import { VisualizationWidget } from './visualization.widget';

export class VisualizationsPanel {

    private _visualizations: ElementArrayFinder = element.all(by.repeater('visual in vm.visualizations'));

    private _visualMetadas: ElementArrayFinder = element.all(by.repeater('v in vm.visualmetadata'));

    private _visualization = (name: string): ElementFinder => this._visualizations
        .filter(async (el) => {
            const attr = await el.getAttribute('uib-tooltip');
            return attr === name;
        }).first();

    async clusteredVerticalBarChart(): Promise<VisualizationWidget> {
        return this.widget('Clustered Vertical Bar Chart');
    }

    private async widget(name: string): Promise<VisualizationWidget> {
        this._visualization(name).click();
        await browser.sleep(2000);
        let elem: ElementFinder = await this._visualMetadas
            .last();

        return new VisualizationWidget(elem);
    }

}
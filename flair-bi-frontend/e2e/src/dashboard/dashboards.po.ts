import { BasePage } from '../base.po';
import { $, element, by, ElementFinder, ElementArrayFinder } from 'protractor';
import { DashboardDetailsPage } from './dashboard-details.po';
import { ViewsPage } from '../views/views.po';

export class DashboardsPage extends BasePage {


    private _dashboardsDetailsPage: DashboardDetailsPage;

    private _dashboardCard = (name: string) => element(by.cssContainingText('.info-card', name));
    private _dashboardCardOptions = (name: string) => this._dashboardCard(name).element(by.css('div.card-menu'));
    private _deleteOption = (name: string) => this._dashboardCardOptions(name).element(by.css('.item:nth-child(1)'));
    private _editOption = (name: string) => this._dashboardCardOptions(name).element(by.css('.item:nth-child(2)'));
    private _releaseOption = (name: string) => this._dashboardCardOptions(name).element(by.css('.item:nth-child(3)'));

    private _dashboards: ElementArrayFinder = element.all(by.repeater('dashboards in vm.dashboards'));

    private _submitBtn: ElementFinder = $('button[type="submit"]');
    private _cancelBtn: ElementFinder = $('button[data-dismiss]:nth-child(1)');


    constructor(dashboardsDetailsPage: DashboardDetailsPage) {
        super();
        this._dashboardsDetailsPage = dashboardsDetailsPage;
    }

    getPath(): string {
        return "dashboards";
    }
    isLoaded(): Promise<boolean> {
        return this._dashboards.isPresent() as Promise<boolean>;
    }

    openEditDialog(name: string): DashboardsPage {
        this._dashboardCardOptions(name).click();
        this._editOption(name).click();
        this._dashboardsDetailsPage.edit();
        return this;
    }

    hasDashboard(name: string): Promise<boolean> {
        return this._dashboardCard(name).isPresent() as Promise<boolean>;
    }

    openDeleteDialog(name: string): DashboardsPage {
        this._dashboardCardOptions(name).click();
        this._deleteOption(name).click();
        return this;
    }

    submit(): DashboardsPage {
        this._submitBtn.click();
        return this;
    }

    cancel(): DashboardsPage {
        this._cancelBtn.click();
        return this;
    }

    async showViews(name: string): Promise<ViewsPage> {
        let anchor: ElementFinder = this._dashboards.filter((el) => {
            return el.element(by.cssContainingText('h4.item', name))
                .isPresent();
        })
            .first()
            .element(by.css('a[ui-sref="dashboards-overview({id:vm.dashboard.id})"]'));

        const href = await anchor.getAttribute('href');
        await anchor.click();

        return new ViewsPage(href.replace(this.getPageUrl() + "/", ""));
    }



}
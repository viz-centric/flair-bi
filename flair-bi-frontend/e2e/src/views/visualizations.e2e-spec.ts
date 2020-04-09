import { browser } from "protractor";
import { HomePage } from '../home/home.po';
import { LoginPage } from '../login/login.po';
import { userData } from '../user-data';
import { DashboardData } from '../dashboard/dashboard-data';
import { ViewData } from './view.data';
import { ViewsPage } from './views.po';
import { ViewBuildPage } from './view-build.po';
import { Visualization } from './visualization';
import { SettingsPanel } from './settings.panel';
import { VizDimension } from './dimension';
import { Sort } from './sort.enum';
import { VizMeasure } from './measure';
import { AggregationType } from './aggregation-type.enum';

describe('Visualizations e2e tests', () => {

    let home: HomePage,
        login: LoginPage,
        dashboard: DashboardData,
        view: ViewData;


    beforeEach(async () => {
        home = new HomePage();
        login = new LoginPage();

        dashboard = new DashboardData('e2e-widget-create', 'create-widget-e2e', '', 'transactions (posts)');
        view = new ViewData('e2e-view-widget', 'testing');

        await login.navigateTo();
        login.login(userData.admin);
    });


    it('creates clustered vertical bar and assigns dimensions', async () => {
        let viewPage: ViewsPage =
            await home.createNewDashboard()
                .enterData(dashboard)
                .save()
                .showViews(dashboard.name);

        let buildPage: ViewBuildPage = await viewPage.createView()
            .enter(view)
            .save()
            .build(view.name);

        expect(browser.getCurrentUrl()).toEqual(buildPage.getPageUrl());

        let widget: Visualization = await buildPage.toggleEdit()
            .visualizations()
            .clusteredVerticalBarChart();

        let settingsPanel: SettingsPanel =
            widget.tools()
                .settings();

        settingsPanel
            .dataProperties()
            .assignDimension(new VizDimension('city', 'City', Sort.ASCENDING))
            .assignMeasure(new VizMeasure('price', 'Price per city', AggregationType.COUNT))
            .save();

        expect(await widget.isDataRendered()).toBeTruthy();
        expect(await widget.getColumnNumber()).toEqual(15);
    });

    afterEach(() => {
        browser.executeScript('window.sessionStorage.clear();');
        browser.executeScript('window.localStorage.clear();');
        browser.driver.manage().deleteAllCookies();
    });
});
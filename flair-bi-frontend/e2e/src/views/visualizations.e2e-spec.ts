import { browser } from "protractor";
import { HomePage } from '../home/home.po';
import { LoginPage } from '../login/login.po';
import { userData } from '../user-data';
import { DashboardData } from '../dashboard/dashboard-data';
import { ViewData } from './view.data';
import { ViewsPage } from './views.po';
import { ViewBuildPage } from './view-build.po';
import { VisualizationWidget } from './visualization.widget';
import { SettingsPanel } from './settings.panel';
import { VizDimensionData } from './viz-dimension.data';
import { Sort } from '../common/sort.enum';
import { VizMeasureData } from './viz-measure.data';
import { AggregationType } from '../common/aggregation-type.enum';
import { PostgresData } from '../postgres-data';
import { CreateDatasourcePage } from '../postgres/create-datasource.po';

describe('Visualizations e2e tests', () => {

    let home: HomePage,
        postgres: PostgresData,
        login: LoginPage,
        dashboard: DashboardData,
        view: ViewData;


    beforeEach(async () => {
        home = new HomePage();
        login = new LoginPage();
        postgres = new PostgresData("postgres-e2e-connection-viz",
            "localhost",
            "5432",
            "services",
            "",
            "postgres",
            "admin",
            "transactions");
        dashboard = new DashboardData('e2e-widget-create', 'create-widget-e2e', '', `${postgres.datasource} (${postgres.connectionName})`);
        view = new ViewData('e2e-view-widget', 'testing');
        await login.navigateTo();
        login.login(userData.admin);
    });


    it('creates clustered vertical bar and assigns dimensions', async () => {
        // home.createNewDatasource()
        //     .createPostgres(postgres);

        // await home.navigateTo();

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

        let widget: VisualizationWidget = await buildPage.toggleEdit()
            .visualizations()
            .clusteredVerticalBarChart();

        let settingsPanel: SettingsPanel =
            widget.tools()
                .settings();

        settingsPanel
            .dataProperties()
            .assignDimension(new VizDimensionData('city', 'City', Sort.ASCENDING))
            .assignMeasure(new VizMeasureData('price', 'Price per city', AggregationType.COUNT))
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
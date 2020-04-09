import { browser } from "protractor";
import { LoginPage } from '../login/login.po';
import { HomePage } from '../home/home.po';
import { DashboardsPage } from '../dashboard/dashboards.po';
import { userData } from '../user-data';
import { DashboardDetailsPage } from '../dashboard/dashboard-details.po';
import { ViewsPage } from './views.po';
import { ViewData } from './view.data';
import { ViewDetailsPage } from './view-details.po';
import { DeleteDialog } from '../common/delete-dialog.po';

describe('Views e2e tests', () => {

    let login: LoginPage,
        home: HomePage,
        dashboardsDetailsPage: DashboardDetailsPage,
        dashboards: DashboardsPage,
        newView: ViewData,
        changedName: string,
        dashboardName: string;

    beforeEach(async () => {
        home = new HomePage();
        login = new LoginPage();
        dashboardsDetailsPage = new DashboardDetailsPage(null);
        dashboards = new DashboardsPage(dashboardsDetailsPage);

        newView = new ViewData('e2e-view', 'This view is created by protractor during e2e tests!');
        changedName = 'the-view-changed-e2e';
        dashboardName = "Test dashboard123";

        await login.navigateTo();
        login.login(userData.admin);
    });

    it('Should create new view', async () => {
        home.viewDashboards();

        let page: ViewsPage = await dashboards
            .showViews(dashboardName);

        page.createView()
            .enter(newView)
            .save();


        expect(page.hasView(newView.name)).toBeTruthy();

    })

    it('Edit existing view', async () => {
        home.viewDashboards();

        let page: ViewsPage = await dashboards.showViews(dashboardName),
            details: ViewDetailsPage = await page.settings(newView.name);

        details.edit()
            .enterName(changedName)
            .save();


        expect(page.hasView(newView.name)).toBeFalsy();
        expect(page.hasView(changedName)).toBeTruthy();

    })

    it('Delete existing view', async () => {
        home.viewDashboards();

        let page: ViewsPage = await dashboards.showViews(dashboardName)
        let dialog: DeleteDialog = await page.delete(changedName);
        dialog.delete();

        expect(page.hasView(newView.name)).toBeFalsy();
        expect(page.hasView(changedName)).toBeFalsy();

    })
    afterEach(async () => {
        browser.executeScript('window.sessionStorage.clear();');
        browser.executeScript('window.localStorage.clear();');
        browser.driver.manage().deleteAllCookies();
    });

})
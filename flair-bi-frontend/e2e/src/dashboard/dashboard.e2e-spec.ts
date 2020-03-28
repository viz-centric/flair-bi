import { LoginPage } from "../login/login.po";
import { HomePage } from '../home/home.po';
import { userData } from '../user-data';
import { DashboardsPage } from './dashboards.po';
import { DashboardDialog } from './dashboard-dialog.po';
import { browser, element, by } from 'protractor';
import { dashboardData } from './dashboard-data';
import { DashboardDetailsPage } from './dashboard-details.po';

describe('Dashboard crud operations', () => {
    let loginPage: LoginPage,
        homePage: HomePage,
        dashboardsPage: DashboardsPage,
        dashboardDialogPage: DashboardDialog,
        dashboardsDetails: DashboardDetailsPage,
        newName: string = `${dashboardData.name}*`;

    beforeEach(async () => {
        loginPage = new LoginPage();
        homePage = new HomePage();
        dashboardDialogPage = new DashboardDialog();
        dashboardsDetails = new DashboardDetailsPage("");
        dashboardsPage = new DashboardsPage(dashboardsDetails);
        await loginPage.navigateTo();
        loginPage.login(userData.admin);
    });

    it('should create new dashboard', () => {
        homePage.createNewDashboard();

        expect(browser.getCurrentUrl()).toEqual(dashboardDialogPage.getPageUrl());

        dashboardDialogPage
            .enterData(dashboardData)
            .save();

        expect(browser.getCurrentUrl()).toEqual(dashboardsPage.getPageUrl());
        expect(dashboardsPage.hasDashboard(dashboardData.name)).toBeTruthy();
    });

    it('should edit existing dashboard', () => {
        homePage.viewDashboards();
        dashboardsPage.openEditDialog(dashboardData.name);

        dashboardDialogPage.enterName(newName)
            .save();

        dashboardsDetails.back();

        expect(dashboardsPage.hasDashboard(newName)).toBeTruthy();

    });

    it('should delete existing dashboard', () => {
        homePage.viewDashboards();

        dashboardsPage.openDeleteDialog(newName)
            .submit();

        expect(dashboardsPage.hasDashboard(newName)).toBeFalsy();
    })

    afterEach(async () => {
        browser.executeScript('window.sessionStorage.clear();');
        browser.executeScript('window.localStorage.clear();');
        browser.driver.manage().deleteAllCookies();
    });

});
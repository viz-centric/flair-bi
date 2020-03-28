import { browser } from 'protractor';
import { LoginPage } from '../login/login.po';
import { HomePage } from '../home/home.po';
import { userData } from '../user-data';
import { CreateDatasourcePage } from './create-datasource.po';
import { connectionData } from '../postgres-data';
import { ConnectionsPage } from './connections.po';

describe('[Postgres] data source', () => {

    let loginPage: LoginPage,
        homePage: HomePage,
        createNewDatasource: CreateDatasourcePage,
        connectionsPage: ConnectionsPage;

    beforeEach(async () => {
        loginPage = new LoginPage();
        homePage = new HomePage();
        createNewDatasource = new CreateDatasourcePage();
        connectionsPage = new ConnectionsPage();

        await loginPage.navigateTo();
        loginPage.login(userData.admin);
    });

    it('create new data source', () => {
        homePage.createNewDatasource();

        expect(browser.getCurrentUrl()).toEqual(createNewDatasource.getPageUrl());

        createNewDatasource
            .selectConnectionType('postgres')
            .next()
            .enterData(connectionData)
            .testConnection()
            .next()
            .next()
            .searchDatasource('trans')
            .selectDatasource('transactions')
            .showData()
            .createDatasource()
            .finish();

        expect(browser.getCurrentUrl()).toEqual(connectionsPage.getPageUrl());
        expect(connectionsPage.hasConnection(connectionData.connectionName)).toBeTruthy();
    });


    afterEach(async () => {
        browser.executeScript('window.sessionStorage.clear();');
        browser.executeScript('window.localStorage.clear();');
        browser.driver.manage().deleteAllCookies();
    });

});
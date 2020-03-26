import { browser } from 'protractor';
import { LoginPage } from '../login/login.po';
import { HomePage } from '../home/home.po';
import { userData } from '../user-data';
import { CreateDatasourcePage } from './create-datasource.po';
import { data } from '../postgres-data';

describe('Postgres data source', () => {

    let loginPage: LoginPage,
        homePage: HomePage,
        createNewDatasource: CreateDatasourcePage;

    beforeEach(() => {
        loginPage = new LoginPage();
        loginPage.navigateTo();
        loginPage.login(userData.admin);

        homePage = new HomePage();
        homePage.createNewDatasource();

        createNewDatasource = new CreateDatasourcePage();
    });

    it('Create new data source', () => {
        expect(browser.getCurrentUrl()).toEqual(createNewDatasource.getPageUrl());

        createNewDatasource
            .selectConnectionType('postgres')
            .next()
            .enterData(data)
            .testConnection()
            .next()
            .next()
            .searchDatasource('trans');
        browser.sleep(2000);
        createNewDatasource
            .selectDatasource('transactions')
            .showData()
            .createDatasource();
    });


    afterEach(async () => {
        browser.executeScript('window.sessionStorage.clear();');
        browser.executeScript('window.localStorage.clear();');
        browser.driver.manage().deleteAllCookies();
    });

});
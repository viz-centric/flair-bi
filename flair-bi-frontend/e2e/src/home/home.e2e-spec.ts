import { browser } from 'protractor';
import { LoginPage } from './../login/login.po';
import { HomePage } from './home.po';
import { userData } from '../user-data';

describe('home page functionality', () => {
    let loginPage: LoginPage,
        homePage: HomePage;

    beforeEach(() => {
        loginPage = new LoginPage();
        homePage = new HomePage();
        loginPage.navigateTo();
        loginPage.login(userData.admin);
    });

    it('logout working correctly', () => {
        homePage.logout();
        expect(browser.getCurrentUrl()).toEqual(loginPage.getPageUrl());
    });

    afterEach(async () => {
        browser.executeScript('window.sessionStorage.clear();');
        browser.executeScript('window.localStorage.clear();');
        browser.driver.manage().deleteAllCookies();
    });

});
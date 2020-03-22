import { browser } from 'protractor';
import { LoginPage } from './login.po';
import { HomePage } from '../home/home.po';
import { userData } from '../user-data';

describe('login functionality', () => {
    let page: LoginPage,
        homePage: HomePage;

    let errorMessage: String = 'Your flair BI account or password was entered incorrectly';

    beforeEach(async () => {
        page = new LoginPage();
        homePage = new HomePage();
        await page.navigateTo();
    });

    it('should login successfully with good admin credentials', () => {
        page.login(userData.admin);
        expect(browser.getCurrentUrl()).toEqual(homePage.getPageUrl());
    });

    it('should login successfully with good normal user credentials', () => {
        page.login(userData.user);

        expect(browser.getCurrentUrl()).toEqual(homePage.getPageUrl());
    });

    it('should fail to login with wrong credentials', () => {
        page.login(userData.wrongUser);

        expect(browser.getCurrentUrl()).toEqual(page.getPageUrl());
        expect(page.getLoginMessage()).toEqual(errorMessage);
    });

    afterEach(async () => {
        browser.executeScript('window.sessionStorage.clear();');
        browser.executeScript('window.localStorage.clear();');
        browser.driver.manage().deleteAllCookies();
    });

});
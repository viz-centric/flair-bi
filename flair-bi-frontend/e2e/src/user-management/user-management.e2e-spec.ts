import { HomePage } from "../home/home.po";
import { LoginPage } from '../login/login.po';
import { UserManagementPage } from './user-management.po';
import { browser } from 'protractor';
import { userData } from '../user-data';
import { RegisteredUser } from './registered-user.data';

describe('User management', () => {
    let home: HomePage,
        login: LoginPage,
        userManagement: UserManagementPage,
        newUser: RegisteredUser;


    beforeEach(async () => {
        home = new HomePage();
        login = new LoginPage();
        userManagement = new UserManagementPage();

        newUser = new RegisteredUser("e2e-test-user", "test", "e2e-first-name", "e2e-last-name", "e2e@test.com", true, "en", ["ROLE_USER"]);

        await login.navigateTo();
        login.login(userData.admin);
    });

    it('should create a new user', () => {
        home.userManagement();

        expect(browser.getCurrentUrl()).toEqual(userManagement.getPageUrl());

        userManagement.addUser()
            .enter(newUser)
            .save();

        expect(userManagement.hasUser(newUser.username)).toBeTruthy();
    });

    it('should edit an existing user', () => {
        home.userManagement();

        expect(browser.getCurrentUrl()).toEqual(userManagement.getPageUrl());

        userManagement.editUser(newUser.username)
            .selectProfiles(["ROLE_ADMIN"])
            .save();

        expect(userManagement.hasUser(newUser.username)).toBeTruthy();
        expect(userManagement.hasProfiles(newUser.username, ["ROLE_ADMIN"])).toBeTruthy();
    });

    it('should delete an existing user', () => {
        home.userManagement();

        expect(browser.getCurrentUrl()).toEqual(userManagement.getPageUrl());

        userManagement.deleteUser(newUser.username)
            .delete();

        expect(userManagement.hasUser(newUser.username)).toBeFalsy();
    });

    afterEach(async () => {
        browser.executeScript('window.sessionStorage.clear();');
        browser.executeScript('window.localStorage.clear();');
        browser.driver.manage().deleteAllCookies();
    });
});
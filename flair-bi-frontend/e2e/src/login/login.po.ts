import { by, element } from 'protractor';
import { BasePage } from '../base.po';
import { User } from '../user-data';

export class LoginPage extends BasePage {

    private usernameInput = () => element(by.id('username'));
    private passwordInput = () => element(by.id('password'));
    private signInButton = () => element(by.xpath('//button[contains(@class, \'btn-login\')]'));
    private loginMessage = () => element(by.xpath('//div[contains(@class, \'login-error-message\')]'));


    isLoaded(): Promise<boolean> {
        return this.usernameInput().isPresent() as Promise<boolean>;
    }
    getPath(): string {
        return "login";
    }

    login(user: User): void;
    login(username: string, password: string): void;
    login(arg: any, arg2?: any) {
        if (arg2) {
            this.setUsernameInput(arg as string)
            this.setPasswordInput(arg2 as string);
        } else {
            let user: User = arg as User;
            this.setUsernameInput(user.username)
            this.setPasswordInput(user.password);
        }
        this.signIn();
    }

    getUsernameInput(): Promise<string> {
        return this.usernameInput().getText() as Promise<string>;
    }

    setUsernameInput(text: string): void {
        this.usernameInput().sendKeys(text);
    }

    getPasswordInput(): Promise<string> {
        return this.passwordInput().getText() as Promise<string>;
    }

    getLoginMessage(): Promise<string> {
        return this.loginMessage().getText() as Promise<string>;
    }

    setPasswordInput(text: string): void {
        this.passwordInput().sendKeys(text);
    }

    signIn(): void {
        this.signInButton().click();
    }


}

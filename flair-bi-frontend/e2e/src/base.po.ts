import { browser } from 'protractor';
export abstract class BasePage {

    /**
     * Get path of this page excluding hostname part.
     */
    abstract getPath(): string;

    /**
     * Navigate to this page in the browser.
     */
    navigateTo(): Promise<unknown> {
        browser.get(this.getPageUrl()) as Promise<unknown>;
        return browser.wait(async () => {
            return await this.isLoaded();
        }, 9000, `timeout: waiting for page to load. The url is: ${this.getPageUrl()}`) as Promise<unknown>;
    }

    /**
     * Page url.
     */
    getPageUrl(): string {
        return `${browser.baseUrl}#/${this.getPath()}`;
    }

    abstract isLoaded(): Promise<boolean>;

}
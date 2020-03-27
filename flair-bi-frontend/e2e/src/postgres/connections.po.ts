import { BasePage } from '../base.po';
import { $, element, by } from 'protractor';

export class ConnectionsPage extends BasePage {

    private _tdConnectionName = (name: string) => element(by.xpath(`//td[text()="${name}"]`));

    getPath(): string {
        return "administration/connection";
    }
    isLoaded(): Promise<boolean> {
        return $('.fbibox-content').isPresent() as Promise<boolean>;
    }

    hasConnection(connectionName: string): Promise<boolean> {
        return this._tdConnectionName(connectionName).isPresent() as Promise<boolean>;
    }

}
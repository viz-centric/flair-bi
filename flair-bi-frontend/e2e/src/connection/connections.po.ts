import { BasePage } from '../base.po';
import { ElementFinder, $, element, by } from 'protractor';
import { DeleteDialog } from '../common/delete-dialog.po';

export class ConnectionsPage extends BasePage {

    private _content: ElementFinder = $('.fbibox-content');

    private _connectionElement = (name: string) => element(by.xpath(`//*[text()='${name}']/ancestor::tr`));


    getPath(): string {
        return "administration/connection";
    }
    isLoaded(): Promise<boolean> {
        return this._content.isPresent() as Promise<boolean>;
    }

    hasConnection(name: string): Promise<boolean> {
        return this._connectionElement(name).isPresent() as Promise<boolean>;
    }

    openDeleteDialog(name: string): DeleteDialog {
        this._connectionElement(name)
            .element(by
                .css('button[ui-sref="connection.delete({connectionId:connection.id})"]'))
            .click();

        return new DeleteDialog();
    }

}

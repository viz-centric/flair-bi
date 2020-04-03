import { BasePage } from '../base.po';
import { element, by, ElementArrayFinder, ElementFinder, $ } from 'protractor';
import { DeleteDialog } from '../common/delete-dialog.po';
import { CreateEditUserDialog } from './create-edit-user.dialog';

export class UserManagementPage extends BasePage {

    private _users: ElementArrayFinder = element.all(by.repeater('user in vm.users'));

    private _addUserBtn: ElementFinder = $('button[ui-sref="user-management.new"]')

    getPath(): string {
        return "administration/user-management";
    }
    isLoaded(): Promise<boolean> {
        return this._users.isPresent() as Promise<boolean>;
    }

    hasUser(login: string): Promise<boolean> {
        return this._users.filter((el) => {
            return el.element(by.cssContainingText('td', login)).isPresent();
        })
            .first()
            .isPresent() as Promise<boolean>;

    }

    hasProfiles(login: string, profiles: String[]): Promise<boolean> {
        let el: ElementFinder = this._users.filter((el) => {
            return el.element(by.cssContainingText('td', login)).isPresent();
        }).first()
            .element(by.repeater('userGroup in user.userGroups'));

        return Promise.resolve(profiles.filter((value: string) => {
            return el.element(by.cssContainingText('span', value)).isPresent();
        })
            .length === profiles.length);
    }

    addUser(): CreateEditUserDialog {
        this._addUserBtn.click();
        return new CreateEditUserDialog();
    }

    viewUser(login: string): any {
        this._users.filter((el) => {
            return el.element(by.cssContainingText('td', login)).isPresent();
        })
            .first()
            .element(by.css('button[ui-sref="user-management-detail({login:user.login})"]'))
            .click();
    }

    editUser(login: string): CreateEditUserDialog {
        this._users.filter((el) => {
            return el.element(by.cssContainingText('td', login)).isPresent();
        })
            .first()
            .element(by.css('button[ui-sref="user-management.edit({login:user.login})"]'))
            .click();
        return new CreateEditUserDialog();
    }

    deleteUser(login: string): DeleteDialog {
        this._users.filter((el) => {
            return el.element(by.cssContainingText('td', login)).isPresent();
        })
            .first()
            .element(by.css('button[ui-sref="user-management.delete({login:user.login})"]'))
            .click();
        return new DeleteDialog();
    }


}
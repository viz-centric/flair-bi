import { CreateEditDialog } from '../common/create-edit-dialog.po';
import { ElementFinder, element, by, ElementArrayFinder } from 'protractor';
import { RegisteredUser } from './registered-user.data';

export class CreateEditUserDialog extends CreateEditDialog {

    private _loginInput: ElementFinder = element(by.model("vm.user.login"));
    private _firstNameInput: ElementFinder = element(by.model('vm.user.firstName'));
    private _lastNameInput: ElementFinder = element(by.model('vm.user.lastName'));
    private _emailInput: ElementFinder = element(by.model('vm.user.email'));
    private _langSelect: ElementFinder = element(by.model('vm.user.langKey')); // TODO create as separate logic
    private _langOptions: ElementArrayFinder = element.all(by.options("language as language for language in vm.languages track by language"));
    private _profilesOptions: ElementArrayFinder = element.all(by.options("userGroup for userGroup in vm.userGroups"));


    selectProfiles(profiles: String[]): CreateEditUserDialog {
        this._profilesOptions.filter(async (el) => {
            const text = await el.getText();
            return profiles.indexOf(text) > -1;
        }).click();
        return this;
    }


    enter(data: RegisteredUser): CreateEditUserDialog {
        this._loginInput.sendKeys(data.username);
        this._firstNameInput.sendKeys(data.firstName);
        this._lastNameInput.sendKeys(data.lastName);
        this._emailInput.sendKeys(data.email);
        this._langSelect.click();
        this._langOptions.filter(async (el) => {
            const text = await el.getText();
            return text === data.lang;
        }).first().click();
        this.selectProfiles(data.profiles);
        return this;
    }


}
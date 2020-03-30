import { ElementFinder, $ } from 'protractor';

export class DeleteDialog {

    private _delBtn: ElementFinder = $('.modal-dialog button[type="submit"]');
    private _cancelBtn: ElementFinder = $('.modal-dialog button[data-dismiss]');

    delete(): void {
        this._delBtn.click();
    }

    cancel(): void {
        this._cancelBtn.click();
    }

}
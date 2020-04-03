import { ElementFinder, $ } from 'protractor';

export class Dialog {
    protected _submitBtn: ElementFinder = $('.modal-dialog button[type="submit"]');
    protected _dismissBtn: ElementFinder = $('.modal-dialog button[data-dismiss]');

    submit(): void {
        this._submitBtn.click();
    }

    dismiss(): void {
        this._dismissBtn.click();
    }
}
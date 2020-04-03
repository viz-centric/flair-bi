import { Dialog } from './dialog.po';

export class CreateEditDialog extends Dialog {


    save(): void {
        this._submitBtn.click();
    }

    cancel(): void {
        this._dismissBtn.click();
    }
}
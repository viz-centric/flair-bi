import { CreateEditDialog } from '../common/create-edit-dialog.po';
import { ViewData } from './view.data';
import { ElementFinder, element, by } from 'protractor';
import { ViewsPage } from './views.po';

export class CreateEditViewDialog extends CreateEditDialog {

    private _name: ElementFinder = element(by.model('vm.views.viewName'));
    private _description: ElementFinder = element(by.model('vm.views.description'));

    private _id: string;

    constructor(id: string) {
        super();
        this._id = id;
    }

    enterName(name: string): CreateEditViewDialog {
        this._name.clear();
        this._name.sendKeys(name);
        return this;
    }

    enterDescription(description: string): CreateEditViewDialog {
        this._description.clear();
        this._description.sendKeys(description);
        return this;
    }
    enter(view: ViewData): CreateEditViewDialog {
        return this.enterName(view.name)
            .enterDescription(view.description);
    }

    save(): ViewsPage {
        super.save();
        return new ViewsPage(this._id);
    }

    cancel(): ViewsPage {
        super.cancel();
        return new ViewsPage(this._id);
    }

}
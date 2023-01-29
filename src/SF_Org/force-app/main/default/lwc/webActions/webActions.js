import { LightningElement, api, track } from 'lwc';

export default class WebActions extends LightningElement {
    @api
    get primaryId() {
        return this._primaryId;
    }
    set primaryId(value) {
        this._primaryId = value;
    }

    @track _primaryId = '1';
    handleClick(event) {
        console.log('clicked');
    }
}
import { LightningElement, track, api } from 'lwc';

export default class Sidebar extends LightningElement {
    @api
    get pathName() {
        return this._pathName;
    }
    set pathName(value) {
        this._pathName = value;
    }

    @api
    get actions() {
        return this._actions.map(item => ({
            ...item,
            selected: item.name === this._pathName,
            className:
                item.name === this._pathName
                    ? 'action-box action-box-selected'
                    : 'action-box',
            variant: item.name === this._pathName ? 'inverse' : 'base'
        }));
    }
    set actions(value) {
        this._actions = value;
    }

    @track _actions = [];
    iconSize = 'medium'; // large / medium / small
    _pathName = '';

    onSelectAction(event) {
        const actionBox = event.target.classList.contains('action-box')
            ? event.target
            : event.target.closest('.action-box');
        const actionName = actionBox.dataset.name;
        this._pathName = actionName;

        this.dispatchEvent(
            new CustomEvent('select', {
                detail: actionName
            })
        );
    }
}

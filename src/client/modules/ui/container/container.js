import { LightningElement, api } from 'lwc';
import deafultView from './templates/headerAndThreeColumns.html';
export default class Container extends LightningElement {
    @api theme;
    @api links;
    get links() {
        return this._links.map(item => ({
            ...item,
            active: this.pathName === item.name,
            className:
                this.pathName === item.name
                    ? 'web-menu-item active'
                    : 'web-menu-item'
        }));
    }
    set links(value) {
        this._links = value;
    }
    @api
    get pathName() {
        return this._pathName;
    }
    set pathName(value) {
        this._pathName = value;
    }
    _pathName = '';
    _links = [];
    connectedCallback() {
        if (this.links.length) this._pathName = this.links[0].name;
    }

    render() {
        return deafultView;
    }
    isMenuOpen = false;
    handleLinkClick(event) {
        event.preventDefault();
        const actionName = event.target.dataset.name;
        this._pathName = actionName;
        console.log('actionName: ' + actionName);
        this.dispatchEvent(
            new CustomEvent('navigate', {
                detail: {
                    actionName
                }
            })
        );
    }
    handleToggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
    }

    get hamburgerMenuIcon() {
        return this.isMenuOpen ? 'utility:close' : 'utility:justify_text';
    }
}

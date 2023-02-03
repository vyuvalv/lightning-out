import { LightningElement, api } from 'lwc';
// templates
import home from './templates/home.html';
import sfdxPage from './templates/sfdxPage.html';
import calendarApp from './templates/calendarApp.html';

export default class ContentBody extends LightningElement {
    @api pathName;
    @api hide;
    // get pathName() {
    //     return this._pathName;
    // }
    // set pathName(value) {
    //     this._pathName = value;
    // }
    // _pathName;
    connectedCallback() {
        console.log('path body ' + this.pathName);
    }
    render() {
        if (this.pathName === '/sfdxPage') return sfdxPage;
        else if (this.pathName === '/calendar') return calendarApp;
        return home;
    }
    get hidden() {
        return this.hide;
    }
    publish(event) {
        this.dispatchEvent(
            new CustomEvent('publish', {
                detail: event.detail
            })
        );
    }
}

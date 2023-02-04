import { LightningElement, api } from 'lwc';
// templates
import home from './templates/home.html';
import orgData from './templates/orgData.html';
import calendarApp from './templates/calendarApp.html';

export default class ContentBody extends LightningElement {
    @api pathName;
    @api hide;

    render() {
        if (this.pathName === '/org') return orgData;
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

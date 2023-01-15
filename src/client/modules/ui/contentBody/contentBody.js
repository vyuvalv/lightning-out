import { LightningElement, api } from 'lwc';
// templates
import home from './templates/home.html';
import sfdxPage from './templates/sfdxPage.html';
import calendarApp from './templates/calendarApp.html';

export default class ContentBody extends LightningElement {
    @api pathName;

    render() {
        if (this.pathName === '/sfdxPage') return sfdxPage;
        else if (this.pathName === '/calendar') return calendarApp;
        return home;
    }

    publish(event) {
        this.dispatchEvent(
            new CustomEvent('publish', {
                detail: event.detail
            })
        );
    }
}

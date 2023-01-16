import { LightningElement, api } from 'lwc';
import deafultView from './templates/headerAndThreeColumns.html';
export default class Container extends LightningElement {
    @api theme;
    @api links;

    render() {
        return deafultView;
    }
}

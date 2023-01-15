import { LightningElement, api } from 'lwc';
import { reduceErrors } from 'c/errorUtils';
import noDataIllustration from './templates/noDataIllustration.html';
import inlineMessage from './templates/inlineMessage.html';
import standardError from './templates/standardError.html';
import imageError from './templates/imageError.html';
const svgs = '../../../resources/images/svg';

export default class ErrorPanel extends LightningElement {
    /** Single or array of LDS errors */
    @api errors;
    /** Generic / user-friendly message */
    @api friendlyMessage = 'Oops.. Something happend !';
    /** Type of error message **/
    @api type;

    images = {
        noEvents: `${svgs}/noTasks.svg`,
        noTasks: `${svgs}/noTasks.svg`,
        openRoad: `${svgs}/OpenRoad.svg`
    };

    viewDetails = false;

    get errorMessages() {
        return reduceErrors(this.errors);
    }

    handleShowDetailsClick() {
        this.viewDetails = !this.viewDetails;
    }

    render() {
        if (this.type === 'inlineMessage') return inlineMessage;
        else if (this.type === 'standard') return standardError;
        else if (this.type === 'image') return imageError;
        return noDataIllustration;
    }
}

import { LightningElement, api } from 'lwc';
import { reduceErrors } from 'c/errorUtils';
import noDataIllustration from './templates/noDataIllustration.html';
import inlineMessage from './templates/inlineMessage.html';
import standardError from './templates/standardError.html';
import notificationToast from './templates/notification.html';

export default class ErrorPanel extends LightningElement {
    /** Single or array of LDS errors */
    @api errors;
    /** Generic / user-friendly message */
    @api friendlyMessage = 'Oops.. Something happend !';
    /** Type of error message **/
    @api type;
    /** Severity of error message **/
    @api severity;

    viewDetails = false;

    get errorMessages() {
        return reduceErrors(this.errors);
    }

    handleShowDetailsClick() {
        this.viewDetails = !this.viewDetails;
    }
    handleClose() {
        this.dispatchEvent(new CustomEvent('close', {}));
    }
    get severityClass() {
        const baseClass = `slds-notify slds-notify_toast slds-size_1-of-1`;
        if (this.severity === 'info') {
            return `${baseClass} slds-theme_info`;
        } else if (this.severity === 'warning') {
            return `${baseClass} slds-theme_warning`;
        }
        return `${baseClass} slds-theme_error`;
    }

    render() {
        if (this.type === 'inlineMessage') return inlineMessage;
        else if (this.type === 'standard') return standardError;
        else if (this.type === 'toast') return notificationToast;
        return noDataIllustration;
    }
}

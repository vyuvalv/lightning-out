import { LightningElement, track } from 'lwc';
import { getData } from 'data/services';
import { AllObjectsQuery, ListViewsQuery } from './data/ql-queries';

export default class ListViews extends LightningElement {
    @track _objectOptions;
    @track _listviews;
    @track _listViewDetails;

    selectedlistViewId;
    selectedObjectName;

    errors;
    errorTitle = 'Error';
    errorType = 'error';

    connectedCallback() {
        this.getAllObjects();
    }
    get objectOptions() {
        return this._objectOptions
            ? this._objectOptions.map(opt => ({
                  value: opt.name,
                  label: opt.label
              }))
            : [];
    }
    get listViewsOptions() {
        return this._listviews
            ? this._listviews.map(opt => ({ value: opt.id, label: opt.label }))
            : [];
    }
    get listViewDetails() {
        return this._listViewDetails
            ? JSON.stringify(this._listViewDetails)
            : '';
    }

    handleSelectedObject(event) {
        this.selectedObjectName = event.detail.value;
        console.log('objName : ' + this.selectedObjectName);
        this.getListViews(this.selectedObjectName);
    }
    handleSelectedListView(event) {
        this.selectedlistViewId = event.detail.value;
        console.log('listViewId : ' + this.selectedlistViewId);
        // this.getListViewDetails( this.selectedObjectName,  this.selectedlistViewId );
    }
    async getAllObjects() {
        this.loading = true;
        const graphQuery = AllObjectsQuery();
        try {
            const response = await getData(graphQuery);
            if (response.data.getAllObjects) {
                this._objectOptions = response.data.getAllObjects.sobjects;
                // console.log('response getAllObjects :', response);
                this.loading = false;
            } else {
                this.showErrorPanel(
                    response.errors,
                    'Failed to get Objects..',
                    'error'
                );
            }
        } catch (error) {
            console.log(`error ${error.message}`);
            this.showErrorPanel(error, 'Logged Out', 'error');
        }
    }
    handleErrors(event) {
        this.showErrorPanel(
            event.detail,
            'Failed to get List View Details..',
            'error'
        );
    }
    async getListViews(objectName) {
        this.loading = true;
        const graphQuery = ListViewsQuery(objectName);
        try {
            const response = await getData(graphQuery);
            if (response.data.getListViews) {
                console.log(
                    'response ListViewsQuery :',
                    response.data.getListViews
                );
                this._listviews = response.data.getListViews.listviews;

                this.loading = false;
            } else {
                this.showErrorPanel(
                    response.errors,
                    'Failed to get ListViews..',
                    'error'
                );
            }
        } catch (error) {
            console.log(`error ${error.message}`);
            this.showErrorPanel(error, 'Not able to get list views', 'error');
        }
    }

    showErrorPanel(messages, title = 'error', severity = 'error') {
        this.errors = messages;
        this.errorTitle = title;
        this.errorType = severity;
    }
    handleCloseErrors() {
        this.errors = false;
    }
}

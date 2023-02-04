import { LightningElement, api, track } from 'lwc';
import { getData } from 'data/services';

import { ListViewsDetailsQuery } from 'data/queries';

export default class ListView extends LightningElement {
    @api objectName;
    @api listViewId;

    loading = false;
    @track _listViewDetails;
    @track _columns;
    @track _records;

    connectedCallback() {
        if (this.objectName && this.listViewId) {
            this.getListViewDetails(this.objectName, this.listViewId);
        }
    }
    get listViewDetails() {
        return this._listViewDetails
            ? JSON.stringify(this._listViewDetails)
            : '';
    }
    async getListViewDetails(objectName, listViewId) {
        this.loading = true;
        const graphQuery = ListViewsDetailsQuery(objectName, listViewId);
        try {
            const response = await getData(graphQuery);
            if (response.data.getListViewDetails) {
                this._listViewDetails = response.data.getListViewDetails;
                console.log('response _listViewDetails :', response);
                this._columns = response.data.getListViewDetails.columns;
                this._records = response.data.getListViewDetails.records;
                this.loading = false;
            } else {
                this.dispatchEvent(
                    new CustomEvent('error', {
                        detail: { errors: response.errors }
                    })
                );
            }
        } catch (error) {
            console.log(`error ${error.message}`);
        }
    }

    get columns() {
        return this._columns.map(item => ({
            label: item.label,
            fieldName: item.fieldNameOrPath,
            type: 'text'
        }));
    }
    get records() {
        return this._records;
    }
}

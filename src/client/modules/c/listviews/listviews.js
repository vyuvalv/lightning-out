import { LightningElement, track } from 'lwc';
import { getData } from 'data/services';
import { AllObjectsQuery, ListViewsQuery, ListViewsDetailsQuery } from './data/ql-queries';

export default class ListViews extends LightningElement { 
    @track _objectOptions;
    @track _listviews;
    @track _listViewDetails;

    selectedlistViewId;
    selectedObjectName;

    connectedCallback() {
        this.getAllObjects();
    }
    get objectOptions() {
        return this._objectOptions ? this._objectOptions.map(opt => ({ value: opt.name, label: opt.label })):[];
    }
    get listViewsOptions() {
        return this._listviews ? this._listviews.map(opt => ({ value: opt.id, label: opt.label })):[];
    }
    get listViewDetails() {
        return this._listViewDetails ? JSON.stringify(this._listViewDetails) : '';
    }

    handleSelectedObject(event) {
        this.selectedObjectName = event.detail.value;
        console.log('objName : ' + this.selectedObjectName);
        this.getListViews( this.selectedObjectName );
    }
    handleSelectedListView(event) {
        this.selectedlistViewId = event.detail.value;
        console.log('listViewId : ' + this.selectedlistViewId);
        this.getListViewDetails( this.selectedObjectName,  this.selectedlistViewId );
    }
    async getAllObjects() {
        this.loading = true;
        const graphQuery = AllObjectsQuery();
        try {
            const response = await getData(graphQuery);
            if (response){
                this._objectOptions = response.data.getAllObjects.sobjects;
                console.log('response getAllObjects :', response);
                this.loading = false;
            }
        }
        catch (error) {
            console.log(`error ${error.message}`);
        }
    }

    async getListViews(objectName) {
        this.loading = true;
        const graphQuery = ListViewsQuery(objectName);
        try {
            const response = await getData(graphQuery);
            if (response) {
                console.log('response ListViewsQuery :', response);
                this._listviews = response.data.getListViews.listviews;
            
                this.loading = false;
            }
        }
        catch (error) {
            console.log(`error ${error.message}`);
        }
    }
    async getListViewDetails(objectName, listViewId) {
        this.loading = true;
        const graphQuery = ListViewsDetailsQuery(objectName, listViewId);
        try {
            const response = await getData(graphQuery);
            if (response){
                this._listViewDetails = response.data.getListViewDetails;
                console.log('response _listViewDetails :', response);
                this.loading = false;
            }
        }
        catch (error) {
            console.log(`error ${error.message}`);
        }
    }

}
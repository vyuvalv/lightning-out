/* eslint-disable no-prototype-builtins */
import { LightningElement, api, track } from 'lwc';
import { getUserInfo, getRecords, createRecord } from 'data/services';

const ENDPOINT = '/api/v1/accounts';
const FIELDS = ['Name', 'Type'];

const NAV_ACTIONS = [
    {
        name: '/home',
        label: 'Home',
        iconName: 'utility:home'
    },
    {
        name: '/calendar',
        label: 'Calendar',
        iconName: 'utility:event'
    },
    {
        name: '/sfdxPage',
        label: 'SFDX',
        iconName: 'utility:settings'
    }
];

export default class App extends LightningElement {
    @api
    get pathName() {
        return this._pathName;
    }
    set pathName(value) {
        this._pathName = value;
    }
    _pathName = '/about';
    sidebarActions = NAV_ACTIONS;

    _currentUser;

    handleSidebarSelect(event) {
        const actionName = event.detail;
        console.log('actionName ' + actionName);
        this._pathName = actionName;
        window.history.pushState(
            { page: this._pathName },
            this._pathName,
            `?page=${this._pathName}`
        );
    }

    get currentUser() {
        return this._currentUser ? this._currentUser : '';
    }
    results = '';
    @track records = [];

    connectedCallback() {
        // this.loadRecords();
        console.log('app path ' + this.pathName);
    }

    loadRecords() {
        // fetch data
        // const soql = `SELECT Id, Name, Type FROM Account LIMIT 100`;
        // const myRequest = new Request({
        //     soql: soql
        // });

        getRecords(ENDPOINT)
            .then(reponse => {
                let records = [];
                reponse.forEach(record => {
                    let item = { Id: record.Id };
                    FIELDS.forEach(field => {
                        if (record.hasOwnProperty(field)) {
                            item[field] = record[field];
                        }
                    });
                    records.push(item);
                });
                this.records = records;
                this.results = JSON.stringify(records);
            })
            .catch(error => {
                console.log(error);
            });
    }

    accessToken;
    instanceUrl;
    userId = '';
    loggedIn = false;

    onLogin(event) {
        this.userId = event.detail.userId;
        console.log('userId : ' + this.userId);
        this.getUser();
    }

    create() {
        const record = { Name: 'My Account #4' };

        createRecord(record)
            .then(reponse => {
                if (reponse) {
                    console.log('created record ' + JSON.stringify(reponse));
                }
            })
            .catch(error => {
                console.log(error);
            });
    }

    getUser() {
        this.accessToken = window.sessionStorage.getItem('sf_accessToken');
        this.instanceUrl = window.sessionStorage.getItem('sf_instanceUrl');
        console.log('getting accessToken ' + this.accessToken);
        getUserInfo(this.userId, this.accessToken, this.instanceUrl)
            .then(reponse => {
                if (reponse.data) {
                    // console.log('logged in successfully ' + JSON.stringify(reponse.data[0]));
                    this._currentUser = reponse.data[0];
                }
            })
            .catch(error => {
                console.log(error);
            });
    }
}

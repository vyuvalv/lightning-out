/* eslint-disable no-prototype-builtins */
import { LightningElement, api, track } from 'lwc';
import { getData, getRecords, createRecord } from 'data/services';
import { UserQuery, UpdateUserQuery } from './data/sfQuery';
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
    loading = false;
    handleMenuItemSelect(event) {
        const { actionName } = event.detail;
        this.addToBrowserHistory(actionName);
    }
    handleSidebarSelect(event) {
        const actionName = event.detail;
        console.log('actionName ' + actionName);
        this.addToBrowserHistory(actionName);
    }
    addToBrowserHistory(actionName) {
        if (actionName) {
            this._pathName = actionName;

            window.history.pushState(
                { page: this.pathName },
                this.pathName,
                `?page=${this.pathName}`
            );
        }
    }

    results = '';
    @track records = [];

    connectedCallback() {
        // this.loadRecords();
        console.log('app path ' + this.pathName);
    }
    renderLightningOut() {
        // Post Message to main index.js to render lightning out
        window.postMessage(
            {
                accessToken: this.accessToken,
                instanceUrl: this.instanceUrl
            },
            'http://localhost:3001'
        );
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
    orgId;
    activeUserId = '';
    loggedIn = false;
    rightSideBarOpen = false;
    handleLoginUser() {
        console.log('login');
        if (this.loggedIn) {
            this.rightSideBarOpen = !this.rightSideBarOpen;
            this.toggleRightSidebar(this.rightSideBarOpen);
        } else {
            console.log('nologin');
            this.activeUserId = '';
            this.loginToOrg();
        }
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
    toggleRightSidebar(toggle = true) {
        const container = this.template.querySelector('ui-container');
        if (container) container.toggleRightPanel(toggle);
    }

    async loginToOrg() {
        this.loading = true;
        const graphQuery = UserQuery();
        try {
            const response = await getData(graphQuery);
            if (response) {
                const details = response.data.login;

                this.activeUserId = details.userId;
                this.accessToken = details.accessToken;
                this.instanceUrl = details.loginUrl;
                this.orgId = details.organizationId;

                console.log(
                    'details.loggedInUser : ' +
                        JSON.stringify(details.loggedInUser)
                );
                // Set login detail in session storage
                window.sessionStorage.setItem(
                    'sf_accessToken',
                    details.accessToken
                );
                window.sessionStorage.setItem(
                    'sf_instanceUrl',
                    details.loginUrl
                );
                window.sessionStorage.setItem('sf_userId', details.userId);
                window.sessionStorage.setItem(
                    'sf_orgId',
                    details.organizationId
                );
                // Sets Logged In flag
                this.loggedIn = true;
                // Get User Details
                this._currentUser = details.loggedInUser;
                this.loading = false;
                this.rightSideBarOpen = true;
                this.toggleRightSidebar(this.rightSideBarOpen);
            }
        } catch (error) {
            this.loggedIn = false;
            this.loading = false;
            //if(typeof error !== 'object')
            console.error('cannot login ' + error);
        }
    }
    userReadOnly = true;
    async handleUpdateUser(event) {
        const fields = event.detail;

        // const record = fields.reduce((rec, field) => {
        //                     return {...rec, [field.name]: field.value };
        // }, {});
        const record = fields.reduce((rec, field) => {
            return ` ${rec} ${field.name}: "${field.value}",`;
        }, '');
        let recordText = `{${record.substring(0, record.length - 1)}}`;
        console.log(`record => ${recordText}`);
        const mutQuery = UpdateUserQuery(recordText);
        try {
            const response = await getData(mutQuery);
            if (response) {
                console.log('success ' + JSON.stringify(response));
                this._currentUser = response.data.updateUser;

                const userProfileComp = this.template.querySelector(
                    'c-user-profile'
                );
                if (userProfileComp) userProfileComp.toggleEditMode();
            }
        } catch (error) {
            console.log('error update record ' + JSON.stringify(error));
        }
    }
    get currentUser() {
        return this._currentUser ? this._currentUser : '';
    }
}

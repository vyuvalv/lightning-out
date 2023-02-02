/* eslint-disable no-prototype-builtins */
import { LightningElement, api, track } from 'lwc';
// import { getData, createRecord } from 'data/services';
// import { UserQuery, UpdateUserQuery } from './data/user-queries';

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
const IS_DEV = true;
const SERVER_URL = `https://test-service-skwt.onrender.com`;
const DEV_SERVER = `http://localhost:3001`;
export default class App extends LightningElement {
    @api
    get pathName() {
        return this._pathName;
    }
    set pathName(value) {
        this._pathName = value;
    }
    _pathName = NAV_ACTIONS[0].name;

    _currentUser;
    loading = false;

    isMenuOpen = false;
    /* SF Login Details */
    userPanelOpen = false;
    loggedIn = false;
    accessToken;
    loginUrl;
    lightningUrl;
    orgId;
    activeUserId = '';
    loggedInTime;

    handleLinkClick(event) {
        event.preventDefault();
        const actionName = event.target.dataset.name;
        this.addToBrowserHistory(actionName);
    }

    results = '';
    @track records = [];

    connectedCallback() {
        console.log('app path ' + this.pathName);
        this.loggedIn = this.getUserDetailsFromSessionStorage();
    }

    getUserDetailsFromSessionStorage() {
        this.accessToken = window.sessionStorage.getItem('sf_accessToken');
        this.loginUrl = window.sessionStorage.getItem('sf_loginUrl');
        this.lightningUrl = window.sessionStorage.getItem('sf_lexUrl');
        this.activeUserId = window.sessionStorage.getItem('sf_userId');
        this.orgId = window.sessionStorage.getItem('orgId');
        return this.accessToken ? true : false;
    }

    renderLightningOut() {
        const TARGET_SERVER = IS_DEV ? DEV_SERVER : SERVER_URL;
        console.log('post message to: ' + TARGET_SERVER);
        // Post Message to main index.js to render lightning out
        window.postMessage(
            {
                appName: 'c:ossWebApp',
                componentName: 'c:webActions',
                componentParams: { primaryId: '123' },
                accessToken: this.accessToken,
                lightningUrl: this.lightningUrl,
                loginUrl: this.loginUrl
            },
            TARGET_SERVER
        );
    }

    toggleUserPanel() {
        this.loggedIn = this.getUserDetailsFromSessionStorage();
        this.userPanelOpen = !this.userPanelOpen;
    }

    // create() {
    //     const record = { Name: 'My Account #4' };

    //     createRecord(record)
    //         .then(reponse => {
    //             if (reponse) {
    //                 console.log('created record ' + JSON.stringify(reponse));
    //             }
    //         })
    //         .catch(error => {
    //             console.log(error);
    //         });
    // }

    handleUpdateUser(event) {
        this._currentUser = event.detail.currentUser;
        console.log('currentUser ' + JSON.stringify(this.currentUser));
        this.loggedIn = true;
    }

    get currentUser() {
        return this._currentUser ? this._currentUser : '';
    }

    /* Header panel */
    get sidebarActions() {
        const currentPath = this.pathName;
        return NAV_ACTIONS.map(item => ({
            ...item,
            active: `${currentPath}` === `${item.name}`,
            className:
                `${currentPath}` === `${item.name}`
                    ? 'web-menu-item active'
                    : 'web-menu-item'
        }));
    }
    toggleRightPanel(toggle) {
        const grid = this.template.querySelector('.web-grid-container');
        const rightSideWidth = toggle ? '12rem' : '3rem';
        grid.style.setProperty('--rightbar-width', rightSideWidth);
    }
    handleToggleHamburgerMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        const grid = this.template.querySelector('.header-bar');
        const grid_dir = this.isMenuOpen ? 'column' : 'row';
        const grid_width = this.isMenuOpen ? '100%' : '20%';
        grid.style.setProperty('--topbar-direction', grid_dir);
        grid.style.setProperty('--topbar-menu-width', grid_width);
    }
    handleCloseUserPanel() {
        this.userPanelOpen = false;
        // this.toggleRightPanel(this.userPanelOpen);
    }
    get hamburgerMenuIcon() {
        return this.isMenuOpen ? 'utility:close' : 'utility:justify_text';
    }
    get loginButton() {
        return {
            name: 'login',
            label: this.loggedIn
                ? 'Connected'
                : this.userPanelOpen
                ? 'Close > '
                : 'Log in'
        };
    }

    /* Handle Browser History on Navigation */
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
}

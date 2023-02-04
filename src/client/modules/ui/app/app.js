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
        name: '/org',
        label: 'Org Data',
        iconName: 'utility:settings'
    }
];
// Server Endpoint
const IS_DEV = true;
const SERVER_URL = `https://test-service-skwt.onrender.com`;
const DEV_SERVER = `http://localhost:3001`;
const TARGET_SERVER = IS_DEV ? DEV_SERVER : SERVER_URL;
export default class App extends LightningElement {
    @api
    get pathName() {
        return this._pathName;
    }
    set pathName(value) {
        this._pathName = `${value}`;
    }
    @api
    get lwcOutIsRendered() {
        return this._lwcOutIsRendered;
    }
    set lwcOutIsRendered(value) {
        this._lwcOutIsRendered = value;
    }
    _pathName = NAV_ACTIONS[0].name;

    loading = false;
    isMenuOpen = false;
    _lwcOutIsRendered = false;
    /* SF Login Details */
    userPanelOpen = false;
    loggedIn = false;
    accessToken;
    loginUrl;
    lightningUrl;
    orgId;
    activeUserId = '';
    @track _currentUser;
    numberOfHours = 0;
    connectedCallback() {
        console.log('app path ' + this.pathName);
        this.loggedIn = this.getUserDetailsFromSessionStorage();
        // Sets Home page URL
        // if(this.pathName)
        // this.addToBrowserHistory(this.pathName);
    }

    getUserDetailsFromSessionStorage() {
        this.accessToken = window.sessionStorage.getItem('sf_accessToken');
        this.loginUrl = window.sessionStorage.getItem('sf_loginUrl');
        this.lightningUrl = window.sessionStorage.getItem('sf_lexUrl');
        this.activeUserId = window.sessionStorage.getItem('sf_userId');
        this.orgId = window.sessionStorage.getItem('orgId');
        const userObj = window.sessionStorage.getItem('sf_user');
        this._currentUser = userObj ? JSON.parse(userObj) : null;
        const timstamp = window.sessionStorage.getItem('sf_login_timestamp');
        this.numberOfHours = this.hoursSince(timstamp);
        return this.accessToken ? true : false;
    }
    hoursSince(inputDate) {
        var currentDate = new Date();
        var differenceInMs = currentDate - new Date(inputDate);
        var differenceInSeconds = differenceInMs / 1000;
        var hours = Math.floor(differenceInSeconds / 3600);
        var minutes = Math.floor((differenceInSeconds % 3600) / 60);
        var seconds = Math.floor(differenceInSeconds % 60);
        return `${hours
            .toString()
            .padStart(2, '0')} hs ${minutes
            .toString()
            .padStart(2, '0')} mins and ${seconds
            .toString()
            .padStart(2, '0')} ago`;
    }
    // Site Navigationg links
    handleLinkClick(event) {
        event.preventDefault();
        const actionName = event.target.dataset.name;
        if (this.isMenuOpen) this.handleToggleHamburgerMenu();
        if (this.userPanelOpen) {
            this.userPanelOpen = false;
        }
        this.addToBrowserHistory(actionName);
    }

    /* Header panel links */

    get siteMenuLinks() {
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

    /*  Handle SF Login Panel */
    get loginButton() {
        return {
            name: 'loginButton',
            iconName: this.loggedIn
                ? this.currentUser
                    ? 'utility:user'
                    : 'utility:block_visitor'
                : 'utility:adduser',
            variant: this.loggedIn
                ? this.currentUser
                    ? 'success'
                    : 'warning'
                : 'error',
            label: this.loggedIn
                ? 'Connected'
                : this.userPanelOpen
                ? 'Register'
                : 'Log in to Org'
        };
    }

    renderLightningOut() {
        console.log('post message to: ' + TARGET_SERVER);
        this._lwcOutIsRendered = true;
        // Post Message to main index.js to render lightning out
        window.postMessage(
            {
                appName: 'c:ossWebApp',
                componentName: 'c:webActions',
                componentParams: { primaryId: this.pathName },
                accessToken: this.accessToken,
                lightningUrl: this.lightningUrl,
                loginUrl: this.loginUrl
            },
            TARGET_SERVER
        );
    }

    /* User Notifier */
    handleUpdateUser(event) {
        const { actionName } = event.detail;
        this._currentUser = event.detail.currentUser;
        console.log('refreshed - ' + actionName);
        if (actionName === 'login') {
            this.loggedIn = this.getUserDetailsFromSessionStorage();
        }
    }
    handleLogout(event) {
        const isLoggedOut = event.detail;
        this.loggedIn = !isLoggedOut;
        if (isLoggedOut) {
            this._currentUser = null;
        }
    }
    get currentUser() {
        return this._currentUser ? this._currentUser : '';
    }
    // On click handler
    toggleUserPanel() {
        this.loggedIn = this.getUserDetailsFromSessionStorage();
        this.userPanelOpen = !this.userPanelOpen;
        // Close menu if open
        if (this.isMenuOpen) {
            this.handleToggleHamburgerMenu();
        }
    }
    // On click close handler
    handleCloseUserPanel() {
        this.userPanelOpen = false;
    }
    /* Mobile Menu Support */
    handleToggleHamburgerMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        const grid = this.template.querySelector('.header-bar');
        const grid_dir = this.isMenuOpen ? 'column' : 'row';
        const grid_width = this.isMenuOpen ? '60%' : '20%';
        const grid_height = this.isMenuOpen ? '50%' : '5rem';
        grid.style.setProperty('--topbar-direction', grid_dir);
        grid.style.setProperty('--topbar-menu-item-width', grid_width);
        grid.style.setProperty('--topbar-height', grid_height);
        grid.style.setProperty(
            '--topbar-display',
            this.isMenuOpen ? 'flex' : 'none'
        );
        grid.classList.toggle('header-bar-mobile');
        // Close other open modals
        if (this.isMenuOpen) {
            this.userPanelOpen = false;
        }
    }
    /* Hamburger Menu Icon toggle */
    get hamburgerMenuIcon() {
        return this.isMenuOpen ? 'utility:close' : 'utility:justify_text';
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

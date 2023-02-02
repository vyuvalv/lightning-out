/* eslint-disable default-case */
import { LightningElement, api, track } from 'lwc';
import {
    UserDataQuery,
    CredentialsQuery,
    UpdateUserQuery,
    AuthLoginQuery
} from 'data/queries';
import { getData } from 'data/services';

const flags = '/resources/images/flags';
const MORNING_TIME = 12,
    NOON_TIME = 16;

const LOGIN_FIELDS = ['username', 'password', 'securityToken', 'loginUrl'];
const VIEW_FIELDS = ['Name', 'Email', 'LastLoginDate'];
const EDIT_FIELDS = ['FirstName', 'LastName', 'Email'];
const FIELDS_LABELS = {
    Name: 'Name',
    FirstName: 'First Name',
    LastName: 'Last Name',
    Email: 'Email',
    LastLoginDate: 'Last Login Date',
    username: 'User Name',
    password: 'Password',
    securityToken: 'Security Token',
    loginUrl: 'Login Url'
};

const LANG_LABELS = {
    'en-GB': {
        label: 'English (GB)',
        key: 'en',
        image: flags + '/uk.svg'
    },
    en: {
        label: 'English',
        value: 'en',
        image: flags + '/united-states.svg'
    },
    es: {
        label: 'Spanish',
        value: 'es',
        image: flags + '/es.svg'
    },
    he: {
        label: 'Hebrew',
        key: 'iw',
        image: flags + '/il.svg'
    }
};
export default class UserProfile extends LightningElement {
    @api
    get loggedIn() {
        return this._loggedIn;
    }
    set loggedIn(value) {
        this._loggedIn = value;
    }
    @api
    get activeUserId() {
        return this._activeUserId;
    }
    set activeUserId(value) {
        this._activeUserId = value;
    }

    get user() {
        return this._currentUser ? this._currentUser : {};
    }

    _activeUserId;
    _loggedIn = false;
    @track _currentUser;

    currentUserLanguageKey = 'en';
    currentUserLanguage = LANG_LABELS[this.currentUserLanguageKey];
    _languageOptions = [];

    readonly = false;
    serverCredentials = {};
    accessToken;
    instanceUrl;
    lightningUrl;
    orgId;

    connectedCallback() {
        // Set Languages from Browser
        this.currentUserLanguageKey = window.navigator.language;
        this._languageOptions = window.navigator.languages.map(lang => ({
            value: lang,
            ...LANG_LABELS[lang]
        }));
        this.currentUserLanguage = LANG_LABELS[this.currentUserLanguageKey];
    }

    get greeting() {
        const now = new Date();
        // const now = window.performance.now();
        const currentHour = now.getHours();
        const timeInDay =
            currentHour <= MORNING_TIME
                ? 'Morning'
                : currentHour <= NOON_TIME
                ? 'Afternoon'
                : 'Evening';
        // const timeStamp = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
        return `Good ${timeInDay}`;
    }
    get userFullName() {
        return this.loggedIn && this.user
            ? `${this.user.Name}`
            : ` Add your credentials to Salesforce org to login `;
    }
    rendered = false;
    renderedCallback() {
        if (!this.rendered) {
            this.setImageBackground();

            // Login fields
            if (this.loggedIn) {
                this.readonly = true;
                // this._activeUserId = window.sessionStorage.getItem('sf_userId');
                this.handleRefreshUser(false);
            }

            this.rendered = true;
        }
    }

    setImageBackground() {
        const currentHour = new Date().getHours();
        const timeInDay =
            currentHour <= MORNING_TIME
                ? 'MORNING'
                : currentHour <= NOON_TIME
                ? 'NOON'
                : 'EVENING';
        const imgBkg = this.template.querySelector('.user-profile-background');
        switch (timeInDay) {
            case 'MORNING':
                imgBkg.classList.add('morning-background');
                break;
            case 'NOON':
                imgBkg.classList.add('noon-background');
                break;
            case 'EVENING':
                imgBkg.classList.add('evening-background');
                break;
        }
    }

    onSelectAction(event) {
        const selectedMenuItem = event.detail.value;
        // console.log('selectedMenuItem ' + selectedMenuItem);
        switch (selectedMenuItem) {
            case 'viewProfile':
                break;
            case 'editUser':
                break;
        }
    }

    get languages() {
        return this._languageOptions
            .map(lang => ({
                ...lang,
                active: lang.value === this.currentUserLanguageKey
            }))
            .sort((a, b) => (a.active < b.active ? 1 : -1));
    }

    onLanguageHover(event) {
        const editButton = this.template.querySelector('.language-edit-button');
        editButton.classList.toggle('language-edit-button-hide');
        event.preventDefault();
    }

    onLanguageHoverOut() {
        const editButton = this.template.querySelector('.language-edit-button');
        editButton.classList.toggle('language-edit-button-hide');
    }

    handleChangeLanguage(event) {
        const selectedLanguage = event.detail.value;
        console.log('selectedLanguage ' + selectedLanguage);
        this.currentUserLanguageKey = selectedLanguage;
        this.currentUserLanguage = this.languages.find(
            lang => lang.value === selectedLanguage
        );
    }
    get displayedUserFields() {
        const fields = this.loggedIn
            ? this.readonly
                ? VIEW_FIELDS
                : EDIT_FIELDS
            : LOGIN_FIELDS;
        return fields.map(field => ({
            name: field,
            value:
                this.loggedIn && this.user
                    ? this.user[field]
                        ? this.formatValue(field, this.user[field])
                        : ''
                    : this.formatValue(field, this.serverCredentials[field]),
            label: FIELDS_LABELS[field],
            type: field === 'Email' ? 'email' : 'text',
            className: 'user-field'
        }));
    }

    formatValue(field, value) {
        if (field === 'LastLoginDate') {
            const today = new Date(value);

            const formattedDate = new Intl.DateTimeFormat(
                window.navigator.language,
                {
                    dateStyle: 'short',
                    timeStyle: 'long',
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                }
            ).format(today);
            const formattedText = this.calculateTimeFromLastLogin(value);
            return formattedText
                ? `${formattedDate} (${formattedText})`
                : `${formattedDate}`;
        }
        return value;
    }
    calculateTimeFromLastLogin(lastLoginDate) {
        const languageKey = this.currentUserLanguageKey;
        const timeDifference = Date.now() - new Date(lastLoginDate).getTime();
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
            (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
            (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const formattedDate = new Intl.RelativeTimeFormat(languageKey, {
            style: 'narrow'
        });
        // const dayParts = formattedDate.formatToParts(-days, "days");
        const dayParts = formattedDate.format(-days, 'days');
        // const dayPartsText = `${dayParts[0].value} ${dayParts[1].value}`;
        // const hoursParts = formattedDate.formatToParts(-hours, "hours");
        // console.log('hoursParts: ' + JSON.stringify(hoursParts));
        // const hoursPartsText = this.formatHoursPartsToString(hoursParts);
        const hoursPartsText = formattedDate.format(-hours, 'hours');

        const minutesParts = formattedDate.formatToParts(-minutes, 'minutes');

        // const minutesText = `${formattedDate.format(-minutes, 'minutes')}`;

        //    const minutesText = `${minutesParts[1].value} ${minutesParts[1].unit}`;
        const minutesText = this.formatPartsToString(minutesParts);
        // Array formmater
        const formatter = new Intl.ListFormat(languageKey, {
            style: 'long',
            type: 'conjunction'
        });

        const displayTextParts =
            days > 0
                ? [dayParts, hoursPartsText, minutesText]
                : [hoursPartsText, minutesText];
        //const finalText = await formatter.format(displayTextParts);
        return formatter.format(displayTextParts);
    }
    formatPartsToString(parts) {
        return parts.reduce((str, rec, ind) => {
            return `${str}${rec.type === 'integer' ? rec.value : ''}${
                rec.type === 'literal' && ind !== 0 ? rec.value : ''
            }`;
        }, '');
    }
    // formatHoursPartsToString(parts) {
    //     return parts.reduce((str, rec) => { return `${str}${rec.type ==='integer' ? rec.value: ''} ${rec.type ==='integer' ? rec.unit: ''}`},'');
    // }

    handleButtonClicked(event) {
        const actionName = event.target.dataset.name;
        console.log('actionName ' + actionName);
        switch (actionName) {
            case 'refresh':
                this.handleRefreshUser(true);
                break;
            case 'logout':
                this.handleLogoutUser();
                break;
            case 'update':
            case 'login':
                this.validateFormInputs(actionName);
                break;
            case 'autocomplete':
                this.handleCredentials();
                break;
            default:
                break;
        }
    }
    async handleCredentials() {
        const qlQuery = CredentialsQuery;
        const response = await getData(qlQuery);
        if (response.data) {
            console.log(
                'details.loggedInUser : ' +
                    JSON.stringify(response.data.getEnvParameters)
            );
            this.serverCredentials = response.data.getEnvParameters;
        }
    }

    @api
    toggleEditMode() {
        this.readonly = !this.readonly;
    }

    validateFormInputs(actionName) {
        const fields = this.template.querySelectorAll('.user-field');
        let inputs = [];
        let inputsWithErrors = [];
        if (fields) {
            fields.forEach(input => {
                // Only on field change
                if (input.value && this.user[input.name] !== input.value) {
                    inputs.push({ name: input.name, value: input.value });
                } else {
                    input.checkValidity();
                    input.reportValidity();
                    if (input.name && this.user[input.name] !== input.value)
                        inputsWithErrors.push(input.name);
                }
            });
            console.log('fields : ' + JSON.stringify(inputs));
            console.log(
                'inputsWithErrors : ' + JSON.stringify(inputsWithErrors)
            );
            // publish field changes
            if (inputs.length && !inputsWithErrors.length) {
                if (actionName === 'update') {
                    this.handleUpdateUser(inputs);
                } else if (actionName === 'login') {
                    this.loginToOrg(inputs);
                }
            } else {
                console.log('no update show input error');
            }
        }
    }

    get userProfileImage() {
        return this.user.FullPhotoUrl
            ? this.user.FullPhotoUrl
            : 'https://qsyd-perma-bucket.s3-ap-southeast-2.amazonaws.com/file-explorer/images/file200x200.png';
    }
    handleImgError() {
        console.warn(
            'profile image is private in org, in order to display it youll need to set it to public.'
        );
        // Set default image
        this._currentUser = {
            ...this.user,
            FullPhotoUrl:
                'https://qsyd-perma-bucket.s3-ap-southeast-2.amazonaws.com/file-explorer/images/file200x200.png'
        };
    }

    handleLogoutUser() {
        console.log('logout  ' + this.user.Id);
        this.dispatchEvent(
            new CustomEvent('logout', {
                detail: this.user
            })
        );
    }

    get loginModeButtons() {
        return !this.loggedIn;
    }
    get editButtonIcon() {
        return this.readonly ? 'utility:edit' : 'utility:close';
    }

    async handleRefreshUser(refreshServer = false) {
        this.loading = true;
        const qlQuery = UserDataQuery(this.activeUserId, refreshServer);
        try {
            const response = await getData(qlQuery);
            if (response.data.getUser) {
                console.log('refreshed user details..');
                const details = response.data.getUser;
                this._currentUser = details;
                this.loading = false;
                this.readonly = true;
                this.publishUser();
            } else {
                console.error(
                    'error getting user: ' + JSON.stringify(response.errors)
                );
                this._loggedIn = false;
                this.loading = false;
            }
        } catch (error) {
            this.loading = false;
            //if(typeof error !== 'object')
            console.error('cannot login ' + error);
        }
    }

    // Login to Salesforce with User Credentials
    async loginToOrg(fields = []) {
        this.loading = true;
        // Build credentials record
        const record = fields.reduce((rec, field) => {
            return { ...rec, [field.name]: field.value };
        }, {});
        const { username, password, securityToken, loginUrl } = record;
        const graphQuery = AuthLoginQuery(
            username,
            password,
            securityToken,
            loginUrl
        );
        try {
            const response = await getData(graphQuery);
            if (response.data) {
                const details = response.data.login;
                console.log(
                    'logged in successfully : ' + JSON.stringify(details)
                );

                // Store as local and session variables
                this.setSessionStorageVars(details);
                // Store User Details locally
                this._currentUser = details.loggedInUser;
                this._loggedIn = true;
                this.loading = false;
                this.readonly = true;
                // Store User Details locally on parent
                this.publishUser();
            }
        } catch (error) {
            this.loading = false;
            //if(typeof error !== 'object')
            console.error('cannot login ' + error);
        }
    }
    // Update User Details
    async handleUpdateUser(fields) {
        this.loading = true;
        const record = fields.reduce((rec, field) => {
            return ` ${rec} ${field.name}: "${field.value}",`;
        }, '');
        let recordText = `{${record.substring(0, record.length - 1)}}`;
        const mutQuery = UpdateUserQuery(recordText);
        try {
            const response = await getData(mutQuery);
            if (response) {
                console.log('success ' + JSON.stringify(response));
                this._currentUser = response.data.updateUser;
                this.readonly = true;
                this.loading = false;
                this.publishUser();
            }
        } catch (error) {
            console.log('error update record ' + JSON.stringify(error));
        }
    }

    publishUser() {
        this.dispatchEvent(
            new CustomEvent('userupdate', {
                detail: { currentUser: this.user }
            })
        );
    }

    setSessionStorageVars(details) {
        // Store as local variables
        this.accessToken = details.accessToken;
        this.lightningUrl = details.lightningUrl;
        this._activeUserId = details.userId;
        this.orgId = details.organizationId;
        this.instanceUrl = details.loginUrl;
        // Set login detail in session storage
        window.sessionStorage.setItem('sf_accessToken', this.accessToken);
        window.sessionStorage.setItem('sf_loginUrl', this.instanceUrl);
        window.sessionStorage.setItem('sf_lexUrl', this.lightningUrl);
        window.sessionStorage.setItem('sf_userId', this._activeUserId);
        window.sessionStorage.setItem('sf_orgId', this.orgId);
    }
    // getUserDetailsFromSessionStorage() {

    //     this.accessToken = window.sessionStorage.getItem("sf_accessToken");
    //     this.loginUrl = window.sessionStorage.getItem("sf_loginUrl");
    //     this.lightningUrl = window.sessionStorage.getItem("sf_lexUrl");
    //     this._activeUserId = window.sessionStorage.getItem("sf_userId");
    //     this.orgId = window.sessionStorage.getItem("orgId");
    //     return this.accessToken ? true : false;
    // }
}

/* eslint-disable default-case */
import { LightningElement, api, track } from 'lwc';
import {
    UserDataQuery,
    CredentialsQuery,
    UpdateUserQuery,
    AuthLoginQuery
} from 'data/queries';
import { getData } from 'data/services';

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

const FLAGS_IMAGES = '/resources/images/flags';
const LANG_LABELS = {
    'en-GB': {
        label: 'English (GB)',
        key: 'en',
        image: FLAGS_IMAGES + '/uk.svg'
    },
    en: {
        label: 'English',
        value: 'en',
        image: FLAGS_IMAGES + '/united-states.svg'
    },
    es: {
        label: 'Spanish',
        value: 'es',
        image: FLAGS_IMAGES + '/es.svg'
    },
    he: {
        label: 'Hebrew',
        key: 'iw',
        image: FLAGS_IMAGES + '/il.svg'
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

    loading = false;
    errors;
    errorTitle = 'Error';
    errorType = 'error';

    currentUserLanguageKey = 'en';
    currentUserLanguage = LANG_LABELS[this.currentUserLanguageKey];
    _languageOptions = [];

    _readonly = false;
    serverCredentials = {};

    connectedCallback() {
        // Set Languages from Browser
        this.currentUserLanguageKey = window.navigator.language;
        this._languageOptions = window.navigator.languages.map(lang => ({
            value: lang,
            ...LANG_LABELS[lang]
        }));
        this.currentUserLanguage = LANG_LABELS[this.currentUserLanguageKey];

        if (this.loggedIn) {
            this.handleRefreshUser(false);
        }
    }
    rendered = false;
    renderedCallback() {
        if (!this.rendered) {
            this.setImageBackground();
            this.rendered = true;
        }
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
    get userProfileImage() {
        return this.user.FullPhotoUrl
            ? this.user.FullPhotoUrl
            : 'https://qsyd-perma-bucket.s3-ap-southeast-2.amazonaws.com/file-explorer/images/file200x200.png';
    }
    get readonly() {
        return this._readonly;
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

    /* Header Menu Items */
    onSelectMenuItem(event) {
        const selectedMenuItem = event.detail.value;
        // console.log('selectedMenuItem ' + selectedMenuItem);
        switch (selectedMenuItem) {
            case 'viewProfile':
                break;
            case 'editUser':
                break;
        }
    }

    get languagesOptions() {
        return this._languageOptions
            .map(lang => ({
                ...lang,
                active: lang.value === this.currentUserLanguageKey
            }))
            .sort((a, b) => (a.active < b.active ? 1 : -1));
    }

    /* Language Picker */
    handleChangeLanguage(event) {
        const selectedLanguage = event.detail.value;
        // Sets user selected language
        this.currentUserLanguageKey = selectedLanguage;
        this.currentUserLanguage = this.languagesOptions.find(
            lang => lang.value === selectedLanguage
        );
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

    /* Form Fields */
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
        const dayParts = formattedDate.format(-days, 'days');
        // const dayPartsText = `${dayParts[0].value} ${dayParts[1].value}`;
        // const hoursParts = formattedDate.formatToParts(-hours, "hours");
        // console.log('hoursParts: ' + JSON.stringify(hoursParts));
        // const hoursPartsText = this.formatHoursPartsToString(hoursParts);
        const hoursPartsText = formattedDate.format(-hours, 'hours');
        const minutesParts = formattedDate.formatToParts(-minutes, 'minutes');
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

        return formatter.format(displayTextParts);
    }

    formatPartsToString(parts) {
        return parts.reduce((str, rec, ind) => {
            return `${str}${rec.type === 'integer' ? rec.value : ''}${
                rec.type === 'literal' && ind !== 0 ? rec.value : ''
            }`;
        }, '');
    }

    /* Form Actions Handler */
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
    toggleEditMode() {
        this._readonly = !this.readonly;
    }

    get loginModeButtons() {
        return !this.loggedIn;
    }
    get editButtonIcon() {
        return this.readonly ? 'utility:edit' : 'utility:close';
    }

    async handleCredentials() {
        const qlQuery = CredentialsQuery;
        try {
            const response = await getData(qlQuery);
            if (response.data) {
                // console.log(
                //     'CredentialsQuery : ' +
                //         JSON.stringify(response.data.getEnvParameters)
                // );
                this.serverCredentials = response.data.getEnvParameters;
            }
        } catch (error) {
            console.log('error fetching credential ' + JSON.stringify(error));
            this.showErrorPanel(error, 'Credentials Error!', 'warning');
        }
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
            console.log('fields collected : ' + JSON.stringify(inputs));
            console.log(
                'inputs with errors : ' + JSON.stringify(inputsWithErrors)
            );
            // publish field changes
            if (inputs.length && !inputsWithErrors.length) {
                if (actionName === 'update') {
                    this.handleUpdateUser(inputs);
                } else if (actionName === 'login') {
                    this.loginToOrg(inputs);
                }
            } else {
                this.errors = [{ message: JSON.stringify(inputsWithErrors) }];
                this.errorTitle = 'Please complete all required inputs';
                console.log('form input error - no update has happend..');
            }
        }
    }

    /* Cached or Hard Refresh from Server */
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
                this._readonly = true;
                this.publishUser();
            } else {
                console.error(
                    'error getting user: ' + JSON.stringify(response.errors)
                );
                this.showErrorPanel(
                    response.errors,
                    'User is Not Connected !',
                    'warning'
                );
                this._loggedIn = false;
                this.loading = false;
                this._readonly = false;
            }
        } catch (error) {
            this.loading = false;
            this.showErrorPanel(error, 'Cannot Refresh User', 'error');
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
            if (response.data.login) {
                const details = response.data.login;
                console.log(
                    'logged in successfully : ' + JSON.stringify(details)
                );

                // Store as local and session variables
                this.setSessionStorageVars(details);

                this.loading = false;
                this._readonly = true;
                this._loggedIn = true;
                // Store User Details locally on parent
                this.publishUser();
            } else {
                this.showErrorPanel(
                    response.errors,
                    'Failed to Login..',
                    'error'
                );
                console.error(
                    'cannot login ' + JSON.stringify(response.errors)
                );
            }
        } catch (error) {
            this.loading = false;
            console.error('cannot login ' + error);
            this.showErrorPanel(
                error,
                'Cannot Login with this User..',
                'error'
            );
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
            if (response.data.updateUser) {
                console.log('update success ' + JSON.stringify(response));
                this._currentUser = response.data.updateUser;
                this._readonly = true;
                this.loading = false;
                this.publishUser();
            } else {
                this.showErrorPanel(
                    response.errors,
                    'Failed to Update..',
                    'error'
                );
                console.error(JSON.stringify(response.errors));
            }
        } catch (error) {
            this.showErrorPanel(error, 'Cannot Update User', 'error');
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

    async handleLogoutUser() {
        console.log('logout  ' + this.activeUserId);
        const logoutQuery = {
            query: `{ logout (userId:"${this.activeUserId}"){ success } }`
        };
        try {
            const response = await getData(logoutQuery);
            if (response.data.logout) {
                const success_logout = response.data.logout.success;
                console.log(
                    this.activeUserId + ' - logged out ' + success_logout
                );

                this._loggedIn = false;
                this._currentUser = null;
                this._activeUserId = '';
                this._readonly = false;

                window.sessionStorage.clear();
                this.showErrorPanel(
                    [{ message: 'Clear Session storage' }],
                    'Logged out !',
                    'info'
                );

                this.dispatchEvent(
                    new CustomEvent('logout', {
                        detail: success_logout
                    })
                );

                // Set timeout to toast
                window.setTimeout(() => {
                    this.errors = null;
                }, 3000);
            }
        } catch (error) {
            console.error('cannot Logout ' + error);
            this.showErrorPanel(error, 'Cannot Logout', 'error');
        }
    }
    /* Set Cache Storage Store */
    setSessionStorageVars(details) {
        // Store as local variables
        this._activeUserId = details.userId;
        // Store User Details locally
        this._currentUser = details.loggedInUser;
        // Set login detail in session storage
        window.sessionStorage.setItem('sf_accessToken', details.accessToken);
        window.sessionStorage.setItem('sf_loginUrl', details.loginUrl);
        window.sessionStorage.setItem('sf_lexUrl', details.lightningUrl);
        window.sessionStorage.setItem('sf_userId', this._activeUserId);
        window.sessionStorage.setItem('sf_orgId', details.organizationId);
        // Sensitive
        window.sessionStorage.setItem(
            'sf_user',
            JSON.stringify(details.loggedInUser)
        );
        window.sessionStorage.setItem('sf_login_timestamp', new Date());
    }

    handleCloseErrors() {
        this.errors = false;
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

    showErrorPanel(messages, title = 'error', severity = 'error') {
        this.errors = messages;
        this.errorTitle = title;
        this.errorType = severity;
    }
}

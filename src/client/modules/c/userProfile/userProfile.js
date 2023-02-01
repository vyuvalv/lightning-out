/* eslint-disable default-case */
import { LightningElement, api, track } from 'lwc';
import { UserDataQuery, CredentialsQuery, UpdateUserQuery, AuthLoginQuery } from 'data/queries';
import { getData } from 'data/services';

const flags = '/resources/images/flags';
const MORNING_TIME = 12,
    NOON_TIME = 16;

const LOGIN_FIELDS = [
                    'username',
                    'password',
                    'securityToken',
                    'loginUrl'
                ];
const VIEW_FIELDS = [
                    'Name',
                    'Email',
                    'LastLoginDate',
                ];
const EDIT_FIELDS = [
                    'FirstName',
                    'LastName',
                    'Email'
                ];
const FIELDS_LABELS = {
    'Name':'Name',
    'FirstName':'First Name',
    'LastName':'Last Name',
    'Email':'Email',
    'LastLoginDate': 'Last Login Date',
    'username': 'User Name',
    'password': 'Password',
    'securityToken': 'Security Token',
    'loginUrl':'Login Url'
}


const LANG_LABELS = {
    'en-GB': {
        label: 'English (GB)',
        image: flags + '/united-states.svg'
    },
    'en': {
        label: 'English',
        image: flags + '/es.svg'
    },
    'he':{
        label: 'Hebrew',
        value: 'iw',
        image: flags + '/il.svg'
    },
}
export default class UserProfile extends LightningElement {
    @api loggedIn;
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
    @track _currentUser;
    imageTest = flags + '/es.svg';

    currentUserLanguageKey = 'en_US';
    currentUserLanguage = {
        label: 'English',
        value: 'en_US',
        image: flags + '/es.svg'
    };

    usFlag = flags + '/united-states.svg';
    readonly = false;
    serverCredentials = {};
    accessToken;
    instanceUrl;
    lightningUrl;
    orgId;
    _languageOptions=[];
    connectedCallback() {
        this.currentUserLanguageKey = window.navigator.language;
        this._languageOptions = window.navigator.languages.map(lang => ({
            value: lang,
            ...LANG_LABELS[lang]
        }));
        // Login fields
        if (this.loggedIn) {
            this.readonly = true;
            // this._activeUserId = window.sessionStorage.getItem('sf_userId');
            this.handleRefreshUser();
        }
    }

    get greeting() {
        const now = new Date();
        // const now = window.performance.now();
        const currentHour =now.getHours();
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
        return this.loggedIn && this.user ? `${this.user.Name}` : ` Add your credentials to Salesforce org to login `;
    }
    rendered = false;
    renderedCallback() {
        if (!this.rendered) {
            this.setImageBackground();
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
        const fields = this.loggedIn ? this.readonly ? VIEW_FIELDS : EDIT_FIELDS : LOGIN_FIELDS;
        return fields.map(field => ({
            name: field, 
            value: this.loggedIn && this.user ? this.user[field] ? this.formatValue(field, this.user[field]) : '': this.formatValue(field, this.serverCredentials[field]),
            label: FIELDS_LABELS[field],
            type: field === "Email"? 'email' :'text',
            className: 'user-field'
        }))
    }

    formatValue(field, value) {
        if (field === 'LastLoginDate') {
            const today = new Date(value);

            const formattedDate = new Intl.DateTimeFormat(
                window.navigator.language, {
                    dateStyle: 'short',
                    timeStyle: 'long',
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            }).format(today);
            return formattedDate;
        }
        return value;
    }

    handleButtonClicked(event) {
        const actionName = event.target.dataset.name;
        console.log('actionName ' +actionName);
        switch (actionName) {
            case 'refresh':
                
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
        if(fields){
            fields.forEach(input => {
                // Only on field change
                if (input.value && this.user[input.name] !== input.value) {
                    inputs.push({ name: input.name, value: input.value });
                }
                else {
                    input.checkValidity();
                    input.reportValidity();
                    if(input.name && this.user[input.name] !== input.value)
                    inputsWithErrors.push(input.name);
                }
            });
            console.log('fields : ' + JSON.stringify(inputs));
            console.log('inputsWithErrors : ' + JSON.stringify(inputsWithErrors));
            // publish field changes
            if (inputs.length && !inputsWithErrors.length) {
                this.readonly = true;
                if (actionName === 'update') {
                    this.handleUpdateUser(inputs);
                }
                else if(actionName === 'login') {
                    this.loginToOrg(inputs);
                }
                
            }
            else {
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
        
        console.warn('profile image is private in org, in order to display it youll need to set it to public.');
        // Set default image
        this._currentUser = {
            ...this.user,
            FullPhotoUrl: 'https://qsyd-perma-bucket.s3-ap-southeast-2.amazonaws.com/file-explorer/images/file200x200.png'
        };
    }

    handleLogoutUser() {
        console.log('logout  '+this.user.Id);
        this.dispatchEvent(new CustomEvent('logout', {
            detail: this.user
        }));
    }


    get loginModeButtons() {
        return !this.loggedIn;
    }
    get editButtonIcon() {
        return this.readonly ? "utility:edit" : "utility:close";
    }

    async handleRefreshUser() {
        this.loading = true;
        const qlQuery = UserDataQuery(this.activeUserId);
        try {
        const response = await getData(qlQuery);
        if (response) { 
            console.log(
                'refreshed user details : ' +
                JSON.stringify(response)
            );
            this._currentUser = response.data.getUser;
            this.loading = false;
        }
    } catch (error) {
        
        this.loading = false;
        //if(typeof error !== 'object')
        console.error('cannot login ' + error);
    }
    }

    // Login to Salesforce with User Credentials
    async loginToOrg(fields= []) {
        this.loading = true;
        // Build credentials record
        const record = fields.reduce((rec, field) => {
                                return {...rec, [field.name]: field.value };
            }, {});
        const { username, password, securityToken, loginUrl } = record;
        const graphQuery = AuthLoginQuery(username, password, securityToken, loginUrl);
        try {
            const response = await getData(graphQuery);
            if (response.data) {
            
                const details = response.data.login;
                console.log(
                    'logged in successfully : ' +
                        JSON.stringify(details)
                );
                // Store as local variables
                this.accessToken = details.accessToken;
                this.lightningUrl = details.lightningUrl;
                this._activeUserId = details.userId;
                this.orgId = details.organizationId;
                this.instanceUrl = details.loginUrl;   
                // Store as session variables
                this.setSessionStorageVars();
                // Store User Details locally
                this._currentUser = details.loggedInUser;
                this.loading = false;
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
            const record = fields.reduce((rec, field) => {
                return ` ${rec} ${field.name}: "${field.value}",`;
            }, '');
            let recordText = `{${record.substring(0, record.length - 1)}}`;
            const mutQuery =  UpdateUserQuery(recordText);
            try {
                const response = await getData(mutQuery);
                if (response) {
                    console.log('success ' + JSON.stringify(response));
                    this._currentUser = response.data.updateUser;
                    this.publishUser();
                }
            } catch (error) {
                console.log('error update record ' + JSON.stringify(error));
            }
    }

    publishUser() {
        this.dispatchEvent(new CustomEvent('userupdate', { detail: { currentUser: this.user } }));
    }

    setSessionStorageVars() {
            // Set login detail in session storage
            window.sessionStorage.setItem(
                'sf_accessToken',
                this.accessToken
            );
            window.sessionStorage.setItem(
                'sf_loginUrl',
                this.instanceUrl 
            );
            window.sessionStorage.setItem(
                'sf_lexUrl',
                this.lightningUrl
            );
            window.sessionStorage.setItem('sf_userId', this._activeUserId);
            window.sessionStorage.setItem(
                'sf_orgId',
                this.orgId
            );
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

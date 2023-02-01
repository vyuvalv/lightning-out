/* eslint-disable default-case */
import { LightningElement, api, track } from 'lwc';
import { UserDataQuery } from 'data/queries';
import { getData } from 'data/services';

const flags = '/resources/images/flags';
const MORNING_TIME = 12,
    NOON_TIME = 16;

const LOGIN_FIELDS = [
                    'username',
                    'password',
                    'securityToken',
                    'instanceUrl'
                ];
const FIELDS = [
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
    'instanceUrl':'Instance Url'
}


export default class UserProfile extends LightningElement {
    @api loggedIn;

    @api
    get user() {
        return this._currentUser;
    }
    set user(value) {
        this._currentUser = value;
    }

    @track _currentUser;
    imageTest = flags + '/es.svg';
    currentUserId;
    currentUserLanguageKey = 'en_US';
    currentUserLanguage = {
        label: 'English',
        value: 'en_US',
        image: flags + '/es.svg'
    };

    usFlag = flags + '/united-states.svg';
    readonly = false;

    connectedCallback() {
        // this.currentUserLanguage = this.languageOptions.find(
        //     lang => lang.value === this.user.LanguageLocaleKey
        // );
        // Login fields
        if (this.loggedIn && this.user) {
            this.readonly = true;
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
        return `Good ${timeInDay} ${this.user.Name} !`;
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
        return this.languageOptions
            .map(lang => ({
                ...lang,
                active: lang.value === this.currentUserLanguageKey
            }))
            .sort((a, b) => (a.active < b.active ? 1 : -1));
    }
    languageOptions = [
        {
            label: 'English',
            value: 'en_US',
            image: flags + '/united-states.svg'
        },
        {
            label: 'Hebrew',
            value: 'iw',
            image: flags + '/il.svg'
        },
        {
            label: 'Spanish',
            value: 'es',
            image: flags + '/es.svg'
        }
    ];

    get displayedUserFields() {
        const fields = this.loggedIn ? this.readonly ? FIELDS : EDIT_FIELDS : LOGIN_FIELDS;
        return fields.map(field => ({
            name: field, 
            value: this.loggedIn ? this.user[field] ? this.user[field] : '':'',
            label: FIELDS_LABELS[field],
            className: 'user-field'
        }))
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
        this.currentUserLanguage = this.languageOptions.find(
            lang => lang.value === selectedLanguage
        );
        // this.updateUser();
    }


    @api
    toggleEditMode() {
        this.readonly = !this.readonly;
    }

    handleSaveUser() {
        const fields = this.template.querySelectorAll('.user-field');
        let inputs = [];
        if(fields){
            fields.forEach(input => {
                // Only on field change
                if(input.value && this.user[input.name] !== input.value){
                    inputs.push({ name: input.name, value: input.value });
                }
            });
            console.log('fields : ' + JSON.stringify(inputs));
            // publish field changes
            if(inputs.length)
                this.dispatchEvent(new CustomEvent('save', { detail: { fields: inputs, action: this.loggedIn ? "update" : "login" } }));
            else {
                console.log('no update');
                this.toggleEditMode();
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
    get logoutButton() {
        return {
            iconName: this.loggedIn ? 'utility:unlock' : 'utility:lock',
            name:'logout'
        }
    }
    get saveButton() {
        return {
            iconName: this.loggedIn ? "utility:save" : 'utility:lock',
            name:'update'
        }
    }
    get showUpdateButton() {
        return !this.readonly && this.loggedIn;
    }
    get editButtonIcon() {
        return this.readonly ? "utility:edit" : "utility:close";
    }

    async handleRefreshUser() {
        const qlQuery = UserDataQuery;
        const response = await getData(qlQuery);
        if (response) { 
            console.log(
                'details.loggedInUser : ' +
                JSON.stringify(response.getUser)
            );
        }
    }
}

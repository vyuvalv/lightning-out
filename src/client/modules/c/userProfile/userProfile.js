/* eslint-disable default-case */
import { LightningElement, api, track } from 'lwc';

const flags = '/resources/images/flags';
const MORNING_TIME = 12,
    NOON_TIME = 16;

const FIELDS = [
                    'Name',
                    'Email',
                    'LastLoginDate',
                ];
const FIELDS_LABELS = {
    'Name':'Name',
    'Email':'Email',
    'LastLoginDate':'Last Login Date'
}

// const SAMPLE_USER_DATA = {
//     "attributes": {
//         "type": "User",
//         "url": "/services/data/v42.0/sobjects/User/0050C000007JyODQA0"
//     },
//     "Id": "0050C000007JyODQA0",
//     "Name": "User User",
//     "Email": "vyuvalv@gmail.com",
//     "FullPhotoUrl": "https://qsyd-perma-bucket.s3-ap-southeast-2.amazonaws.com/file-explorer/images/file200x200.png",
//     "LanguageLocaleKey": "en_US",
//     "LastLoginDate": "2023-01-18T20:53:06.000+0000"
// };  
export default class UserProfile extends LightningElement {
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
    currentUserTimeZone;
    currentUserLocale;
    currentRoleId;

    usFlag = flags + '/united-states.svg';
    userResults;
    readonly = true;
    connectedCallback() {
        this.currentUserLanguage = this.languageOptions.find(
            lang => lang.value === this.user.LanguageLocaleKey
        );
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
        return FIELDS.map(field => ({
            name: field, 
            value: this.user[field] ? this.user[field] : '',
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

    get userProfileImage() {
        return this._currentUser.FullPhotoUrl
            ? this._currentUser.FullPhotoUrl
            : 'https://qsyd-perma-bucket.s3-ap-southeast-2.amazonaws.com/file-explorer/images/file200x200.png';
    }

    toggleEditMode(event) {
        this.readonly = !this.readonly;
        const button = event.target;
        button.iconName = this.readonly ? "utility:edit" : "utility:close";
    }
    handleSaveUser() {
        const fields = this.template.querySelectorAll('.user-field');
        let inputs = [];
        if(fields){
            fields.forEach(input => {
                if(input.value)
                inputs.push({ name: input.name, value: input.value });
            });
            console.log('collectedValues : ' + JSON.stringify(inputs));

            this.dispatchEvent(new CustomEvent('save', { detail: inputs }))
        }
    }
    handleImgError() {
        
        console.warn('profile image is private in org, in order to display it youll need to set it to public.');
        // Set default image
        this._currentUser = {
            ...this.user,
            FullPhotoUrl: 'https://qsyd-perma-bucket.s3-ap-southeast-2.amazonaws.com/file-explorer/images/file200x200.png'
        };
    }
}

/* eslint-disable default-case */
import { LightningElement, api } from 'lwc';

const flags = '/resources/images/flags';
const MORNING_TIME = 12,
    NOON_TIME = 16;

// const FIELDS = [
//                     'Name',
//                     'Email',
//                     'FullPhotoUrl',
//                     'LastLoginDate',
//                     'LanguageLocaleKey',
//                     'TimeZoneSidKey',
//                     'UserRoleId',
//                 ];

export default class UserProfile extends LightningElement {
    @api
    get user() {
        return this._currentUser;
    }
    set user(value) {
        this._currentUser = value;
    }

    _currentUser;
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
    saveUser() {
        // this.updateUser();
    }

    get userProfileImage() {
        return this._currentUser.FullPhotoUrl
            ? this._currentUser.FullPhotoUrl
            : 'https://qsyd-perma-bucket.s3-ap-southeast-2.amazonaws.com/file-explorer/images/file200x200.png';
    }
}

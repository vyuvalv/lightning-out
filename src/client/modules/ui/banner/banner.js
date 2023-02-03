import { LightningElement } from 'lwc';
const Assets = '/resources/images';

export default class Banner extends LightningElement {
    bannerImage = `${Assets}/hero_large.png`;
    loggedIn = false;
    userId = '';
    loading = false;

    get activeIcon() {
        return this.loggedIn
            ? {
                  iconName: 'utility:lock',
                  label: 'Logged In successfully',
                  name: 'logout',
                  variant: 'success'
              }
            : {
                  iconName: 'utility:lock',
                  label: 'Login to Salesforce',
                  name: 'login',
                  variant: 'error'
              };
    }

    publish() {
        this.dispatchEvent(
            new CustomEvent('login', {
                detail: {
                    userId: this.userId
                }
            })
        );
    }
}

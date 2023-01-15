import { LightningElement } from 'lwc';
const Assets = '/resources/images';
import { sfLogin } from 'data/services';

export default class Banner extends LightningElement {
    bannerImage = `${Assets}/hero_large.png`;
    loggedIn = false;
    userId = '';
    loading = false;
    login(event) {
        const button = event.target;
        if (button) button.classList.toggle('slds-hide');
        if (!this.loggedIn) {
            this.loading = true;
            sfLogin()
                .then(reponse => {
                    if (reponse.data.accessToken) {
                        const details = reponse.data;
                        this.userId = details.userId;
                        console.log('details : ' + JSON.stringify(details));
                        window.sessionStorage.setItem(
                            'sf_accessToken',
                            details.accessToken
                        );
                        window.sessionStorage.setItem(
                            'sf_instanceUrl',
                            details.instanceUrl
                        );
                        window.sessionStorage.setItem(
                            'sf_userId',
                            details.userId
                        );
                        console.log('logged in with userId : ' + this.userId);
                        this.loading = false;
                        this.loggedIn = true;
                        if (button) button.classList.toggle('slds-hide');
                        this.publish();
                    }
                })
                .catch(error => {
                    this.loggedIn = false;
                    //  this.loading = false;
                    //if(typeof error !== 'object')
                    console.error('cannot login ' + error);
                });
        }
    }

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

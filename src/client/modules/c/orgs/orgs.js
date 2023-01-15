/* eslint-disable no-unused-vars */
import { LightningElement, track } from 'lwc';
import { getActiveOrgs } from 'data/services';

const Actions = [{ value: 'open', label: 'Open' }];
export default class Orgs extends LightningElement {
    get nonScratchOrgs() {
        return this._nonScratchOrgs;
    }
    get scratchOrgs() {
        return this._scratchOrgs;
    }

    actions = Actions;
    @track _nonScratchOrgs;
    @track _scratchOrgs;

    loading = false;

    handleActionClick(event) {
        this.getAllOrgs();
    }

    handleItemAction(event) {
        // Get the value of the selected action
        const tileAction = event.detail.action.value;
        const orgId = event.target.dataset.id;
        console.log('clicked ' + orgId);
    }
    getAllOrgs() {
        this.loading = true;
        getActiveOrgs()
            .then(reponse => {
                if (reponse.data) {
                    console.log('allorgs ' + JSON.stringify(reponse.data));
                    this._nonScratchOrgs = reponse.data.result.nonScratchOrgs.map(
                        item => ({ ...item })
                    );
                    this._scratchOrgs = reponse.data.result.scratchOrgs.map(
                        item => ({ ...item })
                    );
                    this.loading = false;
                }
            })
            .catch(error => {
                console.log(error);
            });
    }
}

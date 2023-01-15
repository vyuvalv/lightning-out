/* eslint-disable no-unused-vars */
/* eslint-disable getter-return */
import { LightningElement, api, track } from 'lwc';

import { STATE, VARIANT, BUTTONS } from 'c/constantsUtils';

const STATE_BUTTONS = [STATE.NEW, STATE.IMPORT, STATE.SEARCH, STATE.REFRESH];
const VIEW_BUTTONS = [STATE.SETTINGS, STATE.PREVIEW];

export default class ControlPanel extends LightningElement {
    @api
    get activeView() {
        return this.currentView;
    }
    set activeView(value) {
        this.currentView = value;
    }

    @api
    get activeState() {
        return this.currentState;
    }
    set activeState(value) {
        if (STATE_BUTTONS.includes(value)) {
            this.currentState = value;
            this.disabled = true;
        } else {
            this.currentState = STATE.CLOSE;
            this.disabled = false;
        }
    }
    // custom labels
    label = {
        search: BUTTONS[STATE.SEARCH].placeholder
    };

    currentState = STATE.CLOSE;
    currentView; // show settings as default
    searchTerm = ''; // using the search input
    disabled = false; // will disabled other buttons when one is active

    // render buttons on right side
    get stateButtons() {
        const closeButton = BUTTONS[STATE.CLOSE];
        return STATE_BUTTONS.map(state => ({
            ...BUTTONS[state],
            disabled: this.currentState !== state && this.disabled,
            variant:
                this.currentState === state
                    ? VARIANT.BORDER_FILLED
                    : VARIANT.BORDER_INVERSE,
            label:
                this.currentState === state
                    ? closeButton.label
                    : BUTTONS[state].label,
            iconName:
                this.currentState === state
                    ? closeButton.iconName
                    : BUTTONS[state].iconName
        }));
    }
    // render buttons on left side
    get viewButtons() {
        return VIEW_BUTTONS.map(state => ({
            ...BUTTONS[state],
            variant:
                this.currentView === state
                    ? VARIANT.BORDER_FILLED
                    : VARIANT.BORDER_INVERSE
        }));
    }

    get isSettingsMode() {
        return this.currentView === STATE.SETTINGS;
    }
    get showSearchBar() {
        return this.currentState === STATE.SEARCH && this.isSettingsMode;
    }
    get showFileImport() {
        return this.currentState === STATE.IMPORT && this.isSettingsMode;
    }
    // publish the search input value
    onSearchInputChange(event) {
        const searchInputValue = event.target.value;

        if (searchInputValue) {
            this.searchTerm = searchInputValue;
        } else {
            this.searchTerm = '';
        }
        this.publishSearchText();
    }

    /* Handle File Import */
    @track content;
    @track errors;
    readFile(event) {
        let reader = new FileReader();
        reader.onload = this.showContent.bind(this, reader);
        reader.onerror = this.showError.bind(this, reader);
        reader.readAsText(event.target.files[0]);
    }
    showError(reader) {
        this.content = '';
        this.errors = 'An error happened!';
    }
    showContent(reader) {
        this.errors = '';
        this.content = reader.result;
        try {
            const record = JSON.parse(this.content);
            this.publishImportedContent(record);
        } catch (error) {
            this.errors = 'Unable to parse the json file';
        }
    }

    onViewSelect(event) {
        // Assign view name to current view
        this.currentView = event.target.name;
        this.publishView();
    }

    // Control right panel admin actions
    onStateSelect(event) {
        // event.preventDefault();
        const selectedState = event.target.name;
        const isToggleOff = selectedState === this.currentState;

        this.currentState = isToggleOff ? STATE.CLOSE : selectedState;

        this.disabled = isToggleOff ? false : true;
        // When State changes => View Must be in Setting Mode
        if (this.currentView !== STATE.SETTINGS) {
            this.currentView = STATE.SETTINGS;
            this.publishView();
        }
        switch (selectedState) {
            case STATE.REFRESH:
                // When Refresh disabled timeout
                setTimeout(() => {
                    this.currentState = STATE.CLOSE;
                    this.disabled = false;
                }, 500);
                this.publishState();
                break;
            case STATE.SEARCH:
            case STATE.IMPORT:
                // do nothing
                break;
            default:
                this.publishState();
        }
    }

    publishState() {
        // publish state to parent
        this.dispatchEvent(
            new CustomEvent('changestate', {
                detail: { currentState: this.currentState }
            })
        );
    }
    publishImportedContent(record) {
        // publish state to parent
        this.dispatchEvent(
            new CustomEvent('uploadfile', {
                detail: { record: record }
            })
        );
    }
    publishSearchText() {
        // publish keyword to parent
        this.dispatchEvent(
            new CustomEvent('search', {
                detail: { keyword: this.searchTerm }
            })
        );
    }
    publishView() {
        if (this.currentView) {
            // Publish current view to parent
            this.dispatchEvent(
                new CustomEvent('changedisplay', {
                    detail: { currentView: this.currentView }
                })
            );
        }
    }
}

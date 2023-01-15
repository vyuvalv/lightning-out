/* eslint-disable no-unused-vars */
/* eslint-disable no-prototype-builtins */
import { LightningElement, track, api } from 'lwc';
import {
    MONTH_NAMES,
    getStartOfMonth,
    getEndOfMonth,
    getStartOfWeek,
    shiftDate
} from 'c/calendarUtils';
import { SAMPLE_DATA } from './data/sample.js';

const VIEW_TYPE = [
    {
        value: 'month',
        label: 'Monthly',
        slots: 40
    },
    {
        value: 'week',
        label: 'Weekly',
        slots: 7
    },
    {
        value: 'day',
        label: 'Daily',
        slots: 1
    }
];

export default class Calendar extends LightningElement {
    @api recordId;
    @api objectApiName;
    @api defaultView;
    @track currentView = 'week';

    @track startDate;
    @track endDate;
    selectedDate;
    datePickerString;
    dateShift = 7;

    connectedCallback() {
        // set today as default date picker date time
        this.selectedDate = new Date();
        this.datePickerString = this.selectedDate.toISOString();
        // set initial view
        this.setView(new Date());
    }

    setView(currentDate) {
        switch (this.currentView) {
            case 'month':
                this.setMonthlyView(currentDate);
                break;
            case 'week':
                this.setWeeklyView(currentDate);
                break;
            case 'day':
                this.setDayView(currentDate);
                break;
            default:
                this.setWeeklyView(currentDate);
        }
    }

    setMonthlyView(_date) {
        this.dateShift = 32;
        this.startDate = getStartOfMonth(_date);
        this.endDate = getEndOfMonth(this.startDate);
    }

    setWeeklyView(_date) {
        this.dateShift = 7;
        this.startDate = getStartOfWeek(_date, true);
        this.endDate = shiftDate(this.startDate, 'day', this.dateShift);
    }

    setDayView(_date) {
        this.dateShift = 1;
        this.startDate = _date;
        this.endDate = _date;
    }

    // Navigation
    navigateToToday() {
        this.setView(new Date(), true);
    }

    navigateToPrevious() {
        const _startDate = shiftDate(this.startDate, this.currentView, -1);
        this.setView(_startDate);
    }
    navigateToNext() {
        const _startDate = shiftDate(this.startDate, this.currentView, 1);
        this.setView(_startDate);
    }

    // Date picker
    navigateToDay(event) {
        this.datePickerString = event.target.value;
        this.selectedDate = new Date(this.datePickerString);
        this.setView(this.selectedDate);
    }

    // change view
    onViewChange(event) {
        this.currentView = event.target.value;
        this.setView(this.selectedDate);
    }

    // Handlers for the clanedar slots
    @track selectedEventId = '';

    handleSelectedSlot(event) {
        this.selectedEventId = event.detail.recordId;
    }
    getEventSlotById(_selectedId) {
        return { ...this.eventData.find(row => row.id === _selectedId) };
    }

    handleUpdateData(event) {
        const updatedFields = event.detail.fields;
        const operation = event.detail.type;
        // find old event
        let exisitingEventSlot = this.getEventSlotById(updatedFields.id);
        let doUpdate = false;
        if (exisitingEventSlot) {
            Object.keys(exisitingEventSlot).forEach(fieldName => {
                if (updatedFields.hasOwnProperty(fieldName)) {
                    const oldValue = exisitingEventSlot[fieldName];
                    const newValue = updatedFields[fieldName];
                    const isChanged = oldValue !== newValue;
                    if (isChanged) {
                        doUpdate = true;
                        //  console.log(fieldName + ' oldValue : ' + oldValue + ' newValue: ' + newValue );
                        exisitingEventSlot[fieldName] =
                            updatedFields[fieldName];
                    }
                }
            });
        }
        if (doUpdate) {
            this.updateEventData(exisitingEventSlot, operation);
        }
    }

    handleNewEventSlot(event) {
        const newRecordFields = event.detail.fields;
        const operation = event.detail.type;
        this.updateEventData(newRecordFields, operation);
    }

    updateEventData(_updatedEvent, _opt = 'bottom') {
        // saveEventData({
        //     slotData: { ..._updatedEvent },
        //     operation: opt
        // })
        //     .then(response => {
        //         //  console.log('success ' + response);
        //         this.dispatchEvent(
        //             new ShowToastEvent({
        //                 title: 'Success',
        //                 message: 'Event changed! ' + response,
        //                 variant: 'success'
        //             })
        //         );
        //         this.refresh(this._wiredEvents);
        //     })
        //     .catch(error => {
        //         console.log('error ', error);
        //     });
        //    const calendar = this.template.querySlector('c-calendar-view');
        //    calendar.refresh();
    }
    debug(event) {
        const message = event.detail;
        const { start, end, range } = message;
        console.log('start ' + start);
        console.log('end ' + end);
        console.log('range ' + range);
    }
    @track recordsToDelete = [];
    handleDelete(event) {
        this.recordsToDelete.push(event.detail);
        console.log('will delete ' + JSON.stringify(this.recordsToDelete));
        // deleteEventSlots({
        //     recordIds: this.recordsToDelete
        // })
        //     .then(response => {
        //         console.log('delete success ' + response);
        //         this.dispatchEvent(
        //             new ShowToastEvent({
        //                 title: 'Success',
        //                 message: 'Delete Successfull! ' + response,
        //                 variant: 'success'
        //             })
        //         );
        //         this.refresh(this._wiredEvents);
        //     })
        //     .catch(error => {
        //         console.log('error ', error);
        //     });
    }

    refresh(payload) {
        // refreshApex(payload);
    }

    createUUID() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (
                c ^
                (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
            ).toString(16)
        );
    }
    // Combobox options
    get viewOptions() {
        return VIEW_TYPE.map(view => ({
            ...view,
            selected: view.name === this.currentView
        }));
    }

    // Header Title
    get formattedDatesPeriod() {
        const isDayView = this.currentView === 'day';
        return isDayView
            ? `${this.startDate.toLocalString()}`
            : `${this.startDate.toLocaleString()} - ${this.endDate.toLocaleString()}`;
    }

    get formattedMonthsPeriod() {
        const startMonth = this.startDate.getMonth();
        const endMonth = this.endDate.getMonth();
        const sameMonth = startMonth === endMonth;
        return sameMonth
            ? `${MONTH_NAMES[startMonth]}`
            : `${MONTH_NAMES[startMonth]} - ${MONTH_NAMES[endMonth]}`;
    }

    _wiredEvents;
    @track eventData = SAMPLE_DATA;
}

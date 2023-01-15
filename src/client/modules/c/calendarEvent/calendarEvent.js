/* eslint-disable no-prototype-builtins */
import { LightningElement, api, track } from 'lwc';
import { EVENT_OBJECT } from './fields/eventObjectUtils';
const FIELDS = [
    'SUBJECT',
    'START_DATE',
    'START_TIME',
    'END_TIME',
    'TOTAL_TIME'
];
export default class CalendarEvent extends LightningElement {
    @api
    get eventSlot() {
        return this._eventSlot;
    }
    set eventSlot(value) {
        const _startDate = new Date(value.startDate),
            _startTime = new Date(value.startTime),
            _endTime = new Date(value.endTime);
        this._eventSlot = {
            ...value,
            startDate: _startDate.toISOString(),
            startTime: _startTime.toISOString(),
            endTime: _endTime.toISOString(),
            totalTimeInMinutes: this.getTimeDifferanceInMinutes(
                _startTime,
                _endTime
            )
        };
    }

    @track _eventSlot;

    get eventFields() {
        return FIELDS.map(field => ({
            ...EVENT_OBJECT[field],
            value: this._eventSlot.hasOwnProperty(EVENT_OBJECT[field].fieldName)
                ? this._eventSlot[EVENT_OBJECT[field].fieldName]
                : ''
        }));
    }

    @api
    getFieldsValues() {
        const inputs = this.template.querySelectorAll('.event-input-field');
        let fields = {};
        inputs.forEach(field => {
            let fieldValue = field.value;
            if (field.type === 'date' || field.type === 'datetime') {
                fieldValue = new Date(field.value);
            }
            fields[field.name] = fieldValue;
        });
        return fields;
    }

    getTimeDifferanceInMinutes(start, end) {
        return Math.abs(
            Math.round((end.getTime() - start.getTime()) / 1000 / 60)
        );
    }
}

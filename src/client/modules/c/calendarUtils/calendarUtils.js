/* eslint-disable no-unused-vars */
import { LightningElement } from 'lwc';

export const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
export const MONTH_NAMES = [
    'JAN',
    'FEB',
    'MARCH',
    'APRIL',
    'MAY',
    'JUNE',
    'JULY',
    'AUGUST',
    'SEPTEMBER',
    'OCTOBER',
    'NOVEMBER',
    'DECEMBER'
];
// hours * minutes * seconds * milliseconds
const DAY = 24 * 60 * 60 * 1000;
const HOURS = 60 * 60 * 1000;
const MINUTES = 60 * 60 * 1000;

export default class CalendarUtils extends LightningElement {}

export function getStartOfMonth(currentDate) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return new Date(year, month, 1);
}
export function getEndOfMonth(_startDate) {
    const year = _startDate.getFullYear();
    const month = _startDate.getMonth();
    return new Date(year, month + 1, 0);
}
// Weekly View
export function getStartOfWeek(currentDate, startOnSunday = false) {
    const delta = startOnSunday ? 0 : 1;
    const calculatedDate = currentDate.setDate(
        currentDate.getDate() - currentDate.getDay() + delta
    );
    return new Date(calculatedDate);
}

// Utility Methods
export function getDaysBetween(_startDate, _endDate) {
    return Math.ceil(Math.abs((_endDate - _startDate) / DAY)) - 1;
}
export function getMinutesBetween(_startDate, _endDate) {
    return Math.ceil(Math.abs((_endDate - _startDate) / MINUTES));
}

export function shiftDate(date, interval, units) {
    if (!(date instanceof Date)) return undefined;
    let outputDate = new Date(date); // keep original date
    const checkRollover = function() {
        if (outputDate.getDate() !== date.getDate()) outputDate.setDate(0);
    };
    switch (String(interval).toLowerCase()) {
        case 'year':
            outputDate.setFullYear(outputDate.getFullYear() + units);
            checkRollover();
            break;
        case 'quarter':
            outputDate.setMonth(outputDate.getMonth() + 3 * units);
            checkRollover();
            break;
        case 'month':
            outputDate.setMonth(outputDate.getMonth() + units);
            checkRollover();
            break;
        case 'week':
            outputDate.setDate(outputDate.getDate() + 7 * units);
            break;
        case 'day':
            outputDate.setDate(outputDate.getDate() + units);
            break;
        case 'hour':
            outputDate.setTime(outputDate.getTime() + units * 3600000);
            break;
        case 'minute':
            outputDate.setTime(outputDate.getTime() + units * 60000);
            break;
        case 'second':
            outputDate.setTime(outputDate.getTime() + units * 1000);
            break;
        default:
            outputDate = undefined;
            break;
    }
    return outputDate;
}

/* eslint-disable radix */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-unused-vars */
import { LightningElement, api, track } from 'lwc';
import { MONTH_NAMES, DAY_NAMES, shiftDate } from 'c/calendarUtils';

const COLORS_MAP = {
    Blue: '#1589EE',
    Green: '#4AAD59',
    Red: '#E52D34',
    Turqoise: '#0DBCB9',
    Navy: '#052F5F',
    Orange: '#E56532',
    Purple: '#62548E',
    Pink: '#CA7CCE',
    Brown: '#823E17',
    Lime: '#7CCC47',
    Gold: '#FCAF32'
};

const EMPTY_EVENT = {
    subject: 'New Event',
    dayIndex: 0,
    startDate: '',
    startTime: '',
    endTime: '',
    top: 0,
    bottom: 2,
    totalTimeInMinutes: 120,
    color: 'red'
};

const DRAG_INFO = {
    type: 'move',
    startX: 0,
    startY: 0,
    height: 0,
    top: 0,
    bottom: 0
};
const MIN_SLOT_SIZE = 30; // in minutes
const TOTAL_SLOTS = 24; // Hours
const DraggingElements = ['top', 'bottom', 'move'];
const DropElements = ['column', 'eventItem', 'dragBox'];

const DraggableElementClass = 'cal-time-slot-draggable';
const EventElementClass = 'cal-time-slot-event';
const TimeSlotElementClass = 'cal-time-slot';

export default class CalendarView extends LightningElement {
    @api view;
    @api startDate;
    @api endDate;
    @api numberOfDays;
    todaysDate;
    @api enableKeyboardEvents = false;

    @track _events = [];
    menuActions = [
        { name: 'edit', label: 'Edit' },
        { name: 'remove', label: 'Delete' }
    ];
    loading = false;
    _selectedEventId = '';

    @api
    get events() {
        return this._events.map(item => ({
            ...item,
            selected: this._selectedEventId === item.id,
            className:
                this._selectedEventId === item.id ? 'event-slot-selected' : ''
        }));
    }
    set events(value) {
        this._events = value.length
            ? value.map(item => ({
                  ...item,
                  formattedStartTime: this.formatTimeFromDateTime(
                      item.startTime
                  ),
                  formattedEndTime: this.formatTimeFromDateTime(item.endTime)
              }))
            : [];
    }

    connectedCallback() {
        this.todaysDate = new Date();
    }

    initialized = false;
    renderedCallback() {
        this.initialized = true;
        if (this._events && !this.isDragging) {
            this.setEventsTimeSlots(this._events);
        }
    }

    placeEvents() {
        this.setEventsTimeSlots(this._events);
    }

    get calendarDays() {
        let dates = [];
        const dateOptions = {
            timeZone: 'UTC',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        };

        for (let index = 0; index < this.numberOfDays; index++) {
            const currentDay = shiftDate(this.startDate, 'day', index);
            // eslint-disable-next-line radix
            let currentMonth = currentDay.getMonth();

            const day = {
                value: `${currentDay.getDate()}/${currentDay.getMonth() + 1}`,
                date: currentDay, // To CHANGE startDate
                label: DAY_NAMES[currentDay.getDay()],
                month: MONTH_NAMES[currentMonth],
                name: currentDay.getDate(),
                start: currentDay,
                className:
                    currentDay.getDate() === this.todaysDate.getDate()
                        ? 'slds-badge slds-theme_error'
                        : 'slds-badge',
                formmatedValue: currentDay.toLocaleString('en-GB', dateOptions)
            };
            dates.push(day);
        }
        return dates;
    }

    get timeSlots() {
        let hours = [];
        const step = 0.5;
        for (let timeIndex = 0; timeIndex < TOTAL_SLOTS; timeIndex += step) {
            const _slotHour = Math.floor(timeIndex);
            const _slotMinutes = (timeIndex % 1) * 60;
            const timeSlot = {
                value: `${_slotHour}:${_slotMinutes}`,
                label: `${this.formatTime(_slotHour)}:${this.formatTime(
                    _slotMinutes
                )}`,
                start: timeIndex,
                end: timeIndex + step
            };
            hours.push(timeSlot);
        }
        return hours;
    }

    setEventsTimeSlots(events) {
        const slotElements = this.template.querySelectorAll(
            `.${EventElementClass}`
        );
        if (slotElements.length) {
            slotElements.forEach(slot => {
                events.forEach(event => {
                    if (slot.dataset.id === event.id) {
                        slot.style.setProperty(
                            '--slot-top-position',
                            `${event.top * 60}px`
                        );
                        slot.style.setProperty(
                            '--slot-left-position',
                            `${(event.dayIndex / 7) * 100}%`
                        );
                        slot.style.setProperty(
                            '--slot-height',
                            `${event.totalTimeInMinutes}px`
                        );
                        slot.style.setProperty(
                            '--slot-background',
                            `${event.color}`
                        );
                    }
                });
            });
        }
    }

    getEventSlotById(_selectedId) {
        return { ...this._events.find(row => row.id === _selectedId) };
    }

    getComputedPxValue(eventElement, prop) {
        const value = window
            .getComputedStyle(eventElement)
            .getPropertyValue(prop);
        return parseFloat(value.replace('px', ''));
    }

    selectedEvent = { totalTimeInMinutes: 30 };

    @track draggedInfo = DRAG_INFO;
    isDragging = false;
    actionType;
    @track dirtyEventSlot = EMPTY_EVENT;
    startY = 0;
    xIndex = 0;

    openDetailsModal = false;

    @track selectedSlot;
    @track draggableEventElement;
    @track currentElement;
    @track eventElement;

    isEmptySlot = false;
    // Click on the Event Set it Active
    handleSelected(event) {
        // Set Selected Event Id
        const currentTarget = event.target;
        const eventElement = currentTarget.classList.contains(EventElementClass)
            ? currentTarget
            : currentTarget.closest(`.${EventElementClass}`);
        // const tabIndex = eventElement.tabIndex;
        const activeElement = this.getElementAttributes(eventElement);
        const isSelected = activeElement.id === this._selectedEventId;
        if (!isSelected) {
            this.selectedEvent = activeElement;
            this._selectedEventId = activeElement.id;
        }
    }

    // Change Time Slots color on hover
    handleTimeSlotMouseOver(event) {
        const currentTarget = event.target;
        if (!this.isDragging) {
            const timeSlot = currentTarget.closest(`.${TimeSlotElementClass}`);
            // Time Slot
            if (!timeSlot.classList.contains('cal-time-slot-hovered')) {
                timeSlot.classList.add('cal-time-slot-hovered');
            }
        }
    }
    handleTimeSlotMouseOut(event) {
        const currentTarget = event.target;
        const timeSlot = currentTarget.closest(`.${TimeSlotElementClass}`);
        if (timeSlot.classList.contains('cal-time-slot-hovered')) {
            timeSlot.classList.remove('cal-time-slot-hovered');
        }
    }

    hanldeDBClick(event) {
        const currentTarget = event.target;
        const draggingType = currentTarget.dataset.name;
        const isEventDrag = DraggingElements.includes(draggingType);
        if (isEventDrag) {
            this.currentElement = currentTarget;
            this.eventElement = currentTarget.closest(`.${EventElementClass}`);
            this.dirtyEventSlot = this.getElementAttributes(this.eventElement);
            this.toggleDraggableElement(true);
            this.actionType = draggingType;
            const shiftY =
                event.pageY - this.currentElement.getBoundingClientRect().top;
            this.startY = event.pageY;
            this.xIndex = this.dirtyEventSlot.dayIndex;
            this.currentElement.style.setProperty(
                '--slot-edge-color',
                'yellow'
            );
            this.isDragging = true;
        }
    }
    // Start Drag Event Slot Or Select Time Slot
    handleStartDrag(event) {
        // started drag an element
        const currentTarget = event.target;
        const draggingType = currentTarget.dataset.name;
        const isEventDrag = DraggingElements.includes(draggingType);
        const isEmptySlot = draggingType === 'timeSlot';

        // Alowed Drag
        if (isEventDrag || isEmptySlot) {
            this.actionType = draggingType;
            this.currentElement = currentTarget;
            // const shiftY = event.pageY - this.currentElement.getBoundingClientRect().top;
            this.startY = event.pageY;

            if (isEventDrag) {
                this.isEmptySlot = false;
                const eventElement = currentTarget.closest(
                    `.${EventElementClass}`
                );
                const currentEventId = eventElement.dataset.id;
                if (currentEventId === this._selectedEventId) {
                    if (this.isDragging) {
                        // hide buttons
                        this.showSaveButton(0, 0, false);
                    } else {
                        // hide dragged event
                        // currentTarget.style.zIndex = 10;
                        eventElement.style.setProperty('--slot-opacity', '0');
                        // get attributes from server
                        const initialAttributes = this.getElementAttributes(
                            eventElement
                        );
                        this.dirtyEventSlot = initialAttributes;
                        // set draggable
                        this.toggleDraggableElement(true);
                    }
                    this.draggedInfo = this.dirtyEventSlot;
                    this.xIndex = this.dirtyEventSlot.dayIndex;
                    this.eventElement = eventElement;
                }
            } else if (isEmptySlot && !this.isDragging) {
                this.isEmptySlot = true;
                // Select Empty Slots to create a new Event

                this.currentElement.style.zIndex = 10;
                this.currentElement.style.setProperty('--slot-opacity', '0');

                const initialAttributes = this.getElementAttributes(
                    this.currentElement,
                    true
                );
                this.dirtyEventSlot = {
                    ...EMPTY_EVENT,
                    ...initialAttributes
                };
                this.draggedInfo = this.dirtyEventSlot;
                this.xIndex = this.dirtyEventSlot.dayIndex;
                this.toggleDraggableElement(true);
            } else {
                event.preventDefault();
            }
        }
    }

    // Check if Allowed to be dragged
    // Dragging Move and Resize Event
    handleEnteredSlot(event) {
        // Validate that entered zone is a valid drop zone
        const eneteredElement = event.target;
        if (this.isDragging) {
            const moveInPixels = event.pageY - this.startY;
            // allow dragging on a column / event slot
            const dropZone = eneteredElement.closest(
                '.calendar-droppable-zone'
            );
            const dropZoneName = dropZone.dataset.name;
            const isAlllowed = DropElements.includes(dropZoneName);
            // console.log('eneteredElement dropZoneName ' + eneteredElement.dataset.name);
            if (isAlllowed) {
                let draggedInfo = { ...this.draggedInfo };
                // allowed move within range of days
                if (this.actionType === 'move' && dropZoneName === 'column') {
                    // eslint-disable-next-line radix
                    const dropZoneIndex = parseInt(dropZone.dataset.dayIndex);
                    if (
                        dropZoneIndex >= 0 &&
                        dropZoneIndex < this.numberOfDays
                    ) {
                        this.xIndex = dropZoneIndex;
                    }
                }
                const draggedItem = this.calculateDimensions(
                    moveInPixels,
                    draggedInfo,
                    this.xIndex,
                    this.actionType
                );
                if (!this.isEmptySlot) {
                    // Moves Event element in addition to draggable
                    this.renderDrag(this.eventElement, draggedItem);
                }
                this.renderDrag(this.draggableEventElement, draggedItem);
                this.dirtyEventSlot = draggedItem;
                event.preventDefault();
            }
        } else {
            eneteredElement.style.cursor = 'no-drop';
        }
    }

    // End Drag - Saving Event
    handleEventSlotDragEnd(event) {
        if (this.isDragging) {
            const currentTarget = event.target;
            // let draggedInfo = { ...this.draggedInfo };
            // const moveInPixels = event.pageY - this.startY;
            // const draggedItem = this.calculateDimensions(moveInPixels, draggedInfo, this.xIndex, this.actionType);
            // this.renderDrag(this.draggableEventElement, draggedItem);
            // eventElement.style.setProperty('--slot-opacity', .9);
            this.draggedInfo = this.dirtyEventSlot;
            // End Empty Slot drag
            if (this.isEmptySlot) {
                // remove
                this.selectedSlot = this.dirtyEventSlot;
                this.openDetailsModal = true;
                this.currentElement.style.zIndex = 0;
                this.currentElement.style.setProperty('--slot-opacity', '1');
                this.toggleDraggableElement(false);
            } else {
                // const eventElement = currentTarget.closest('.cal-time-slot-event');
                this.showSaveButton(
                    this.dirtyEventSlot.bottom,
                    this.xIndex,
                    true
                );
            }
        } else {
            event.preventDefault();
        }
    }
    // show draggable
    toggleDraggableElement(toggle = true) {
        this.draggableEventElement = this.template.querySelector(
            `.${DraggableElementClass}`
        );
        if (toggle) {
            this.draggableEventElement.style.display = 'grid';
            this.renderDrag(this.draggableEventElement, this.dirtyEventSlot);
            this.isDragging = true;
        } else {
            this.draggableEventElement.style.display = 'none';
            // reset
            this.isDragging = false;
            this.draggedInfo = DRAG_INFO;
            this.dirtyEventSlot = null;
            this.draggableEventElement = null;
        }
    }

    @track changedFields = [];
    validateFieldChange(originalSlot, updatedSlot) {
        let changedFields = [];
        Object.keys(originalSlot).forEach(fieldName => {
            if (updatedSlot.hasOwnProperty(fieldName)) {
                const oldValue = originalSlot[fieldName];
                const newValue = updatedSlot[fieldName];
                const isChanged = oldValue !== newValue;
                changedFields.isChanged = isChanged;
                if (isChanged) {
                    const field = {
                        fieldName: fieldName,
                        oldValue: oldValue,
                        newValue: newValue
                    };
                    changedFields.push(field);
                }
            }
        });
        return changedFields;
    }

    // Cancel button
    resetDrag() {
        this.eventElement.style.setProperty('--slot-opacity', 0.9);
        this.renderDrag(this.eventElement, this.selectedEvent);
        this.toggleDraggableElement(false);
        this.showSaveButton(0, 0, false);
        this.eventElement = null;
        //
    }

    handleSave() {
        // Update data base
        this.publishUpdateEvent(this.dirtyEventSlot, 'UPDATE');
        this.hideEventSlotDetails();
    }

    // Control Scrolling
    onVerticalScroll(event) {
        let currentScrollPosition = event.target.scrollTop;
        if (currentScrollPosition >= 1060) {
            currentScrollPosition = 1060;
        }
    }
    setScrolling(topScrollValue, switchOff = false) {
        const container = this.template.querySelector('.timeslots-container');
        if (container) {
            if (switchOff) {
                container.style.overflow = 'hidden';
            } else {
                container.scrollTop = topScrollValue;
            }
        }
    }
    disableScroll() {
        const container = this.template.querySelector('.timeslots-container');
        container.style.overflow = 'hidden';

        // scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        // scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        // window.scrollTo(scrollTop, scrollLeft);
    }

    menuItemsOpen = false;
    toggleMenuItem(event) {
        this.menuItemsOpen = !this.menuItemsOpen;
        // eslint-disable-next-line radix
        const selectedDayIndex = parseInt(event.currentTarget.dataset.dayIndex);
        const selectedTop = parseFloat(event.currentTarget.dataset.start);
        // Set Action menu position
        this.toggleMenuOptions(
            this.menuItemsOpen,
            selectedTop,
            selectedDayIndex
        );
    }

    toggleMenuOptions(show = false, top = 0, left = 0) {
        const menuItemElement = this.template.querySelector(
            '.slot-actions-container'
        );
        if (menuItemElement) {
            menuItemElement.style.display = show ? 'block' : 'none';
            menuItemElement.style.setProperty(
                '--slot-top-position',
                `${top * 60 + MIN_SLOT_SIZE}px`
            );
            if (left > 0)
                menuItemElement.style.setProperty(
                    '--slot-menu-position',
                    `${(left / 7) * 100 + 1}%`
                );
        }
    }
    // Event Settings Button
    onMenuAction(event) {
        const actionName = event.currentTarget.dataset.name;
        if (actionName === 'edit') {
            const _selected = this.getEventSlotById(this._selectedEventId);
            this.dirtyEventSlot = {
                ..._selected,
                startDate: new Date(_selected.startDate),
                startTime: new Date(_selected.startTime),
                endTime: new Date(_selected.endTime)
            };
            this.openDetailsModal = true;
        } else if (actionName === 'remove') {
            this.publishDelete(this._selectedEventId);
            this.toggleMenuOptions(false);
        }
    }

    onSaveNewEvent() {
        // get all fields and create new event slot instance
        const newEventElement = this.template.querySelector('c-calendar-event');
        if (newEventElement) {
            const fields = newEventElement.getFieldsValues();

            let newEventSlot = {
                ...EMPTY_EVENT,
                ...fields
            };
            const operation = this.isEmptySlot ? 'INSERT' : 'UPDATE';
            if (operation === 'UPDATE') {
                newEventSlot.id = this._selectedEventId;
                this.publishUpdateEvent(newEventSlot, operation);
            } else if (operation === 'INSERT') {
                this.publishInsertEvent(newEventSlot, operation);
            }
            this.onCloseModal();
        }
    }
    onCloseModal() {
        this.openDetailsModal = false;
    }

    toggleMenuOff(index, state) {
        this.menuItemsOpen = false;
        this.toggleMenuOptions(false);
    }

    publishUpdateEvent(_changedEvent, type = 'bottom') {
        this.dispatchEvent(
            new CustomEvent('updateevent', {
                detail: { fields: _changedEvent, type: type }
            })
        );
        window.setTimeout(() => {
            this.resetDrag();
        }, 500);
    }
    // Edit / Insert Modal
    publishInsertEvent(_modalEvent, type = 'UPDATE') {
        this.dispatchEvent(
            new CustomEvent('insertevent', {
                detail: { fields: _modalEvent, type: type }
            })
        );
    }

    publishDelete(recordId) {
        this.dispatchEvent(
            new CustomEvent('delete', {
                detail: recordId
            })
        );
    }

    // render() {
    //     return weekView;
    // switch (this.view) {
    //     case 'month':
    //         return monthView;
    //         break;
    //     case 'week':
    //         return weekView;
    //         break;
    //     default:
    //         return weekView;
    //         break;
    // }
    // }

    get resources() {
        return [
            {
                name: 'Yuval',
                role: 'CEO',
                parentId: '1',
                allocationsByProject: []
            },
            {
                name: 'Dani',
                role: 'COO',
                parentId: '2',
                allocationsByProject: []
            }
        ];
    }

    formatTime(value) {
        return value < 10 ? `0${value}` : value;
    }

    formatTimeFromDateTime(dateString) {
        const _Date = new Date(dateString);
        const _Hour = _Date.getHours();
        const _Minutes = _Date.getMinutes();
        return `${this.formatTime(_Hour)}:${this.formatTime(_Minutes)}`;
    }

    setTimeInMinutes(slotDate, timeValue) {
        const _slotDate = new Date(slotDate);
        _slotDate.setHours(Math.floor(timeValue));
        _slotDate.setMinutes((timeValue % 1) * 60);
        return _slotDate;
    }

    roundToNearestNumber(_number = 0, roundTo = 5) {
        return parseFloat((Math.round(_number / roundTo) * roundTo).toFixed(2));
    }

    // Get all attributes from any drag element
    getElementAttributes(activeElement, isEmpty = false) {
        const _eventId = !isEmpty ? activeElement.dataset.id : '0';
        const _startDate = activeElement.dataset.day;
        const _top = parseFloat(activeElement.dataset.start);
        const _bottom = parseFloat(activeElement.dataset.end);
        const _startTime = this.setTimeInMinutes(_startDate, _top);
        const _endTime = this.setTimeInMinutes(_startDate, _bottom);
        const _total = isEmpty
            ? MIN_SLOT_SIZE
            : parseInt(activeElement.dataset.total);
        const _index = !isEmpty
            ? activeElement.tabIndex
            : activeElement.dataset.index;

        return {
            id: _eventId,
            index: _index,
            top: _top,
            totalTimeInMinutes: _total,
            bottom: _bottom,
            dayIndex: parseInt(activeElement.dataset.dayIndex),
            startDate: new Date(_startDate),
            startTime: _startTime,
            endTime: _endTime,
            formattedStartTime: this.formatTimeFromDateTime(_startTime),
            formattedEndTime: this.formatTimeFromDateTime(_endTime)
        };
    }
    interval;
    // Keyboard Event Slot control
    handleKeyPress(event) {
        const { code } = event;
        const step = 1;
        const stepInMinutes = step * 60;
        let moveY = 1;
        let moveX = -1;

        // this.disableScroll();
        const altCtrlPressed = event.altKey && event.ctrlKey;

        if (this.isDragging) {
            let _selectedSlot = this.draggedInfo;
            // let { top, startTime, endTime,bottom, totalTimeInMinutes, startDate } = _selectedSlot;
            switch (code) {
                case 'Escape':
                    this.resetDrag();
                    break;
                case 'ArrowUp':
                case 'ArrowDown':
                    if (altCtrlPressed) {
                        moveY = code === 'ArrowUp' ? moveY++ : moveY--;

                        //   switch (this.actionType) {
                        //       case 'top':
                        //           _selectedSlot.top = code === 'ArrowUp' ? top - stepInMinutes : top + stepInMinutes;
                        //           console.log(' _selectedSlot.top : ' + _selectedSlot.top);
                        //           // _selectedSlot.startTime = code === 'ArrowUp' ? shiftDate(_selectedSlot.startTime, 'minute', - 1) : shiftDate(_selectedSlot.startTime, 'minute', + 1);
                        //           _selectedSlot.totalTimeInMinutes = code === 'ArrowUp' ? totalTimeInMinutes + step : totalTimeInMinutes - step;
                        //           break;
                        //       case 'bottom':
                        //           _selectedSlot.bottom = code === 'ArrowUp' ? bottom - stepInMinutes : bottom + stepInMinutes;
                        //          // _selectedSlot.endTime = code === 'ArrowUp' ? shiftDate(_selectedSlot.endTime, 'minute', - 1) : shiftDate(_selectedSlot.endTime, 'minute', + 1);
                        //           _selectedSlot.totalTimeInMinutes = code === 'ArrowUp' ? totalTimeInMinutes - step : totalTimeInMinutes + step;
                        //           break;
                        //       case 'move':
                        //           _selectedSlot.top = code === 'ArrowUp' ? top - stepInMinutes : top + stepInMinutes;
                        //         //   _selectedSlot.startTime = code === 'ArrowUp' ? shiftDate(_selectedSlot.startTime, 'minute', - 1) : shiftDate(_selectedSlot.startTime, 'minute', + 1);
                        //         //   _selectedSlot.endTime = code === 'ArrowUp' ? shiftDate(_selectedSlot.endTime, 'minute', - 1) : shiftDate(_selectedSlot.endTime, 'minute', + 1);
                        //         //   _selectedSlot.bottom = code === 'ArrowUp' ? _selectedSlot.bottom + stepInMinutes : _selectedSlot.bottom - stepInMinutes;
                        //           break;

                        //   }
                    }
                    break;
                case 'ArrowLeft':
                case 'ArrowRight':
                    if (altCtrlPressed) {
                        this.xIndex = code === 'ArrowRight' ? moveX++ : moveX--;
                        //   _selectedSlot.dayIndex -= 1;
                        //   _selectedSlot.startDate = shiftDate(_selectedSlot.startDate, 'day', - 1);
                    }
                    break;
                //   case 'ArrowRight':
                //       if (altCtrlPressed) {
                //           _selectedSlot.dayIndex += 1;
                //           _selectedSlot.startDate = shiftDate(_selectedSlot.startDate, 'day', + 1);
                //       }
                //       break;
                case 'Enter':
                    // eslint-disable-next-line no-case-declarations
                    // const item = {
                    //     ..._selectedSlot,
                    //     startTime: _startTime.toISOString(),
                    //     endTime: _endTime.toISOString()
                    // };
                    // this.publishUpdateEvent(item, this.actionType);
                    break;
                default:
                    event.preventDefault();
            }
            const draggedItem = this.calculateDimensions(
                moveY,
                _selectedSlot,
                this.xIndex,
                this.actionType
            );
            // _selectedSlot.dayIndex = leftIndex;
            console.log(' _selectedSlot : ' + JSON.stringify(draggedItem));
            this.renderDrag(this.eventElement, draggedItem);
            this.renderDrag(this.draggableEventElement, draggedItem);
            //this.showSaveButton(_selectedSlot.bottom, _selectedSlot.dayIndex, true);
            // keep running till keyup
            //   this.interval = window.setInterval(() => {
            //         this.renderDrag(this.eventElement, draggedItem);
            //         this.renderDrag(this.draggableEventElement, draggedItem);
            //     }, 1000);
        }
    }
    handleKeyUp(event) {
        window.clearInterval(this.interval);
        this.interval = null;
    }

    // Move or Resize Element based on action Type
    calculateDimensions(
        moveInPixels = 0,
        obj = {
            top: 0,
            totalTimeInMinutes: MIN_SLOT_SIZE,
            bottom: 0.5,
            dayIndex: 0
        },
        leftIndex = -1,
        type
    ) {
        const moveInMinutes = moveInPixels / 60;
        const MIN = 0.5,
            MAX = 24,
            HOUR = 60;
        // get values
        let { top, totalTimeInMinutes, bottom, dayIndex } = { ...obj };

        switch (type) {
            case 'top':
                // Set Top
                top += moveInMinutes;
                top = top < 0 ? 0 : top; // MIN LIMITS
                top = top > bottom - MIN ? bottom - MIN : top; // MAX LIMITS
                // Set Height
                totalTimeInMinutes -= moveInPixels;
                totalTimeInMinutes =
                    totalTimeInMinutes < MIN_SLOT_SIZE
                        ? MIN_SLOT_SIZE
                        : totalTimeInMinutes; // MIN LIMITS
                totalTimeInMinutes =
                    top + totalTimeInMinutes / HOUR > MAX
                        ? MAX
                        : totalTimeInMinutes; // MAX LIMITS
                break;
            case 'bottom':
            case 'timeSlot':
                // Set Height
                totalTimeInMinutes += moveInPixels;
                totalTimeInMinutes =
                    totalTimeInMinutes < MIN_SLOT_SIZE
                        ? MIN_SLOT_SIZE
                        : totalTimeInMinutes; // MIN LIMITS
                totalTimeInMinutes =
                    top + totalTimeInMinutes / HOUR > MAX
                        ? MAX
                        : totalTimeInMinutes; // MAX LIMITS
                // Set Bottom
                bottom += moveInMinutes;
                bottom = bottom < top + MIN ? top + MIN : bottom; // MIN LIMITS
                bottom = bottom > MAX ? MAX : bottom; // MAX LIMIT
                break;
            case 'move':
                // Set Top
                top += moveInMinutes;
                top = top < 0 ? 0 : top; // MIN LIMITS
                top =
                    top > MAX - totalTimeInMinutes / HOUR
                        ? MAX - totalTimeInMinutes / HOUR
                        : top; // MAX LIMITS
                // Set Bottom
                bottom += moveInMinutes;
                bottom =
                    bottom < top + totalTimeInMinutes / HOUR
                        ? top + totalTimeInMinutes / HOUR
                        : bottom; // MIN LIMITS
                bottom = bottom > MAX ? MAX : bottom; // MAX LIMIT
                // Set Day Index
                dayIndex = leftIndex < 0 ? 0 : leftIndex;
                dayIndex =
                    leftIndex > this.numberOfDays
                        ? this.numberOfDays
                        : leftIndex;
                break;
            default:
                break;
        }

        const _currentDate = shiftDate(this.startDate, 'day', dayIndex);
        const _startTime = this.setTimeInMinutes(_currentDate, top);
        const _endTime = this.setTimeInMinutes(_currentDate, bottom);
        // const _endTime = shiftDate(_startTime, 'minute', totalTimeInMinutes);

        return {
            ...obj,
            top: top,
            bottom: bottom,
            totalTimeInMinutes: totalTimeInMinutes,
            dayIndex: dayIndex,
            startDate: _currentDate,
            startTime: _startTime.toISOString(),
            endTime: _endTime.toISOString(),
            formattedStartTime: this.formatTimeFromDateTime(_startTime),
            formattedEndTime: this.formatTimeFromDateTime(_endTime)
        };
    }

    // Update Properties for dragged Slot
    renderDrag(activeElement, props) {
        if (props.top >= 0)
            activeElement.style.setProperty(
                '--slot-top-position',
                `${props.top * 60}px`
            );
        if (props.totalTimeInMinutes >= MIN_SLOT_SIZE)
            activeElement.style.setProperty(
                '--slot-height',
                `${props.totalTimeInMinutes}px`
            );
        if (props.dayIndex >= 0 && props.dayIndex <= this.numberOfDays)
            activeElement.style.setProperty(
                '--slot-left-position',
                `${(props.dayIndex / this.numberOfDays) * 100}%`
            );
    }

    showSaveButton(_bottom = 1, _left = 0, toggle = true) {
        // TODO: Add support for bottom = 24 MAX
        const savePanelElement = this.template.querySelector(
            '.event-slot-save-box'
        );
        if (savePanelElement) {
            if (toggle) {
                savePanelElement.style.display = 'grid';
                savePanelElement.style.setProperty(
                    '--slot-top-position',
                    `${_bottom * 60}px`
                );
                if (_left >= 0 && _left <= this.numberOfDays) {
                    savePanelElement.style.setProperty(
                        '--slot-left-position',
                        `${(_left / this.numberOfDays) * 100}%`
                    );
                }
            } else {
                savePanelElement.style.display = 'none';
            }
        }
    }

    hideEventSlotDetails() {
        const actionsMenu = this.template.querySelector(
            '.slot-actions-container'
        );
        const savePanelElement = this.template.querySelector(
            '.event-slot-save-box'
        );
        const allElements = [actionsMenu, savePanelElement];

        allElements.forEach(panel => {
            if (panel) {
                panel.style.display = 'none';
            }
        });
    }
}

import { LightningElement } from 'lwc';
const NEW_LABEL = 'NEW';
const EDIT_LABEL = 'EDIT';

export default class ConstantsUtils extends LightningElement {
    // label = {
    //     new:NEW_LABEL
    // }
}

export const STATE = {
    NEW: 'add',
    NEW_RECORD: 'new',
    VIEW: 'view',
    NAVIGATE: 'navigate',
    EDIT: 'edit',
    CLONE: 'clone',
    DELETE: 'deleteRecord',
    SAVE: 'save',
    PLAY: 'play',
    SEARCH: 'search',
    REFRESH: 'refresh',
    COPY: 'copy',
    EXPORT: 'export',
    IMPORT: 'import',
    PUBLISH: 'publish',
    LOAD: 'loading',
    PAGE: 'pagination',
    CLOSE: 'close',
    SHOW_MORE: 'showMore',
    SORT: 'sort',
    DRAG: 'drag',
    PREVIEW: 'preview',
    SETTINGS: 'settings',
    LIST: 'list',
    HOME: 'home',
    LOGIN: 'login',
    LOGOUT: 'logout'
};

export const TEMPLATES = {
    VERTICAL: {
        name: 'verticalNavigation',
        label: 'Vertical Navigation'
    },
    BUTTON_MENU: {
        name: 'menuButton',
        label: 'Button Menu'
    }
};

export const PAGE_REF = {
    OBJECT: 'standard__objectPage',
    RECORD: 'standard__recordPage',
    RELATIONSHIP: 'standard__recordRelationshipPage',
    NAV_ITEM: 'standard__navItemPage',
    APP: 'standard__app',
    LEX: 'standard__namedPage',
    COMPONENT: 'standard__component',
    COMMUNITY: 'comm__namedPage',
    LOGIN: 'comm__loginPage',
    WEB: 'standard__webPage',
    KA: 'standard__knowledgeArticlePage',
    SCREEN_VIEW: 'screenView'
};

export const ICONS = {
    NEW: 'utility:add',
    VIEW: 'utility:preview',
    NAVIGATE: 'utility:topic',
    EDIT: 'utility:edit',
    CLONE: 'utility:copy',
    COPY: 'utility:copy',
    PLAY: 'utility:play',
    EXPORT: 'utility:package',
    IMPORT: 'utility:offline_cached',
    PUBLISH: 'utility:internal_share',
    SAVE: 'utility:save',
    DELETE: 'utility:delete',
    SEARCH: 'utility:search',
    REFRESH: 'utility:refresh',
    CLOSE: 'utility:close',
    SORT: 'utility:sort',
    DRAG: 'utility:rows',
    PREVIEW: 'utility:list',
    SETTINGS: 'utility:settings'
};

export const VARIANT = {
    BRAND: 'brand',
    BARE: 'bare',
    BORDER_INVERSE: 'border-inverse',
    BORDER: 'border',
    BORDER_FILLED: 'border-filled',
    INVERSE: 'inverse'
};

export const SORT = {
    ASC: 'asc',
    DESC: 'desc'
};

export const BUTTONS = {
    [STATE.PREVIEW]: {
        name: STATE.PREVIEW,
        label: 'Preview Screen',
        iconName: ICONS.VIEW,
        variant: VARIANT.BORDER_INVERSE
    },
    [STATE.SETTINGS]: {
        name: STATE.SETTINGS,
        label: 'Settings View',
        iconName: ICONS.SETTINGS,
        variant: VARIANT.BORDER_INVERSE
    },
    [STATE.NEW]: {
        name: STATE.NEW,
        value: STATE.NEW,
        label: NEW_LABEL,
        iconName: ICONS.NEW,
        variant: VARIANT.BORDER_INVERSE
    },
    [STATE.EDIT]: {
        name: STATE.EDIT,
        value: STATE.EDIT,
        label: EDIT_LABEL,
        iconName: ICONS.EDIT,
        variant: VARIANT.BORDER_INVERSE
    },
    [STATE.CLONE]: {
        name: STATE.CLONE,
        value: STATE.CLONE,
        label: 'Clone',
        iconName: ICONS.CLONE,
        variant: VARIANT.BORDER_INVERSE
    },
    [STATE.VIEW]: {
        name: STATE.VIEW,
        value: STATE.VIEW,
        label: 'View',
        iconName: ICONS.VIEW,
        variant: VARIANT.BORDER_INVERSE
    },
    [STATE.PUBLISH]: {
        name: STATE.PUBLISH,
        value: STATE.PUBLISH,
        label: 'Publish',
        iconName: ICONS.PUBLISH,
        variant: VARIANT.BORDER_INVERSE
    },
    [STATE.NAVIGATE]: {
        name: STATE.NAVIGATE,
        value: STATE.NAVIGATE,
        label: 'Navigate',
        iconName: ICONS.NAVIGATE,
        variant: VARIANT.BORDER_INVERSE
    },
    [STATE.DELETE]: {
        name: STATE.DELETE,
        value: STATE.DELETE,
        label: 'Delete',
        iconName: ICONS.DELETE,
        variant: VARIANT.BORDER_INVERSE
    },
    [STATE.CLOSE]: {
        name: STATE.CLOSE,
        label: 'Close',
        iconName: ICONS.CLOSE,
        variant: VARIANT.BORDER_FILLED
    },
    [STATE.SAVE]: {
        name: STATE.SAVE,
        label: 'Save',
        iconName: ICONS.SAVE,
        variant: VARIANT.BRAND
    },
    [STATE.PLAY]: {
        name: STATE.PLAY,
        value: STATE.PLAY,
        label: 'Preview',
        iconName: ICONS.PLAY,
        variant: VARIANT.BRAND
    },
    [STATE.SEARCH]: {
        name: STATE.SEARCH,
        label: 'Search',
        placeholder: 'Search for a record...',
        iconName: ICONS.SEARCH,
        variant: VARIANT.BORDER_INVERSE
    },
    [STATE.REFRESH]: {
        name: STATE.REFRESH,
        label: 'Refresh',
        iconName: ICONS.REFRESH,
        variant: VARIANT.BORDER_INVERSE
    },
    [STATE.DRAG]: {
        name: STATE.DRAG,
        label: 'Drag',
        iconName: ICONS.DRAG,
        variant: VARIANT.BARE
    },
    [STATE.SORT]: {
        name: STATE.SORT,
        label: 'Sort',
        iconName: ICONS.SORT,
        variant: VARIANT.INVERSE,
        ASC: 'asc',
        DESC: 'desc'
    },
    [STATE.COPY]: {
        name: STATE.COPY,
        label: 'Copy Group Name to Clipboard',
        iconName: ICONS.COPY,
        variant: VARIANT.INVERSE
    },
    [STATE.EXPORT]: {
        name: STATE.EXPORT,
        value: STATE.EXPORT,
        label: 'Export',
        iconName: ICONS.EXPORT,
        variant: VARIANT.INVERSE
    },
    [STATE.IMPORT]: {
        name: STATE.IMPORT,
        label: 'Import',
        iconName: ICONS.IMPORT,
        variant: VARIANT.BORDER_INVERSE
    },
    [STATE.LOAD]: {
        name: STATE.LOAD,
        label: 'Loading data...',
        variant: VARIANT.BRAND
    },
    pagination: {
        next: 'NEXT',
        prev: 'PREV',
        variant: VARIANT.INVERSE
    },
    [STATE.SHOW_MORE]: {
        label: 'Show menu',
        variant: VARIANT.BORDER_FILLED,
        menuAlignment: 'right'
    }
};

export function getSortedData(records, fieldName, sortDirection = SORT.ASC) {
    let sortResult = Object.assign([], records);
    return sortResult.sort(function(a, b) {
        if (a[fieldName] < b[fieldName])
            return sortDirection === SORT.ASC ? -1 : 1;
        else if (a[fieldName] > b[fieldName])
            return sortDirection === SORT.ASC ? 1 : -1;

        return 0;
    });
}

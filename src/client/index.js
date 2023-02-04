/* eslint-disable @lwc/lwc/no-document-query */
import '@lwc/synthetic-shadow';
// import { registerWireService } from '@lwc/wire-service';
import { createElement } from 'lwc';
import MainApp from 'ui/app';

const IS_DEV = true;
const DEV_SERVER = `http://localhost:3001`;
const SERVER_URL = `https://test-service-skwt.onrender.com`;
const TARGET_SERVER = IS_DEV ? DEV_SERVER : SERVER_URL;
// router
// const startingLocation = window.location.pathname;

const app = createElement('main-app', { is: MainApp });
const element = document.querySelector('#main');
// SF Credentials
let accessToken = '',
    lexUrl = '';
let scriptPromise;

window.addEventListener('DOMContentLoaded', () => {
    const pageName = document.location.search.substr(6).split('?page=');
    if (pageName) {
        console.log(`initial page: ${pageName}`);
        app.pathName = pageName;
        element.appendChild(app);
    }
    // addHistory(pageName);

    // Try to set the lightning out script on load if anything exists in local storage
    accessToken = window.sessionStorage.getItem('sf_accessToken');
    lexUrl = window.sessionStorage.getItem('sf_lexUrl');
    if (!scriptPromise && lexUrl) {
        console.log('script init from session ');
        scriptPromise = addLightningScript(lexUrl);
    }
});

window.addEventListener(
    'message',
    event => {
        console.log('message origin: ' + event.origin);
        // Block any event not coming form domain
        if (event.origin !== TARGET_SERVER) return;

        console.log('errors from listeners : ' + JSON.stringify(event.data));
        let componentName = 'lightning:button';
        // const componentName = "c:logger";
        let componentParams = { label: 'helloworld' };
        const divId = 'lexComponent';
        let lexAppName = '';

        if (!event.data.type) {
            // not on init event
            accessToken = event.data.accessToken;
            lexUrl = event.data.lightningUrl;
            lexAppName = event.data.appName;
            componentName = event.data.componentName;
            componentParams = event.data.componentParams;

            if (accessToken && lexUrl) {
                if (!scriptPromise) {
                    console.log('script init as no domain ');
                    scriptPromise = addLightningScript(lexUrl);
                }
                // Render Lightning Components using lightning Out
                scriptPromise.then(() => {
                    console.log('script run ', componentParams);
                    renderLexApp(
                        lexAppName,
                        componentName,
                        componentParams,
                        divId,
                        lexUrl,
                        accessToken
                    );
                });
            } else {
                console.log('need to login first - no access token..');
                accessToken = window.sessionStorage.getItem('sf_accessToken');
                lexUrl = window.sessionStorage.getItem('sf_lexUrl');
                if (accessToken && lexUrl) {
                    renderLexApp(
                        lexAppName,
                        componentName,
                        componentParams,
                        divId,
                        lexUrl,
                        accessToken
                    );
                }
            }
        }
    },
    false
);

window.onpopstate = function(event) {
    const pageName = event.state.page;
    console.log(`page: ${pageName}`);
    // assign the history page name to app
    app.pathName = pageName;
    console.log(`history page: ${pageName}`);
    // addHistory(pageName);
    // window.history.back();
};

// function addHistory(pageName = '/home') {
//     window.history.pushState({ page: pageName }, pageName, `?page=${pageName}`);
// }

function addLightningScript(scriptUrl) {
    // Set Promise to fetch script from org
    return new Promise((resolve, reject) => {
        const scriptTag = document.createElement('script');
        document.body.appendChild(scriptTag);
        scriptTag.onload = resolve;
        scriptTag.onerror = reject;
        scriptTag.async = true;
        scriptTag.crossorigin = 'anonymous';
        scriptTag.src = `${scriptUrl}lightning/lightning.out.js`;
    });
}
// Lightning Out Components
function renderLexApp(
    lexAppName = 'c:ossWebApp',
    componentName,
    componentParams,
    divId,
    instanceLexUrl = 'https://*.lightning.force.com/lightning/lightning.out.js',
    sessionToken
) {
    const parentDiv = document.getElementById(divId);
    const errorDiv = document.getElementById('auraErrorMessage');
    const renderedDivName = 'lexComponentChild';
    // Remove any child if exists
    if (parentDiv.children.length) {
        for (let child of parentDiv.children) {
            parentDiv.removeChild(child);
        }
    }
    if (errorDiv) errorDiv.remove();
    // Create a new div for displaying the component
    const childDiv = document.createElement('div');
    childDiv.id = renderedDivName;
    parentDiv.appendChild(childDiv);

    window.$Lightning.use(
        lexAppName,
        () => {
            window.$Lightning.createComponent(
                componentName,
                componentParams,
                renderedDivName,
                function(cmp) {
                    console.log('component created ' + cmp);
                    //
                }
            );
        },
        instanceLexUrl,
        sessionToken
    );
}

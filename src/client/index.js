/* eslint-disable @lwc/lwc/no-document-query */
import '@lwc/synthetic-shadow';
// import { registerWireService } from '@lwc/wire-service';
import { createElement } from 'lwc';
import MainApp from 'ui/app';

// router
// const startingLocation = window.location.pathname;

const app = createElement('main-app', { is: MainApp });
const element = document.querySelector('#main');

window.addEventListener('DOMContentLoaded', () => {
    const pageName = document.location.search.substr(6).split('?page=');
    console.log(`initial page: ${pageName}`);
    app.pathName = pageName;
    element.appendChild(app);
    // addHistory(pageName);
});

window.onpopstate = function(event) {
    const pageName = event.state.page;
    console.log(`page: ${pageName}`);
    // assign the history page name to app
    app.pathName = pageName;
    // addHistory(pageName);
    // window.history.back();
};

// function addHistory(pageName = '/home') {
//     window.history.pushState({ page: pageName }, pageName, `?page=${pageName}`);
// }

const PORT = ''; // http://localhost:3002

/*
 * Interact with GraphQL Data From Server
 */
export async function getData(query) {
    const endpoint = `${PORT}/api/graphql`;
    console.log('query : ' + JSON.stringify(query.query));
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify(query)
        });
        if (!response.ok) {
            throw new Error('No response from server');
        }
        return response.json();
    } catch (e) {
        return e;
    }
}

export async function getActiveOrgs() {
    const response = await fetch(`${PORT}/api/v1/sfdx/org/list`);
    if (!response.ok) {
        throw new Error('No response from server');
    }
    return response.json();
}

export const getRecords = endpoint =>
    fetch(endpoint)
        .then(response => {
            if (!response.ok) {
                throw new Error('No response from server');
            }
            return response.json().then(result => {
                let records = [];
                if (result.data) {
                    records = result.data;
                    //console.log(result.request);
                }
                return records;
            });
        })
        .catch(error => {
            console.error('Calling Salesforce has failed ! : ', error);
        });

const CREATE_ENDPOINT = '/api/v1/event/new';

export async function createRecord(record = { Name: 'test' }) {
    const response = await fetch(CREATE_ENDPOINT, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record) // body data type must match "Content-Type" header
    });
    return response.json();
}
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// const response = await fetch(url, {
//     method: 'POST', // *GET, POST, PUT, DELETE, etc.
//     mode: 'cors', // no-cors, *cors, same-origin
//     cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
//     credentials: 'same-origin', // include, *same-origin, omit
//     headers: {
//       'Content-Type': 'application/json'
//       // 'Content-Type': 'application/x-www-form-urlencoded',
//     },
//     redirect: 'follow', // manual, *follow, error
//     referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
//     body: JSON.stringify(data) // body data type must match "Content-Type" header
//   });
//   return response.json();

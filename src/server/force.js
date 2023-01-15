const jsforce = require('jsforce');
const dotenv = require('dotenv');
dotenv.config();
// eslint-disable-next-line no-undef
const { SF_USERNAME, SF_PASSWORD, SF_TOKEN, SF_LOGIN_URL } = process.env;

// Check Settings available
if (!(SF_USERNAME && SF_PASSWORD && SF_TOKEN && SF_LOGIN_URL)) {
    console.error(
        'Cannot start app: missing mandatory configuration. Check your .env file.'
    );
    // eslint-disable-next-line no-undef
    process.exit(-1);
}

// Using connected App
// const conn = new jsforce.Connection({
//     oauth2 : {
//         // you can change loginUrl to connect to sandbox or prerelease env.
//         // loginUrl : 'https://test.salesforce.com',
//         clientId : '<your Salesforce OAuth2 client ID is here>',
//         clientSecret : '<your Salesforce OAuth2 client secret is here>',
//         redirectUri : '<callback URI is here>'
//       }
// });

// Setup connection
const conn = new jsforce.Connection({
    loginUrl: SF_LOGIN_URL
});

const login = (req, res) => {
    conn.login(SF_USERNAME, SF_PASSWORD + SF_TOKEN, (err, userInfo) => {
        if (err) {
            res.sendStatus(500);
        }
        res.send({
            data: {
                accessToken: conn.accessToken,
                instanceUrl: conn.instanceUrl,
                userId: userInfo.id,
                organizationId: userInfo.organizationId
            }
        });
        // logged in user
        console.log('User ID: ' + userInfo.id);
    });
};

// Logout
// const conn = new jsforce.Connection({
//     sessionId : '<session id to logout>',
//     serverUrl : '<your Salesforce Server url to logout>'
//   });

const create = (req, res) => {
    conn.sobject(req.objectName).create(req.recordData, (err, result) => {
        if (err || !result.success) {
            res.sendStatus(500);
            console.error(err, result);
        } else {
            res.send({
                data: result.id
            });
        }
    });
};

// eslint-disable-next-line no-unused-vars
const updateRecord = (req, res) => {
    conn.sobject(req.objectName).update(req.recordData, (err, result) => {
        if (err || !result.success) {
            res.sendStatus(500);
            console.error(err, result);
        } else {
            res.send({
                data: result.id
            });
        }
    });
};

const query = (req, res, soql) => {
    conn.query(soql, (err, result) => {
        if (err) {
            res.sendStatus(500);
        } else if (result.records.length === 0) {
            res.status(404).send('no records were found.');
        } else {
            res.send({
                data: result.records
            });
        }
    });
};

// eslint-disable-next-line no-undef
exports.sfdx = { login, query, create };

/* eslint-disable no-prototype-builtins */
// Simple Express server setup to serve for local testing/dev API server
/* eslint-disable no-undef */
const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');

const force = require('./force');
const sfdx = require('./sfdx');
// GraphQL
const { graphqlHTTP } = require('express-graphql');
const rootSchema = require('./schema/root');

const dotenv = require('dotenv');
dotenv.config();

const DIST_DIR = './dist';
// const DEV_DIR = './src/client';
const SF_LOGIN_URL = process.env.SF_LOGIN_URL;
const app = express();
app.use(helmet());
app.use(compression());
/*Allow CORS*/
const corsOptions = {
    origin: SF_LOGIN_URL,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

// GraphQL Endpoint for all callouts
app.use('/api/graphql', async (req, res) => {
    // GraphQL Configuration
    graphqlHTTP({
        schema: rootSchema,
        graphiql: true,
        context: req
    })(req, res);
});

app.post('/api/v1/login', (req, res) => {
    force.login(req, res);
});

app.get('/api/v1/sfdx/:category/:command', (req, res) => {
    const category = req.params.category;
    const command = req.params.command;
    const sfdxCommand = `sfdx force:${category}:${command} --json`;
    console.log('sfdxCommand run : ' + sfdxCommand);
    console.log('query params : ' + JSON.stringify(req.query));

    sfdx.runCommand(req, res, sfdxCommand);
});



app.get('/api/v1/user/:userId', (req, res) => {
    console.log('X Get User ID: ' + req.params.userId);
    const soql = `SELECT Id, Name, Email, FullPhotoUrl,LanguageLocaleKey,LastLoginDate FROM User WHERE Id='${req.params.userId}' LIMIT 1`;
    force.query(req, res, soql);
});

app.get('/api/v1/accounts', (req, res) => {
    const soql = `SELECT Id, Name, Type FROM Account LIMIT 100`;
    force.query(req, res, soql);
});

app.post('/api/v1/event/new', convertToRecord, (req, res) => {
    force.create(req, res);
});

const FIELDS = ['Name'];
function convertToRecord(req, res, next) {
    req.objectName = 'Account';
    let objectData = {};
    FIELDS.forEach(field => {
        if (req.body.hasOwnProperty(field)) {
            objectData[field] = req.body[field];
        }
    });
    req.recordData = objectData;
    next();
}

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3002;

app.use(express.static(DIST_DIR));

// Use SPA and ignore any url path locations and always serves index
app.use('*', cors(), (req, res) => {
    res.sendFile(path.resolve(DIST_DIR, 'index.html'));
});




// listen on this port
app.listen(PORT, () =>
    console.log(`✅  Server started: http://${HOST}:${PORT}`)
);
// DEV PORT
// app.listen(3001, () => console.log(`✅  Server started: http://${HOST}:${PORT}`));

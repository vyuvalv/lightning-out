/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const {
    GraphQLList,
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLString,
    GraphQLBoolean,
    GraphQLID
} = require('graphql');
const {
    ListViewItem,
    SObjectOptions,
    UserObject,
    UserUpdateRequest,
    LoginRequest,
    LogoutResponse
} = require('./models/salesforce');

const jsforce = require('jsforce');
const dotenv = require('dotenv');
dotenv.config();
const {
    SF_LOGIN_URL,
    SF_INSTANCE_URL,
    SF_USERNAME,
    SF_PASSWORD,
    SF_TOKEN
} = process.env;

// Stores in local cache the connection details
let activeUser;
let currentUserId;
let organizationId;
let accessToken;
let loginUrl = SF_INSTANCE_URL;
let orgUrl;
let connection = {};

const ServerCredentials = new GraphQLObjectType({
    name: 'ServerCredentials',
    description: 'Env Variables',
    fields: () => ({
        loginUrl: { type: GraphQLString },
        username: { type: GraphQLString },
        password: { type: GraphQLString },
        securityToken: { type: GraphQLString }
    })
});
// Schema for the Login Authentication and other sequential calls information
const AuthResponse = new GraphQLObjectType({
    name: 'AuthResponse',
    description: 'Authentication Details',
    fields: () => ({
        accessToken: { type: GraphQLString },
        instanceUrl: { type: GraphQLString },
        loginUrl: { type: GraphQLString },
        lightningUrl: {
            type: GraphQLString,
            async resolve(parentValue) {
                return parentValue
                    ? parentValue.loginUrl.replace(
                          'my.salesforce.com',
                          'lightning.force.com/'
                      )
                    : '';
            }
        },
        userId: { type: GraphQLString },
        organizationId: { type: GraphQLString },
        loggedInDate: {
            type: GraphQLString,
            async resolve(parentValue, args, context) {
                return new Date().toLocaleString();
            }
        },
        loggedInUser: {
            type: UserObject,
            async resolve(parentValue, args, context) {
                // Update DB User
                activeUser = await getCurrentUser(
                    parentValue.userId,
                    parentValue.accessToken,
                    parentValue.loginUrl
                );
                return activeUser;
            }
        }
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    description: 'Root of all queries',
    fields: {
        // Login to Salesforce
        login: {
            type: AuthResponse,
            args: {
                credentials: { type: LoginRequest }
            },
            async resolve(parentValue, args) {
                // Cache details need refresh after certain time
                let response = AuthResponse;
                // Get details from client app as input and replace .env details
                const {
                    username,
                    password,
                    securityToken,
                    instanceUrl
                } = args.credentials ? args.credentials : {};
                // simple auth connection
                response = await loginToOrg(
                    instanceUrl,
                    username,
                    password,
                    securityToken
                );

                return response;
            }
        },
        getEnvParameters: {
            type: ServerCredentials,
            args: {},
            async resolve() {
                return {
                    loginUrl: SF_LOGIN_URL,
                    username: SF_USERNAME,
                    password: SF_PASSWORD,
                    securityToken: SF_TOKEN
                };
            }
        },
        getUser: {
            type: UserObject,
            args: {
                userId: { type: GraphQLString },
                refresh: { type: GraphQLBoolean }
            },
            async resolve(parentValue, args, context) {
                const { userId, refresh } = args;
                if (!refresh && activeUser) {
                    return activeUser;
                }
                // Update DB
                activeUser = getCurrentUser(userId, accessToken, orgUrl);
                return activeUser;
            }
        },
        getAllObjects: {
            type: SObjectOptions,
            args: {
                fieldName: { type: GraphQLString },
                fieldValue: { type: GraphQLString }
            },
            async resolve(parentValue, args) {
                let response = {
                    sobjects: []
                };

                try {
                    connection = new jsforce.Connection({
                        sessionId: accessToken,
                        serverUrl: orgUrl
                    });
                    const { fieldName, fieldValue } = args;

                    await connection.describeGlobal((err, results) => {
                        if (err) {
                            console.error(err);
                        }

                        // ...
                        if (results && results.sobjects) {
                            const allObjects = results.sobjects;
                            let filteredList = [];

                            filteredList = allObjects.filter(
                                obj =>
                                    (obj.keyPrefix &&
                                        obj.createable &&
                                        obj.queryable &&
                                        obj.deletable) ||
                                    obj.custom
                            );
                            // if (custom) {
                            //     filteredList = [...filteredList].filter(obj => obj.custom);
                            // }

                            if (fieldName && fieldValue) {
                                filteredList = allObjects.filter(
                                    obj =>
                                        obj[fieldName] === fieldValue ||
                                        obj.custom
                                );
                            }

                            // // console.log('res.sobjects 1: ' + JSON.stringify(res.sobjects[0]));
                            response = {
                                sobjects: filteredList,
                                total: filteredList.length
                            };
                            console.log('Num of SObjects : ' + response.total);
                        }
                    });
                } catch (error) {
                    console.log(error);
                    throw new Error(
                        'Cannot fetch all sobjects... ' + error.message
                    );
                }

                return response;
            }
        },
        getListViews: {
            type: SObjectOptions,
            args: {
                objectName: { type: GraphQLString }
            },
            async resolve(parentValue, args) {
                const { objectName } = args;
                let response = {};

                connection = new jsforce.Connection({
                    sessionId: accessToken,
                    serverUrl: orgUrl
                });
                if (connection) {
                    await connection
                        .sobject(objectName)
                        .listviews((err, ret) => {
                            if (err) {
                                console.log(
                                    'ListView Error : ' + JSON.stringify(err)
                                );
                                throw new Error(`${err.name} : ${err.message}`);
                            }
                            //console.log('ret : ' + JSON.stringify(ret.listviews));
                            // const listviewId = ret.listviews[0].id;

                            response = {
                                listviews: [...ret.listviews].map(item => ({
                                    ...item
                                })),
                                total: ret.listviews.length
                            };
                            console.log('response ' + response.total);
                            return { ...response };
                        });
                }
                return { ...response };
            }
        },
        getListViewDetails: {
            type: ListViewItem,
            args: {
                objectName: { type: GraphQLString },
                listViewId: { type: GraphQLString }
            },
            async resolve(parentValue, args) {
                const { objectName, listViewId } = args;
                let response = {};
                connection = new jsforce.Connection({
                    sessionId: accessToken,
                    serverUrl: orgUrl
                });
                if (connection) {
                    await connection
                        .sobject(objectName)
                        .listview(listViewId)
                        .results((err, res) => {
                            if (err) {
                                console.log(
                                    'ListView Error : ' +
                                        JSON.stringify(err.message)
                                );
                                // throw new Error(`${err.name} : ${err.message}`);
                            }

                            const records = res.records.map(rec => rec.columns);
                            response = {
                                ...res,
                                records: records[0]
                            };
                            return response;
                        });
                }
                return response;
            }
        },
        // Logout from Salesforce
        logout: {
            type: LogoutResponse,
            args: {
                userId: { type: GraphQLString }
            },
            async resolve(parentValue, args) {
                let response = {};

                try {
                    connection = new jsforce.Connection({
                        sessionId: accessToken,
                        serverUrl: orgUrl
                    });

                    await connection.logout(function(err) {
                        if (err) {
                            console.error(`${err.name} : ${err.message}`);
                            response = {
                                success: false,
                                errorMessage: `${err.name} : ${err.message}`
                            };
                        } else {
                            // logout successully
                            response = { success: true };
                        }
                    });
                } catch (error) {
                    console.log(error);
                    throw new Error('Cannot Logout... ' + error.message);
                }
                return response;
            }
        }
    }
});

const MutationOperations = new GraphQLObjectType({
    name: 'CRUD',
    description: 'crud operations',
    fields: {
        updateUser: {
            type: UserObject,
            args: {
                fields: { type: UserUpdateRequest }
            },
            async resolve(parentValue, args) {
                const { fields } = args;
                if (!currentUserId || !accessToken) {
                    throw new Error('Must Login before update...');
                }

                const updatedId = await updateRecord(
                    'User',
                    currentUserId,
                    fields,
                    accessToken,
                    orgUrl
                );
                // Update DB
                activeUser = getCurrentUser(updatedId, accessToken, orgUrl);
                return activeUser;
            }
        }
    }
});

async function loginToOrg(sfUrl, username, password, securityToken) {
    console.log('loggin in as : ' + SF_USERNAME);
    connection = new jsforce.Connection({
        loginUrl: sfUrl
    });
    let authObject = AuthResponse;
    try {
        // login
        await connection.login(
            username,
            password + securityToken,
            (err, userInfo) => {
                if (err) {
                    console.log('Login Error : ' + JSON.stringify(err));
                    throw new Error(`${err.name} : ${err.message}`);
                }

                // Stores in cache
                accessToken = connection.accessToken;
                currentUserId = userInfo.id;
                organizationId = userInfo.organizationId;
                orgUrl = userInfo.url;
                console.log('accessToken : ' + accessToken);
                // Build login response
                authObject = {
                    userId: currentUserId,
                    organizationId: organizationId,
                    loginUrl,
                    instanceUrl: orgUrl,
                    accessToken: connection.accessToken
                };
            }
        );
        return authObject;
    } catch (error) {
        throw new Error(`Failed to login => ${error.message}`);
    }
}
async function getCurrentUser(userId, sessionId, serverUrl) {
    let output = {};
    // Restore connection session
    connection = new jsforce.Connection({ sessionId, serverUrl });
    // Get Fields from User Object
    const userFields = Object.keys(UserObject.getFields())
        .map(field => field)
        .join(',');
    // QUERY
    const soql = `SELECT ${userFields} FROM User WHERE Id='${userId}'`;
    // GET RECORD
    try {
        await connection.query(soql, function(err, res) {
            if (err) {
                throw new Error(`Failed to get User => ${err.message}`);
            }
            if (res.records) {
                console.log(`refreshed User ... ${userId}`);
                output = { ...res.records[0] };
            }
            return output;
        });
    } catch (error) {
        throw new Error(`Failed to run query => ${error.message}`);
    }

    return output;
}
async function updateRecord(
    objectName = 'User',
    recordId,
    fields,
    sessionId,
    serverUrl
) {
    let outputId = {};
    // Restore connection session
    connection = new jsforce.Connection({ sessionId, serverUrl });

    // GET RECORD
    try {
        await connection
            .sobject(objectName)
            .update({ ...fields, Id: recordId }, (err, ret) => {
                if (err || !ret.success) {
                    throw new Error(
                        `${err.message} - Code : ${err.errorCode} : ${err.fields}`
                    );
                }
                console.log('Updated Successfully : ' + ret.id);
                outputId = ret.id;
                return outputId;
                //  // Update DB
                // activeUser = getCurrentUser(ret.id, accessToken, orgUrl);
            });
    } catch (error) {
        throw new Error(`Failed to get User => ${error.message}`);
    }

    return outputId;
}

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: MutationOperations
});

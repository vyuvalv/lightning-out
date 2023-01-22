/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLBoolean } = require('graphql');
const { UserObject, UserUpdateRequest, LoginRequest, LogoutResponse } = require('./models/salesforce');

const jsforce = require('jsforce');
require('dotenv').config();
const { SF_LOGIN_URL, SF_USERNAME, SF_PASSWORD , SF_TOKEN} = process.env;

// Stores in local cache the connection details
let authDetails;
let currentUserId = '';
let activeUser;
let accessToken = '';
let orgUrl = '';
let connection = {};

// Schema for the Login Authentication and other sequential calls information
const LoginResponse = new GraphQLObjectType({
    name: 'LoginResponse',
    description: 'Authentication Details',
    fields: () => ({
        success: { type: GraphQLBoolean },
        cached: { type: GraphQLBoolean },
        errorMessage: { type: GraphQLString },
        accessToken: { type: GraphQLString },
        instanceUrl: { type: GraphQLString },
        loginUrl:{ type: GraphQLString },
        userId: { type: GraphQLString },
        organizationId: { type: GraphQLString },
        loggedInDate: {
            type: GraphQLString,
            async resolve(parentValue, args, context) {
                return new Date().toLocaleString();
            },
        },
        loggedInUser: {
            type: UserObject,
            async resolve(parentValue, args, context) {
                // Cached
                if (activeUser) {
                    return activeUser;
                }
                // Get Fields from User Object
                const userFields = Object.keys(UserObject.getFields()).map(field => field).join(',');
                // QUERY
                const soql = `SELECT ${userFields} FROM User WHERE Id='${parentValue.userId}'`;
                
                let response = {};
                console.log('soql query: ' + soql);
                connection = new jsforce.Connection({
                        sessionId : parentValue.accessToken,
                        serverUrl : parentValue.instanceUrl
                    });
               
                // GET RECORD
                await connection.query(soql, function(err, res) {
                    if (err) {
                        throw err;
                    }
                    if (res.records) {
                        console.log('user response: ', res.records);
                        response = res.records[0];
                        activeUser = response;
                    }
                });
                return response;
            },
        },

    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    description: 'Root of all queries',
    fields: {
        // Login to Salesforce
        login: {
            type: LoginResponse,
            args: {
                credentials: { type: LoginRequest },
            },
            async resolve(
                parentValue,
                args
            ) {
                // Cache details
                if (authDetails) {
                    return {
                        success: true,
                        cached:true,
                        ...authDetails,
                        loggedInUser:activeUser
                    };
                }
                    
                // Get details from client app as input and replace .env details
                const { username, password, securityToken, instanceUrl } = args.credentials;

                // simple auth connection
                connection = new jsforce.Connection({
                    loginUrl: SF_LOGIN_URL,
                    instanceUrl
                });
                   
                let response = {};

                try {
                        // login
                        await connection.login(username ? username : SF_USERNAME, password && securityToken ? password + securityToken : SF_PASSWORD + SF_TOKEN, (err, userInfo) => {
                            if (err) {
                                console.log('Login Error : ' + JSON.stringify(err));
                                response = {
                                    success: false,
                                    errorMessage: `${err.name} : ${err.message}`
                                };
                            }
                            else {
                                // Stores in cache
                                authDetails = {
                                    userId: userInfo.id,
                                    organizationId: userInfo.organizationId,
                                    instanceUrl: userInfo.url,
                                    loginUrl: SF_LOGIN_URL,
                                    accessToken: connection.accessToken
                                }
                                accessToken = connection.accessToken;
                                currentUserId = userInfo.id;
                                orgUrl = userInfo.url;
                                // Build login response
                                response = {
                                    success: true,
                                    cached:false,
                                    ...authDetails
                                };
                            }
                        });
                        return response;
                        
                    } catch (e) {
                        console.log(e);
                        throw e;
                    }
            
            }
        },
        // Logout from Salesforce
        logout: {
            type: LogoutResponse,
            args: {},
            async resolve(
                parentValue,
                args
            ) {
                let response = {};

                try {
                    connection = new jsforce.Connection({
                        sessionId : authDetails.accessToken,
                        serverUrl : authDetails.instanceUrl
                    });

                    await connection.logout(function(err) {
                        if (err) {
                            console.error(`${err.name} : ${err.message}`);
                            response = {
                                success: false,
                                errorMessage: `${err.name} : ${err.message}`
                            };
                        }
                        else {
                            // logout successully
                            response = { success:true };
                        }
                       
                    });
                } catch (error) {
                    console.log(error);
                   throw error;
                }
                return response;
            }
        },
    }
});

const MutationOperations = new GraphQLObjectType({
    name: 'CRUD',
    description: 'crud operations',
    fields: {
        update: {
            type: UserObject,
            args: {
                fields: { type: UserUpdateRequest },
            },
            async resolve(
                parentValue,
                args
            ) {
                const { fields } = args;
                let response = {};
                connection = new jsforce.Connection({
                    sessionId : accessToken,
                    serverUrl : orgUrl
                });
                // Update Use Fields
                await connection.sobject("User").update({...fields, Id:currentUserId}, (err, ret) => {
                    if (err || !ret.success) {
                        
                        const errMessage = {
                            success: false,
                            errorMessage: `${err.message} - Code : ${err.errorCode} : ${err.fields}`
                        };
                        console.log(errMessage);
                        response = {
                            ...UserObject, ...fields, State: 'Failed',
                        }
                    }
                
                    console.log('Updated Successfully : ' + ret.id);
                    // Update DB
                    activeUser = { ...activeUser, ...fields };

                    response = {
                        ...activeUser, Id :ret.id,State: 'Success',
                    };
                    
                  });

                  return { ...response };
               
        }
    },
    }
});


module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation:MutationOperations
});
const { GraphQLID, GraphQLString, GraphQLBoolean, GraphQLObjectType, GraphQLInputObjectType } = require('graphql');
// eslint-disable-next-line no-unused-vars
const jsforce = require('jsforce');

// Authentication Request
const LoginRequest = new GraphQLInputObjectType({
    name: 'LoginRequest',
    description: 'User Login Details',
    fields: () => ({
        username: { type: GraphQLString },
        password: { type: GraphQLString },
        securityToken: { type: GraphQLString },
        instanceUrl: { type: GraphQLString }
    })
});
const LogoutResponse = new GraphQLObjectType({
    name: 'LogoutResponse',
    description: 'Logout Details',
    fields: () => ({
        success: { type: GraphQLBoolean },
        errorMessage: { type: GraphQLString },
        timestamp: {
            type: GraphQLString,
            // eslint-disable-next-line no-unused-vars
            async resolve(parentValue, args, context) {
                return new Date().toLocaleString();
            }
        }
    })
});

// Authentication Request
const UserObject = new GraphQLObjectType({
    name: 'UserObject',
    description: 'User Details',
    fields: () => ({
        Id: { type: GraphQLID },
        State: { type: GraphQLString },
        Name: {
            type: GraphQLString,
            async resolve(parentValue) {
                return `${parentValue.FirstName} ${parentValue.LastName}`;
            }
        },
        FirstName: { type: GraphQLString },
        LastName: { type: GraphQLString },
        Email: { type: GraphQLString },
        FullPhotoUrl: { type: GraphQLString },
        LanguageLocaleKey: { type: GraphQLString },
        LastLoginDate: { type: GraphQLString },
    })
});
const UserUpdateRequest = new GraphQLInputObjectType({
    name: 'UserObjectUpdate',
    description: 'User Update Details',
    fields: () =>  ({
        Id: { type: GraphQLID },
        FirstName: { type: GraphQLString },
        LastName: { type: GraphQLString },
        Email: { type: GraphQLString },
        FullPhotoUrl: { type: GraphQLString },
        LanguageLocaleKey: { type: GraphQLString },
    })
});


// eslint-disable-next-line no-undef
module.exports = { LoginRequest, LogoutResponse, UserUpdateRequest, UserObject };
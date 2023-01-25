const { GraphQLID, GraphQLString, GraphQLBoolean, GraphQLList, GraphQLObjectType, GraphQLInputObjectType, GraphQLInt } = require('graphql');
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
const ResponseError = new GraphQLObjectType({
    name: 'ResponseError',
    description: 'Response Error Details',
    fields: () => ({
        success: { type: GraphQLBoolean },
        cached: { type: GraphQLBoolean },
        message: { type: GraphQLString },
    })
});
const SObjectDescribe = new GraphQLObjectType({
    name: 'SObjectDescribe',
    description: 'SObject',
    fields: () => ({
        label: { type: GraphQLString },
        labelPlural: { type: GraphQLString },
        name: { type: GraphQLString },
        activateable: { type: GraphQLBoolean },
        createable: { type: GraphQLBoolean },
        deletable: { type: GraphQLBoolean },
        queryable: { type: GraphQLBoolean },
        layoutable: { type: GraphQLBoolean },
        custom: { type: GraphQLBoolean },
        customSetting: { type: GraphQLBoolean },
        feedEnabled: { type: GraphQLBoolean },
        keyPrefix: { type: GraphQLString }
    })
});

const ColumnItem = new GraphQLObjectType({
    name: 'ColumnItem',
    description: 'Field Column Item',
    fields: () => ({
        fieldNameOrPath: { type: GraphQLString },
        label:{ type: GraphQLString },
        type: { type: GraphQLString },
        sortDirection: { type: GraphQLString },
        value:{ type: GraphQLString }
    })
});
const ListViewItem = new GraphQLObjectType({
    name: 'ListViewItem',
    description: 'ListViews Item',
    fields: () => ({
        id: { type: GraphQLString },
        developerName:{ type: GraphQLString },
        label: { type: GraphQLString },
        columns: { type: new GraphQLList(ColumnItem) },
        records: { type: new GraphQLList(ColumnItem) }
    })
});

const SObjectOptions = new GraphQLObjectType({
    name: 'SObjectOptions',
    description: 'SObject List',
    fields: () => ({
        sobjects: { type: new GraphQLList(SObjectDescribe) },
        listviews:  { type: new GraphQLList(ListViewItem) },
        total:{ type: GraphQLInt }
    })
});

// Authentication Request
const UserObject = new GraphQLObjectType({
    name: 'UserObject',
    description: 'User Details',
    fields: () => ({
        Id: { type: GraphQLID },
        Name: { type: GraphQLString },
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
module.exports = { LoginRequest, LogoutResponse, UserUpdateRequest, UserObject, ResponseError , SObjectOptions, ListViewItem };
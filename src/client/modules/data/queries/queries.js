export const AuthLoginQuery = (username, password, securityToken, loginUrl) => {
    return {
        query: `{
            login( 
              credentials : {
                username:"${username}", 
                password:"${password}",
                securityToken:"${securityToken}",
                instanceUrl:"${loginUrl}"
              }){
                userId,
                organizationId,
                instanceUrl,
                lightningUrl,
                loginUrl,
                accessToken,
                loggedInUser{ Id Name FirstName LastName Email FullPhotoUrl LanguageLocaleKey LastLoginDate }
            }
          }`
    };
};
export const CredentialsQuery = {
    query: `{
            getEnvParameters{
             loginUrl
             username
             password
             securityToken
           }
        }`
};

export const AuthQuery = () => {
    return {
        query: `{
            login {
                userId,
                loggedInUser{ Id Name Email FullPhotoUrl LanguageLocaleKey LastLoginDate }
            }
          }`
    };
};
export const UserDataQuery = (userId = '', refresh = false) => {
    return {
        query: `{
            getUser (userId:"${userId}" refresh:${refresh}){
                Id Name FirstName LastName  Email FullPhotoUrl LanguageLocaleKey LastLoginDate
            }
          }`
    };
};

export const UpdateUserQuery = (record = `{ FirstName: "Y"}`) => {
    return {
        query: `mutation {
                updateUser( fields :${record}){  Id Name FirstName LastName Email FullPhotoUrl LanguageLocaleKey LastLoginDate }
            }`
    };
};

/* List Views */
export const ListViewsDetailsQuery = (
    objectName = 'Account',
    listViewId = ''
) => {
    return {
        query: `{
            getListViewDetails(
                objectName:"${objectName}", 
                listViewId:"${listViewId}"
              ){
                  id
                  developerName
                  label
                columns{
                  fieldNameOrPath
                  type
                  label
                }
                records{
                  index
                  fields{
                    fieldNameOrPath
                    value
                  }
                }
              }
          }`
    };
};

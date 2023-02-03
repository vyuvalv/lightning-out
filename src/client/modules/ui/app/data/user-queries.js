export const UserQuery = (params = { username: '' , password: ''}) => {
    const { username, password } = params;
    return {
        query: `{
            login( 
              credentials : {
                username:"${username}", 
                password:"${password}",
                securityToken:"",
                instanceUrl:""
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
}
export const AuthQuery = () => {
    return {
        query: `{
            login {
                userId,
                loggedInUser{ Id Name FirstName LastName  Email FullPhotoUrl LanguageLocaleKey LastLoginDate }
            }
          }`
    };
}
export const UserDataQuery = () => {
    return {
        query: `{
            getUser {
                Id Name FirstName LastName  Email FullPhotoUrl LanguageLocaleKey LastLoginDate
            }
          }`
    };
}


export const UpdateUserQuery = (record = `{ FirstName: "Y"}`) => {
    
    return {
        query: `mutation {
                updateUser( fields :${record}){  Id Name FirstName LastName Email FullPhotoUrl LanguageLocaleKey LastLoginDate }
            }`
    };
}


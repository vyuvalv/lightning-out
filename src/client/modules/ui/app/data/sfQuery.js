export const UserQuery = (username='') => {
    return {
        query: `{
            login( 
              credentials : {
                username:"${username}", 
                password:"",
                securityToken:"",
                instanceUrl:""
              }){
                userId,
                organizationId,
                instanceUrl,
                accessToken,
                loginUrl,
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
                loggedInUser{ Id Name Email FullPhotoUrl LanguageLocaleKey LastLoginDate }
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


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
                loggedInUser{ Id Name Email FullPhotoUrl LanguageLocaleKey LastLoginDate }
            }
          }`
    };
}
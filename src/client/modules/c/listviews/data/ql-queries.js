export const AllObjectsQuery = () => {
    return {
        query: `{
            getAllObjects{
              sobjects{
                name
                label
                labelPlural
              }
            }
          }`
    };
};
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

export const ListViewsQuery = (objectName = 'Account') => {
    return {
        query: `{
            getListViews(objectName: "${objectName}") {
              total
              listviews {
                id
                developerName
                label
              }
            }
          }`
    };
};

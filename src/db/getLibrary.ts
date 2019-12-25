import { Library } from "../models/Library"

export const getLibrary = ({ gapi, id }): Library => {
    gapi.client.drive.files.export({
        fileId: id,
        mimeType: ''
        // fields: "nextPageToken,items(id,title,properties)",
    })

    return {} as Library;
}
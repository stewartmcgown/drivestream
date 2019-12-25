import { Library } from "../models/Library";

/**
 * Creates a library in Google Drive. 
 */
export const createLibrary = async ({ folderId, name, type }): Promise<Library> => {
    const { result: driveFile } = await gapi.client.drive.files.create({
        resource: {
            name,
            mimeType: 'application/json',
            properties: [{
                drivestream: 'library',
            }]
        },
        fields: '*'
    })

    if (!driveFile.id) throw new Error();

    await gapi.client.drive.files.update({
        fileId: driveFile.id,
        removeParents: 'root'
    })

    const library = new Library(driveFile.id, name, type, 'AT_REST');

    // Write library information as JSON
    await gapi.client.request({
        path: '/upload/drive/v3/files/' + driveFile.id,
        method: 'PATCH',
        params: {
          uploadType: 'media'
        },
        body: JSON.stringify(library)
    })

    return library;
}
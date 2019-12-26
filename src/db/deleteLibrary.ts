import { Library, LibraryType } from "../models/Library";

export interface DeleteLibraryOptions {
    id: string;
}

/**
 * Creates a library in Google Drive. 
 */
export const deleteLibrary = async ({ id }: DeleteLibraryOptions): Promise<boolean> => {
    await (gapi.client.drive.files as any).update({
        fileId: id,
        resource: {
            trashed: true
        }
    })

    return true;
}
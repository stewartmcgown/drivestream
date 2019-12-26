import { plainToClass } from 'class-transformer';
import { Library, LibraryType } from "../models/Library";
import { createDrivestreamFileType } from "./util/createDrivestreamFile";

export interface CreateLibraryOptions {
    folderIds: string[];

    name: string;

    type: LibraryType;
}

/**
 * Creates a library in Google Drive. 
 */
export const createLibrary = async ({ folderIds, name, type }: CreateLibraryOptions): Promise<Library> => {
    const driveFile = await createDrivestreamFileType({  name, type: 'library' })

    if (!driveFile.id) throw new Error();

    const library = plainToClass(Library, {
        id: driveFile.id,
        folders: folderIds,
        name,
        status: 'AT_REST',
        type,
        mediaItems: {}
    })

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
import { DriveIOError } from "../errors/DriveIOError";
import { Library } from "../../models/Library";

export type DrivestreamFileType = 'library' | 'config';

export interface CreateDrivestreamFileOptions {
    name: string;

    type: DrivestreamFileType;

    body?: string;
}

/**
 * Creates a library in Google Drive. 
 */
export const createDrivestreamFileType = async ({ name, type, body }: CreateDrivestreamFileOptions): Promise<gapi.client.drive.File> => {
    const response = await gapi.client.drive.files.create({
        resource: {
            name,
            mimeType: 'application/json',
            properties: [{
                drivestream: type,
            }]
        },
        fields: '*'
    })

    let { result: driveFile } = response;

    if (!driveFile.id) throw new DriveIOError('Failed to create file in Drive', response);

    await gapi.client.drive.files.update({
        fileId: driveFile.id,
        removeParents: 'root'
    })

    if (body) {
        // Write library information as JSON
        await gapi.client.request({
            path: '/upload/drive/v3/files/' + driveFile.id,
            method: 'PATCH',
            params: {
            uploadType: 'media'
            },
            body
        })
    }

    return driveFile;
}
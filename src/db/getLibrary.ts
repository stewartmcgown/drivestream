import { Library } from "../models/Library"
import { plainToClass } from 'class-transformer';

export const getLibrary = async ({ id }): Promise<Library> => {
    const response = await gapi.client.drive.files.get({
        fileId: id,
        alt: 'media'
    })

    // This would be a good place for plainToClass!
    return plainToClass(Library, response.result, { excludeExtraneousValues: true });
}
import { Maybe } from "../../utils/maybe"

export const updateDrivestreamFile = async ({ id, body, props }: { id: string, body?: any, props?: any}): Promise<Maybe<gapi.client.drive.File>> => {
    // metadata only
    if (!body && props)
        return await (gapi.client.drive.files.update as any)({
            fileId: id,
            resource: {
                ...props
            }
        })

    // file only
    if (body)
        return (await gapi.client.request({
            path: '/upload/drive/v3/files/' + id,
            method: 'PATCH',
            params: {
                uploadType: 'media'
            },
            body
        })).result as gapi.client.drive.File;
}
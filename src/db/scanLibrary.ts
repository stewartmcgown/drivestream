import { Library, LibraryType } from "../models/Library";
import { createDrivestreamFileType } from "./util/createDrivestreamFile";
import { getLibrary } from "./getLibrary";
import { MediaItem } from "../models/MediaItem";
import { updateLibrary } from "./updateLibrary";
import { dispatch } from "../store";
import MetadataEngine from "../engine/MetadataEngine";

const UNSUPPORTED_FILE_TYPES = ["video/mp2t", "video/ts"];

const networkStatus = {
    activeRequests: 0,
}

export interface ScanLibraryDelta { 
    totalFiles: number;
    done?: boolean;
}

export interface ScanLibraryOptions {
    id: string;

    update: (delta: ScanLibraryDelta) => void;
}

const printUnsupportedMimeTypes = () => UNSUPPORTED_FILE_TYPES.map(t => `mimeType contains '${t}'`).join(' or ');

const generateParentsQueryFragment = (parents: string[]) => '(' + parents.map((id) => `'${id}' in parents`).join(' or ') + ')';

export const scanLibrary = async ({ id, update }: ScanLibraryOptions): Promise<Library> => {
    const library = await getLibrary({ id });
    let discoveredFiles = 0;

    /**
     * Find new files from the batch and insert them into the library
     * 
     * @param files to parse
     */
    const processMediaFileBatch = async (files: gapi.client.drive.File[]) => {
        files.forEach(f => {
            if (!f.id) throw new Error('Memory corruption');

            const libraryEntry = library.mediaItems[f.id];
            if (libraryEntry !== undefined && f.size) {
                // Is the library item different from the file in drive
                if (libraryEntry.size !== Number.parseInt(f.size)) {
                    // do update
                }
            } else {
                const newLibraryEntry = MediaItem.fromGoogleDriveFile(f);
                library.mediaItems[newLibraryEntry.id] = newLibraryEntry; 
            }
        });

        // Update changed library
        await updateLibrary({ library });
        update({
            totalFiles: discoveredFiles += files.length
        })
    }

    const recursiveSearch = async (parents: string[], nextPageToken = '') => {
        if (!parents.length) return;
        const { result } = await gapi.client.drive.files.list({
            q: `${generateParentsQueryFragment(parents)} and not (${printUnsupportedMimeTypes()}) and (mimeType contains 'video/' or mimeType contains 'application/vnd.google-apps.folder') and not (name contains 'sample')`,
            fields: "nextPageToken,files(id,name,size,mimeType,videoMediaMetadata,thumbnailLink)",
			pageToken: nextPageToken,
        })

        const folders: string[] = [], files: gapi.client.drive.File[] = [];
        result.files?.forEach(f => f.mimeType === 'application/vnd.google-apps.folder' ? folders.push(f.id!) : files.push(f));

        console.log(folders);

        await processMediaFileBatch(files);

        return recursiveSearch(folders, nextPageToken);
    }

    const updateAllMetadata = async () => {
        for (const mediaItem of Object.values(library.mediaItems)) {
            dispatch({ type: 'updateSnackbar', payload: { message: `Matching ${mediaItem.title}...`}})
            const metadata = await MetadataEngine.getMetadata({
                mediaItem,
                library,
            });

            if (metadata) {
                // Apply metadata to mediaItem
                mediaItem.updateMetadata(metadata);

                await updateLibrary({ library });
            }
        }
    }

   recursiveSearch(library.folders)
    .then(a => dispatch({ type: 'closeSnackbar' }))
    .then(updateAllMetadata);

    return library;
}
import { MediaItem } from "./MediaItem";

export type LibraryType = 'TV' | 'Movies' | 'Audiobooks';
export type LibraryStatus = 'AT_REST' | 'INDEXING_FILES' | 'UPDATING_METADATA';

export class Library {
    constructor(
        public id: string,
        public folders: string[],
        public name: string,
        public type: LibraryType,
        public status: LibraryStatus,
        public mediaItems?: MediaItem[]
        ) {

        }
}
import { MediaItem } from "./MediaItem";
import { Expose, Transform, plainToClass } from 'class-transformer';
import { Default } from "../utils/default";

export type LibraryType = 'TV' | 'Movies' | 'Audiobooks';
export type LibraryStatus = 'AT_REST' | 'INDEXING_FILES' | 'UPDATING_METADATA';
export type LibraryMediaItems = { [key: string]: MediaItem };

export class Library {
    @Expose() public id: string;
    @Expose() public folders: string[];
    @Expose() public name: string;
    @Expose() public type: LibraryType;
    @Expose() public status: LibraryStatus;
    @Expose() 
    @Transform((m: LibraryMediaItems) => m ? Object.values(m).reduce((acc, r) => (acc[r.id] = plainToClass(MediaItem, r), acc), m) : {}) 
    public mediaItems: LibraryMediaItems  = {};
}
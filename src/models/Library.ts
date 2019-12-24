export type LibraryType = 'TV' | 'Movies' | 'Audiobooks';

export class Library {
    constructor(
        public id: string,
        public title: string,
        public type: LibraryType,
        ) {

        }
}
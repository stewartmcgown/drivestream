export type LibraryType = 'TV' | 'Movies' | 'Audiobooks';

export class Library {
    constructor(
        public id: string,
        public name: string,
        public type: LibraryType,
        ) {

        }
}
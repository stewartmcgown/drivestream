import { Library, LibraryType } from "../models/Library";
import { updateDrivestreamFile } from "./util/updateDrivestreamFile";

export interface UpdateLibraryOptions {
    library: Library;
}

export const updateLibrary = async ({ library }: UpdateLibraryOptions): Promise<Library> => {
    await updateDrivestreamFile({
        id: library.id,
        body: JSON.stringify(library),
    })

    return library;
}
import { Library } from "../models/Library";

export interface Store {
    libraries: Library[];

    auth: any;
}

export const DefaultStore: Store = {
    libraries: [],
    auth: {
    }
}
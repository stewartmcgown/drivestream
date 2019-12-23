import { Library } from "../models/Library";

export interface AuthStore {
    name: string;

    accessToken: string;
}

export interface Store {
    libraries: Library[];

    auth: AuthStore;
}

export const DefaultStore: Store = {
    libraries: [],
    auth: {
        name: '',
        accessToken: ''
    }
}
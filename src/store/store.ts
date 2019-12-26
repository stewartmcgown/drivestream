import { Subject } from 'rxjs';
import { Library } from "../models/Library";

export interface Store {
    libraries: Library[];

    auth: any;

    events: EventStore;

    snackbar: { open: boolean, message: string };
}

export interface EventStore {
    
}

const eventSubject = new Subject();

export const DefaultStore: Store = {
    libraries: [],
    auth: {
    },
    events: {},
    snackbar: {
        open: false,
        message: '',
    },
}
import { Store } from "./store";

export interface Action {
    type: string;

    payload: any;
}

export const Reducer = (state: Store, action: Action): Store => {
    return {
        ...state
    }
}
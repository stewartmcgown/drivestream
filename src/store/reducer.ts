import { Store } from "./store";
import * as actions from './actions';
import { mergeDeep } from "../utils/mergeDeep";

export interface Action {
    type: keyof typeof actions;

    payload: any;
}

export type ActionFunction = (payload: any) => object;

export const Reducer = (state: Store, action: Action): Store => {
    if (actions[action.type] instanceof Function)
        return mergeDeep({}, state, actions[action.type](action.payload))

    return mergeDeep({}, state, action.payload);
}